import { z } from "zod";

export type LLMTask =
  | "emergency_triage"
  | "scene_vision_analysis"
  | "voice_audio_dispatch"
  | "ics_command_strategy";

export interface LLMMetadata {
  provider: "groq" | "google" | "openai" | "anthropic" | "mock-neural-core" | "local-cad-engine";
  model: string;
  latencyMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  costEstimatedUsd: number;
  timestamp: string;
}

// Structured schema for Triage Output
export const TriageResultSchema = z.object({
  title: z.string(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["RESPONDING", "DISPATCHED", "ON SCENE", "INVESTIGATING", "CONTAINED", "SCHEDULED"]),
  location: z.string(),
  description: z.string(),
  injuries: z.string(),
  roadBlock: z.string(),
  casualtiesCount: z.number().default(0),
  hazards: z.array(z.string()),
  suggestedApparatus: z.array(z.string()),
  medicalSummary: z.string(),
  icsRecommendedAction: z.string(),
  hospitalPreAlertRequired: z.boolean().default(false),
  closestHospitalId: z.string().optional(),
  recommendedUnits: z.array(z.string()),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

// Schema for Scene Image Analysis
export const SceneAnalysisSchema = z.object({
  sceneType: z.string(),
  severity: z.enum(["CRITICAL", "HIGH", "MODERATE", "LOW"]),
  damageAssessment: z.string(),
  vehicleDeformationScore: z.number().min(0).max(10), // 0 to 10
  smokeDensity: z.enum(["None", "Light White", "Moderate Gray", "Heavy Black Toxic"]),
  firePresent: z.boolean(),
  hazardousPlacardDetected: z.string().optional(),
  entrapmentDetected: z.boolean(),
  suggestedPerimeterRadiusMeters: z.number(),
  confidence: z.number(),
});

export type SceneAnalysisResult = z.infer<typeof SceneAnalysisSchema>;

// Schema for Voice Audio Dispatch
export const VoiceDispatchSchema = z.object({
  transcript: z.string(),
  callerEmotionalState: z.enum(["PANICKED", "DISTRESSED", "CALM", "DISORIENTED"]),
  stressScore: z.number().min(0).max(100),
  backgroundAcoustics: z.array(z.string()), // e.g. ["screaming", "sirens", "car horns", "glass breaking"]
  urgencyLevel: z.enum(["IMMEDIATE_LIFE_THREAT", "HIGH", "ROUTINE"]),
  extractedKeyDetails: z.array(z.string()),
});

export type VoiceDispatchResult = z.infer<typeof VoiceDispatchSchema>;

// Schema for ICS Command Sheet Strategy
export const CommandSheetStrategySchema = z.object({
  incidentCommanderNotes: z.string(),
  femaIcsForm: z.string(), // e.g. "ICS-201 Incident Briefing"
  operationalPeriod: z.string(),
  safetyOfficerDirectives: z.array(z.string()),
  evacuationZoneRadius: stringOrNumber(),
  stagingAreaLocation: z.string(),
  interoperabilityChannels: z.array(z.string()),
  hospitalSurgePlan: z.string(),
});

function stringOrNumber() {
  return z.union([z.string(), z.number()]);
}

export type CommandSheetStrategy = z.infer<typeof CommandSheetStrategySchema>;
