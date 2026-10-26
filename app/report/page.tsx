"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Mic,
  Camera,
  MapPin,
  CheckCircle2,
  Car,
  Flame,
  HeartPulse,
  UploadCloud,
  Loader2,
  Sparkles,
  Key,
  ShieldAlert,
  ArrowRight,
  Radio,
} from "lucide-react";
import { useCommandCenterStore } from "@/lib/store";
import { soundFX } from "@/lib/sound";
import { executeTriageReport, llmService } from "@/lib/llm";
import { LocationPickerMap } from "@/components/map/LocationPickerMap";
import { AISettingsModal } from "@/components/modals/AISettingsModal";

export default function ReportEmergencyPage() {
  const router = useRouter();
  const { addIncident } = useCommandCenterStore();

  const [textReport, setTextReport] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [address, setAddress] = useState("Outer Ring Road near Moti Bagh Flyover, New Delhi");
  const [lat, setLat] = useState(28.5828);
  const [lng, setLng] = useState(77.1683);
  const [isTriageSubmitting, setIsTriageSubmitting] = useState(false);
  const [triageSuccessResult, setTriageSuccessResult] = useState<any | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const connectedProvider = llmService.getConnectedProvider();

  // Quick Scenarios for judges/testers
  const loadScenario = (type: "crash" | "fire" | "medical") => {
    soundFX.blip(750, 0.04);
    if (type === "crash") {
      setTextReport("Two vehicles collided at intersection. Driver in sedan trapped by deformed door, fuel leaking onto asphalt.");
      setVoiceTranscript("112 Emergency Dispatch: 'Two cars crashed hard on Ring Road, one driver is pinned inside and fuel is leaking!'");
      setAddress("Outer Ring Road near Moti Bagh, New Delhi");
      setLat(28.5828);
      setLng(77.1683);
      setImageName("crash_intersection.jpg");
    } else if (type === "fire") {
      setTextReport("Commercial office building electrical fire. Thick black smoke rising from 3rd floor windows, building fire alarms sounding.");
      setVoiceTranscript("101 Fire Control: 'Smoke is filling the 3rd floor hallway at Nehru Place, alarms going off, building evacuating!'");
      setAddress("Nehru Place Commercial Complex, Tower 4, New Delhi");
      setLat(28.5494);
      setLng(77.2536);
      setImageName("structure_fire.jpg");
    } else {
      setTextReport("Male in mid-50s collapsed in public atrium, unresponsive. Bystander administering chest compressions with AED deployed.");
      setVoiceTranscript("108 / 112 Medical Alert: 'Commuter collapsed suddenly at Rajiv Chowk Metro, not breathing, CPR in progress!'");
      setAddress("Rajiv Chowk Metro Concourse, Gate 3, Connaught Place");
      setLat(28.6328);
      setLng(77.2195);
      setImageName("cpr_atrium.jpg");
    }
  };

  const handleSimulateCall = () => {
    soundFX.blip(850, 0.04);
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setVoiceTranscript("Caller voice audio: 'Emergency dispatch! High speed collision, vehicle overturned with smoke!'");
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

  const handleExecuteTriage = async () => {
    if (!textReport && !voiceTranscript && !imageFile) {
      alert("Please provide an incident description or upload a photo to verify.");
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
        // Update coordinates to match the interactive map pin
        data.incident.coordinates = { lat, lng };
        data.incident.location = address;

        addIncident(data.incident);
        setTriageSuccessResult(data);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error processing triage: ${err.message}`);
    } finally {
      setIsTriageSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Container */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">New Incident Report & AI Verification</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multimodal emergency intake with computer vision scene analysis, GPS location lock, and dispatch triage
              </p>
            </div>
          </div>
        </div>

        {/* AI Provider Status Pill */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
            connectedProvider.isReal
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              : "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${connectedProvider.isReal ? "bg-emerald-400" : "bg-blue-400"}`} />
          <span>{connectedProvider.name}</span>
          <Key className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>
      </div>

      {/* Demo Scenario Shortcuts for Evaluation */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium">Quick Test Scenarios:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadScenario("crash")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>Two-Car Crash (Entrapment)</span>
          </button>
          <button
            onClick={() => loadScenario("fire")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Commercial Structure Fire</span>
          </button>
          <button
            onClick={() => loadScenario("medical")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cardiac Arrest (Public Mall)</span>
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Description & Voice */}
        <div className="space-y-5">
          {/* Caller Description */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">1</span>
                <span>Incident Description</span>
              </label>
              <span className="text-[11px] text-slate-500">Citizen 112 / Caller Dispatch Notes</span>
            </div>
            <textarea
              rows={4}
              value={textReport}
              onChange={(e) => setTextReport(e.target.value)}
              placeholder="Describe what happened: vehicles involved, trapped victims, fire, injuries, road blockages..."
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Voice Dispatch Audio */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Mic className="w-4 h-4 text-rose-400" />
                <span>Emergency 112 Voice Audio / Transcript</span>
              </label>
              <button
                type="button"
                onClick={handleSimulateCall}
                disabled={isRecording}
                className="text-[11px] text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>{isRecording ? "Transcribing Audio..." : "Simulate 112 Audio"}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder="Audio transcription from caller or radio transmission..."
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo Upload & Vision Analysis */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">2</span>
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Scene Photo (AI Computer Vision)</span>
              </label>
              <span className="text-[11px] text-slate-400">Crash, smoke, fire, or hazards</span>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-4 text-center transition bg-slate-900/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageDrop}
                id="photo-upload"
                className="hidden"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block space-y-2">
                {imageFile ? (
                  <div className="space-y-2">
                    <img
                      src={imageFile}
                      alt="Uploaded scene"
                      className="max-h-48 mx-auto rounded-lg object-cover border border-slate-700 shadow"
                    />
                    <p className="text-xs text-emerald-400 font-medium">✓ Photo loaded: {imageName}</p>
                    <p className="text-[11px] text-slate-400">Click to replace photo</p>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <UploadCloud className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs font-semibold text-slate-200">Upload emergency scene photo</p>
                    <p className="text-[11px] text-slate-500">
                      Analyzed by AI to confirm emergency severity & detect hazardous placards
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real Interactive Map */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Pin Location on Real Map</span>
              </label>
            </div>

            <LocationPickerMap
              initialLat={lat}
              initialLng={lng}
              onLocationSelect={(newLat, newLng, newAddress) => {
                setLat(newLat);
                setLng(newLng);
                setAddress(newAddress);
              }}
            />
          </div>

          {/* Action Trigger Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-slate-700 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Verification & Multi-Agency Dispatch</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Processes text, voice transcript, and photo. Extracts severity, verifies hazards, selects closest apparatus, and alerts trauma receiving hospitals.
              </p>
            </div>

            <button
              onClick={handleExecuteTriage}
              disabled={isTriageSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {isTriageSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Multimodal Triage & Verification...</span>
                </>
              ) : (
                <>
                  <span>Execute AI Triage & Dispatch Incident</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Triage Success Result Card */}
      {triageSuccessResult && (
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-emerald-500/20 gap-2">
            <div className="flex items-center space-x-2.5 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Incident Triaged & Dispatched to Roster</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Processed by:</span>
              <span className="font-semibold text-emerald-300">
                {triageSuccessResult.triageMeta.model} ({triageSuccessResult.triageMeta.latencyMs}ms)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Assigned Code & Title</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {triageSuccessResult.incident.code} — {triageSuccessResult.incident.title}
              </span>
              <span className="text-rose-400 font-semibold text-[11px]">
                Priority: {triageSuccessResult.incident.priority}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Dispatched Units</span>
              <span className="font-bold text-blue-300 text-sm mt-0.5 block">
                {triageSuccessResult.incident.assignedUnits.join(", ") || "Units en route"}
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Casualties: {triageSuccessResult.incident.injuries}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Tactical Operational Directive</span>
              <span className="text-slate-200 text-xs mt-0.5 block leading-relaxed">
                {triageSuccessResult.incident.aiAnalysis?.icsRecommendedAction}
              </span>
            </div>
          </div>

          {/* Vision result if image was analyzed */}
          {triageSuccessResult.incident.sceneVision && (
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1">
              <span className="font-bold text-blue-300 block">📷 Computer Vision Scene Verification:</span>
              <p>{triageSuccessResult.incident.sceneVision.damageAssessment}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => router.push("/map")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center space-x-1.5 shadow"
            >
              <span>View On Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
