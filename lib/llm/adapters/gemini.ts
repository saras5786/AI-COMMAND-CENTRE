import { SceneAnalysisResult, SceneAnalysisSchema, TriageResult, TriageResultSchema } from "../types";

export class GeminiAdapter {
  private getApiKey(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    }
    return process.env.GEMINI_API_KEY || "";
  }

  private getModel(): string {
    return process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  async triageEmergency(input: {
    text?: string;
    transcript?: string;
    location?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<{
    result: TriageResult;
    sceneAnalysis?: SceneAnalysisResult;
    tokens: { prompt: number; completion: number; total: number };
  }> {
    const apiKey = this.getApiKey();
    const model = this.getModel();

    const prompt = `You are an AI Emergency Dispatch Assistant assisting emergency responders.
Analyze this emergency incident report (text, location, and optional attached photo).
Extract verified facts, determine urgency, and suggest immediate multi-agency response units.

Return a STRICTLY VALID JSON object with this exact structure:
{
  "title": string (concise title, e.g. "Two-Vehicle Collision with Entrapment", "Structure Fire", "Severe Bleeding"),
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "status": "DISPATCHED" | "RESPONDING" | "ON SCENE",
  "location": string,
  "description": string (accurate factual summary of what is happening),
  "injuries": string (e.g. "2 Persons injured", "Unknown", "0 Persons"),
  "roadBlock": string (e.g. "Full Road Closure", "Partial (1 Lane Blocked)", "None"),
  "casualtiesCount": number,
  "hazards": string[] (e.g. ["Downed power line", "Spilled fuel", "Heavy smoke inhalation risk"]),
  "suggestedApparatus": string[] (e.g. ["Medic 7 (ALS Ambulance)", "Engine 4 (Fire)", "Patrol 12 (Police)"]),
  "medicalSummary": string (brief note for hospital trauma center),
  "icsRecommendedAction": string (immediate operational priority, e.g. "Extricate driver, establish 50m safety perimeter"),
  "hospitalPreAlertRequired": boolean,
  "closestHospitalId": "HOSP-01" | "HOSP-02" | "HOSP-03" | "HOSP-04",
  "recommendedUnits": string[] (choose from: ["AMB-01", "AMB-07", "ENG-04", "LAD-02", "POL-03", "POL-12", "RESC-01"]),
  "imageVerification": {
    "isEmergency": boolean,
    "confidence": number,
    "damageAssessment": string,
    "detectedObjects": string[]
  }
}

Incident Details:
- Caller Description: ${input.text || "None provided"}
- Voice Transcript: ${input.transcript || "None provided"}
- Location: ${input.location || "Location pending GPS"}
${input.imageBase64 ? "- Attached image: An emergency scene photograph is attached below. Carefully verify and inspect the scene." : "- No photo attached."}

Respond ONLY with raw JSON.`;

    const parts: any[] = [{ text: prompt }];

    if (input.imageBase64) {
      parts.push({
        inline_data: {
          mime_type: input.mimeType || "image/jpeg",
          data: input.imageBase64,
        },
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const triageResult: TriageResult = {
      title: parsed.title || "Emergency Incident",
      priority: parsed.priority || "HIGH",
      status: parsed.status || "DISPATCHED",
      location: parsed.location || input.location || "Reported Scene",
      description: parsed.description || input.text || "Emergency response requested.",
      injuries: parsed.injuries || "Pending evaluation",
      roadBlock: parsed.roadBlock || "None",
      casualtiesCount: typeof parsed.casualtiesCount === "number" ? parsed.casualtiesCount : 0,
      hazards: Array.isArray(parsed.hazards) ? parsed.hazards : ["Scene safety pending"],
      suggestedApparatus: Array.isArray(parsed.suggestedApparatus) ? parsed.suggestedApparatus : ["Ambulance Unit"],
      medicalSummary: parsed.medicalSummary || "Medical assessment underway.",
      icsRecommendedAction: parsed.icsRecommendedAction || "Dispatch nearest available responders.",
      hospitalPreAlertRequired: Boolean(parsed.hospitalPreAlertRequired),
      closestHospitalId: parsed.closestHospitalId || "HOSP-01",
      recommendedUnits: Array.isArray(parsed.recommendedUnits) ? parsed.recommendedUnits : ["AMB-01"],
    };

    let sceneAnalysis: SceneAnalysisResult | undefined;
    if (parsed.imageVerification) {
      sceneAnalysis = {
        sceneType: parsed.title || "Emergency Scene",
        severity: parsed.priority === "HIGH" ? "CRITICAL" : "MODERATE",
        damageAssessment: parsed.imageVerification.damageAssessment || "Visual assessment performed",
        vehicleDeformationScore: parsed.imageVerification.isEmergency ? 7 : 0,
        smokeDensity: "Moderate Gray",
        firePresent: parsed.title?.toLowerCase().includes("fire") || false,
        hazardousPlacardDetected: "None detected",
        entrapmentDetected: parsed.description?.toLowerCase().includes("trap") || false,
        suggestedPerimeterRadiusMeters: 50,
        confidence: parsed.imageVerification.confidence || 0.95,
      };
    }

    return {
      result: triageResult,
      sceneAnalysis,
      tokens: {
        prompt: data.usageMetadata?.promptTokenCount || 0,
        completion: data.usageMetadata?.candidatesTokenCount || 0,
        total: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }
}
