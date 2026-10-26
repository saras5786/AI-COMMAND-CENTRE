"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Mic,
  Camera,
  MapPin,
  Sparkles,
  Radio,
  CheckCircle2,
  Car,
  Flame,
  HeartPulse,
  UploadCloud,
  Crosshair,
  Volume2,
} from "lucide-react";
import { useCommandCenterStore } from "@/lib/store";
import { soundFX } from "@/lib/sound";
import { executeTriageReport } from "@/lib/llm";

export default function ReportEmergencyPage() {
  const router = useRouter();
  const { addIncident } = useCommandCenterStore();

  const [textReport, setTextReport] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStressScore, setVoiceStressScore] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [address, setAddress] = useState("East Gate Road & 4th Ave, Sector 7");
  const [latitude, setLatitude] = useState("37.7749 N");
  const [longitude, setLongitude] = useState("122.4194 W");
  const [isTriageSubmitting, setIsTriageSubmitting] = useState(false);
  const [triageSuccessResult, setTriageSuccessResult] = useState<any | null>(null);

  // Quick Scenarios
  const loadScenario = (type: "crash" | "fire" | "medical") => {
    soundFX.blip(750, 0.04);
    if (type === "crash") {
      setTextReport("Multi-vehicle collision near East Gate Road and 4th Ave. Two people injured, one passenger trapped. Gasoline leaking on road.");
      setVoiceTranscript("Caller audio: 'Two cars smashed hard, one driver can't open door, traffic is completely blocked!'");
      setAddress("East Gate Road & 4th Ave, Sector 7");
      setLatitude("37.7749 N");
      setLongitude("122.4194 W");
      setVoiceStressScore(86);
      setImageName("scene_crash_telemetry.jpg");
    } else if (type === "fire") {
      setTextReport("Structural electrical fire reported at commercial office complex. Heavy smoke billowing from 3rd floor HVAC, people evacuating.");
      setVoiceTranscript("Caller audio: 'Third floor office has fire alarms blaring and thick smoke filling hallway!'");
      setAddress("Oakland Commercial Complex, 3rd Fl, Sector 3");
      setLatitude("37.8044 N");
      setLongitude("122.2712 W");
      setVoiceStressScore(91);
      setImageName("thermal_smoke_plume.jpg");
    } else {
      setTextReport("Elderly male collapsed in food court, bystander CPR underway. Public AED unit fetched by security guard.");
      setVoiceTranscript("Caller audio: 'Man dropped unconscious, not breathing, someone is doing chest compressions!'");
      setAddress("Metro Central Mall - Food Court, Sector 5");
      setLatitude("37.7833 N");
      setLongitude("122.4067 W");
      setVoiceStressScore(94);
      setImageName("mall_cpr_scene.jpg");
    }
  };

  const handleSimulateCall = () => {
    soundFX.blip(850, 0.04);
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setVoiceTranscript("Caller audio: 'Dispatch! There's an emergency, high speed collision with trapped passenger!'");
      setVoiceStressScore(88);
      soundFX.dispatchChime();
    }, 1200);
  };

  const handleImageDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
      soundFX.blip(900, 0.03);
    }
  };

  const handleUseCurrentGPS = () => {
    soundFX.blip(950, 0.04);
    setAddress("East Gate Road & 4th Ave, Sector 7");
    setLatitude("37.7749 N");
    setLongitude("122.4194 W");
  };

  const handleExecuteTriage = async () => {
    if (!textReport && !voiceTranscript) {
      alert("Please enter a description or load a demo scenario to execute neural triage.");
      return;
    }

    setIsTriageSubmitting(true);
    soundFX.dispatchChime();

    try {
      const data = await executeTriageReport({
        text: textReport,
        transcript: voiceTranscript,
        location: address,
        imageBase64: imageFile ? imageFile.split(",")[1] : null,
      });

      if (data.success && data.incident) {
        addIncident(data.incident);
        setTriageSuccessResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriageSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Container */}
      <div className="p-4 rounded-xl bg-[#081126] border border-[#16274e] shadow-tactical">
        <div className="flex items-start space-x-3.5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-white">
              Report an Emergency
            </h1>
            <p className="text-xs text-slate-400 italic mt-0.5">
              &ldquo;Send text, voice, image, or location information for instant Llama 3.1 neural triage.&rdquo;
            </p>
          </div>
        </div>

        {/* Load Demo Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#142344]">
          <span className="text-[11px] text-slate-400 font-medium">Load Demo Scenario:</span>

          <button
            onClick={() => loadScenario("crash")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#0c1833] hover:bg-[#132349] border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
          >
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>East Gate Car Crash</span>
          </button>

          <button
            onClick={() => loadScenario("fire")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#0c1833] hover:bg-[#132349] border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Warehouse Fire</span>
          </button>

          <button
            onClick={() => loadScenario("medical")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#0c1833] hover:bg-[#132349] border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Medical Collapse</span>
          </button>
        </div>
      </div>

      {/* 4 Ingestion Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: TEXT REPORT */}
        <div className="p-4 rounded-xl bg-[#091224] border border-[#16274b] shadow-tactical flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                1. Text Report
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Natural Language
              </span>
            </div>
            <textarea
              rows={4}
              value={textReport}
              onChange={(e) => setTextReport(e.target.value)}
              placeholder="Describe what happened... (e.g. Vehicle accident near East Gate Road. Two people may be injured and traffic is blocked.)"
              className="w-full bg-[#050b18] border border-[#142342] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Llama 3.1 automatically extracts casualties, hazard risks, and road blockages from conversational notes.
          </p>
        </div>

        {/* CARD 2: VOICE DISPATCH */}
        <div className="p-4 rounded-xl bg-[#091224] border border-[#16274b] shadow-tactical flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                2. Voice Dispatch
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isRecording ? "Transcribing..." : "Standby"}
              </span>
            </div>

            {/* Voice Audio Area */}
            <div className="bg-[#050b18] border border-[#142342] rounded-lg p-3 min-h-[106px] flex flex-col justify-between">
              <div className="text-[11px] text-slate-400">
                {voiceTranscript ? (
                  <div className="space-y-1">
                    <p className="text-cyan-300 italic">{voiceTranscript}</p>
                    {voiceStressScore && (
                      <div className="text-[10px] text-rose-400 font-mono">
                        Acoustic Stress Level: <strong>{voiceStressScore}% (High Urgency)</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 text-slate-500 text-xs">
                    Click &apos;Record Voice&apos; or simulate caller mic
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-[#12203d]">
                <button
                  onClick={handleSimulateCall}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-cyan-glow transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isRecording ? "Listening..." : "Record Voice Audio"}</span>
                </button>

                <button
                  onClick={handleSimulateCall}
                  className="px-3 py-1.5 rounded bg-[#0f2142] hover:bg-[#152e5a] text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all"
                >
                  Simulate Call
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Real-time speech to text pipeline with emotional stress & background noise filtering.
          </p>
        </div>

        {/* CARD 3: SCENE IMAGE UPLOAD */}
        <div className="p-4 rounded-xl bg-[#091224] border border-[#16274b] shadow-tactical flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                3. Scene Image Upload
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Vision AI
              </span>
            </div>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-[#1a2f58] hover:border-cyan-400/60 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[#050b18] transition-all min-h-[106px] group">
              <input type="file" accept="image/*" onChange={handleImageDrop} className="hidden" />
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors mb-1" />
              <div className="text-xs font-semibold text-slate-300 group-hover:text-white">
                {imageName ? imageName : "Click or drag image of the accident"}
              </div>
              <div className="text-[10px] text-slate-500">
                Supports JPG, PNG Drone feed
              </div>
            </label>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Vision multimodal tokenizer identifies vehicle deformation, smoke density, and hazardous placards.
          </p>
        </div>

        {/* CARD 4: LOCATION & GPS */}
        <div className="p-4 rounded-xl bg-[#091224] border border-[#16274b] shadow-tactical flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                4. Location & GPS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Triangulated
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono">
                  Street Address / Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#050b18] border border-[#142342] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-[#050b18] border border-[#142342] rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-[#050b18] border border-[#142342] rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="w-full py-1.5 rounded bg-[#0b1836] hover:bg-[#122650] border border-[#1a3360] text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Use Current GPS Coordinates</span>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Calculates proximity vectors to nearest ambulance bays, fire houses, and trauma hubs.
          </p>
        </div>
      </div>

      {/* Primary Triage Trigger Button */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#0c1836] via-[#09152e] to-[#0d1f42] border border-cyan-500/40 shadow-cyan-glow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Execute AI Multi-Agency Synthesis</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-shot casualty extraction, unit dispatch assignment, and emergency trauma pre-alert.
          </p>
        </div>

        <button
          onClick={handleExecuteTriage}
          disabled={isTriageSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-red-glow transition-all active:scale-95 disabled:opacity-50"
        >
          {isTriageSubmitting ? (
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-spin" />
              <span>Synthesizing Telemetry...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 fill-current" />
              <span>Dispatch Incident Now</span>
            </span>
          )}
        </button>
      </div>

      {/* Success Triage Banner when Dispatched */}
      {triageSuccessResult && (
        <div className="p-5 rounded-xl bg-[#091936] border border-emerald-500/50 shadow-cyan-glow space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Incident Successfully Synthesized & Dispatched to Active Roster!</span>
            </div>
            <button
              onClick={() => router.push("/incidents")}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              View in Active Incidents &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-[#070e20] border border-[#16274a]">
              <div className="text-[10px] text-slate-400 uppercase">Assigned Incident Code</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">
                {triageSuccessResult.incident.code} - {triageSuccessResult.incident.title}
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#070e20] border border-[#16274a]">
              <div className="text-[10px] text-slate-400 uppercase">Neural Inference Latency</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">
                {triageSuccessResult.triageMeta.latencyMs}ms ({triageSuccessResult.triageMeta.model})
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#070e20] border border-[#16274a]">
              <div className="text-[10px] text-slate-400 uppercase">Units En Route</div>
              <div className="font-mono font-bold text-cyan-400 mt-0.5">
                {triageSuccessResult.incident.assignedUnits.join(", ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
