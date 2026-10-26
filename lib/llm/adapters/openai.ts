import { TriageResult, TriageResultSchema, CommandSheetStrategy, CommandSheetStrategySchema } from "../types";

export class OpenAIAdapter {
  private getApiKey(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openai_api_key") || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    }
    return process.env.OPENAI_API_KEY || "";
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  async generateCommandStrategy(title: string, location: string, description: string): Promise<{
    result: CommandSheetStrategy;
    tokens: { prompt: number; completion: number; total: number };
  }> {
    const apiKey = this.getApiKey();
    const model = this.getModel();

    const prompt = `You are a Senior FEMA Incident Commander and ICS-201/204 Tactical Lead for 911 dispatch.
Provide an operational command strategy for Incident: "${title}" at "${location}".
Description: ${description}

Return a valid JSON object matching:
{
  "incidentCommanderNotes": string,
  "femaIcsForm": string,
  "operationalPeriod": string,
  "safetyOfficerDirectives": string[],
  "evacuationZoneRadius": string,
  "stagingAreaLocation": string,
  "interoperabilityChannels": string[],
  "hospitalSurgePlan": string
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const validated = CommandSheetStrategySchema.parse(parsed);

    return {
      result: validated,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
    };
  }
}
