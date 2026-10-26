import { LLMTask, LLMMetadata, TriageResult, SceneAnalysisResult, VoiceDispatchResult, CommandSheetStrategy } from "./types";
import { GroqLlamaAdapter } from "./adapters/groq-llama";
import { GeminiAdapter } from "./adapters/gemini";
import { OpenAIAdapter } from "./adapters/openai";
import { MockNeuralCore } from "./adapters/mock-engine";

export class CentralizedLLMService {
  private groq = new GroqLlamaAdapter();
  private gemini = new GeminiAdapter();
  private openai = new OpenAIAdapter();

  /**
   * Check if any real LLM provider is connected via API key
   */
  getConnectedProvider(): { name: string; isReal: boolean } {
    if (this.gemini.isAvailable()) return { name: "Google Gemini 1.5 Flash", isReal: true };
    if (this.groq.isAvailable()) return { name: "Meta Llama 3.1 70B (Groq)", isReal: true };
    if (this.openai.isAvailable()) return { name: "OpenAI GPT-4o-mini", isReal: true };
    return { name: "Built-in Emergency Heuristics", isReal: false };
  }

  /**
   * Triage an emergency using Gemini 1.5 Flash or Groq Llama 3.1
   * Fallback: Built-in deterministic emergency heuristic engine
   */
  async triageEmergency(input: {
    text?: string;
    transcript?: string;
    location?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<{ data: TriageResult; sceneAnalysis?: SceneAnalysisResult; meta: LLMMetadata }> {
    const startTime = Date.now();

    // 1. Prioritize Google Gemini 1.5 Flash (Multimodal vision + reasoning)
    if (this.gemini.isAvailable()) {
      try {
        const { result, sceneAnalysis, tokens } = await this.gemini.triageEmergency(input);
        const latencyMs = Date.now() - startTime;
        return {
          data: result,
          sceneAnalysis,
          meta: {
            provider: "google",
            model: "gemini-1.5-flash",
            latencyMs,
            tokensUsed: tokens,
            costEstimatedUsd: (tokens.total / 1000000) * 0.35,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (err) {
        console.warn("Gemini triage failed, trying secondary adapter:", err);
      }
    }

    // 2. Secondary: Groq Llama 3.1 70B (Fast text reasoning)
    if (this.groq.isAvailable()) {
      try {
        const { result, tokens } = await this.groq.triageEmergency(input);
        const latencyMs = Date.now() - startTime;
        return {
          data: result,
          meta: {
            provider: "groq",
            model: "llama-3.1-70b-versatile",
            latencyMs,
            tokensUsed: tokens,
            costEstimatedUsd: (tokens.total / 1000000) * 0.79,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (err) {
        console.warn("Groq Llama triage failed, falling back to built-in engine:", err);
      }
    }

    // 3. Fallback: Built-in client engine
    const result = await MockNeuralCore.triageEmergency(input);
    const latencyMs = Date.now() - startTime;
    return {
      data: result,
      meta: {
        provider: "local-cad-engine",
        model: "built-in-dispatcher-v1",
        latencyMs,
        tokensUsed: { prompt: 210, completion: 145, total: 355 },
        costEstimatedUsd: 0.0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Scene Computer Vision Analysis
   */
  async analyzeScene(imageBase64?: string): Promise<{ data: SceneAnalysisResult; meta: LLMMetadata }> {
    const startTime = Date.now();
    const result = await MockNeuralCore.analyzeSceneVision(imageBase64);
    const latencyMs = Date.now() - startTime;
    return {
      data: result,
      meta: {
        provider: "local-cad-engine",
        model: "built-in-scene-vision",
        latencyMs,
        tokensUsed: { prompt: 150, completion: 110, total: 260 },
        costEstimatedUsd: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 911 Caller Voice Audio Dispatch
   */
  async transcribeVoice(scenarioKey?: string): Promise<{ data: VoiceDispatchResult; meta: LLMMetadata }> {
    const startTime = Date.now();
    const result = await MockNeuralCore.transcribeVoiceDispatch(scenarioKey);
    const latencyMs = Date.now() - startTime;
    return {
      data: result,
      meta: {
        provider: "local-cad-engine",
        model: "built-in-voice-dispatch",
        latencyMs,
        tokensUsed: { prompt: 180, completion: 90, total: 270 },
        costEstimatedUsd: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Incident Command System Strategy Sheet (Claude / GPT-4o / Local)
   */
  async generateCommandStrategy(
    title: string,
    location: string,
    description: string
  ): Promise<{ data: CommandSheetStrategy; meta: LLMMetadata }> {
    const startTime = Date.now();

    if (this.openai.isAvailable()) {
      try {
        const { result, tokens } = await this.openai.generateCommandStrategy(title, location, description);
        const latencyMs = Date.now() - startTime;
        return {
          data: result,
          meta: {
            provider: "openai",
            model: "gpt-4o-mini",
            latencyMs,
            tokensUsed: tokens,
            costEstimatedUsd: (tokens.total / 1000000) * 0.15,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (err) {
        console.warn("OpenAI ICS command strategy failed, falling back:", err);
      }
    }

    const result = await MockNeuralCore.generateCommandStrategy(title, location);
    const latencyMs = Date.now() - startTime;
    return {
      data: result,
      meta: {
        provider: "local-cad-engine",
        model: "fema-ics-201-standard",
        latencyMs,
        tokensUsed: { prompt: 310, completion: 220, total: 530 },
        costEstimatedUsd: 0.0,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const llmService = new CentralizedLLMService();

export async function executeTriageReport(input: {
  text?: string;
  transcript?: string;
  location?: string;
  imageBase64?: string | null;
}) {
  const triage = await llmService.triageEmergency({
    text: input.text,
    transcript: input.transcript,
    location: input.location,
    imageBase64: input.imageBase64 || undefined,
  });

  const isReal = triage.meta.provider !== "local-cad-engine";

  const newIncident = {
    id: "inc-" + Date.now(),
    code: "INC-" + Math.floor(1043 + Math.random() * 50),
    title: triage.data.title,
    priority: triage.data.priority,
    status: triage.data.status,
    location: triage.data.location,
    description: triage.data.description,
    reportedAt: new Date().toISOString(),
    assignedUnits: triage.data.recommendedUnits,
    injuries: triage.data.injuries,
    roadBlock: triage.data.roadBlock,
    coordinates: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05,
    },
    aiAnalysis: {
      modelUsed: isReal ? `${triage.meta.model} (${triage.meta.provider.toUpperCase()})` : "Built-in Emergency Classifier",
      inferenceLatency: `${(triage.meta.latencyMs / 1000).toFixed(2)}s`,
      confidenceScore: isReal ? 0.98 : 0.94,
      hazards: triage.data.hazards,
      suggestedApparatus: triage.data.suggestedApparatus,
      medicalSummary: triage.data.medicalSummary,
      icsRecommendedAction: triage.data.icsRecommendedAction,
    },
    sceneVision: triage.sceneAnalysis || null,
  };

  return {
    success: true,
    incident: newIncident,
    triageMeta: triage.meta,
    isRealLLM: isReal,
  };
}
