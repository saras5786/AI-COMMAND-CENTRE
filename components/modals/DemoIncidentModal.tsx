"use client";

import { useState } from "react";
import { X, Flame, AlertOctagon, Zap, Shield, Hospital, Radio } from "lucide-react";
import { Incident } from "@/lib/initial-data";
import { soundFX } from "@/lib/sound";

interface DemoIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectIncident: (incident: Incident) => void;
}

export function DemoIncidentModal({
  isOpen,
  onClose,
  onInjectIncident,
}: DemoIncidentModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const scenarios = [
    {
      title: "Ring Road Multi-Vehicle Pileup & Fuel Leak",
      code: "INC-1043",
      location: "Outer Ring Road near Moti Bagh Flyover, New Delhi",
      description: "Severe 3-car high-speed collision on highway fast lane. One vehicle overturned with driver trapped by crumpled door. Gasoline pooling on asphalt.",
      injuries: "3 Persons",
      roadBlock: "Full Highway Closure (All Lanes)",
      priority: "HIGH" as const,
      status: "RESPONDING" as const,
      hazards: ["Active gasoline runoff", "Vehicle rollover instability", "High-speed oncoming traffic"],
      suggestedUnits: ["AMB-108-03", "PCR-DEL-12", "DFS-LAD-02"],
      hospital: "HOSP-01",
    },
    {
      title: "Commercial Kitchen Grease & Duct Fire",
      code: "INC-1044",
      location: "Connaught Place Inner Circle, Block C, New Delhi",
      description: "Deep fryer flashover spreading up exhaust flue to second floor attic space. Heavy oily smoke billowing over pedestrian arcade.",
      injuries: "1 Persons (Minor Inhalation)",
      roadBlock: "Pedestrian Arcade Cordoned",
      priority: "HIGH" as const,
      status: "DISPATCHED" as const,
      hazards: ["Class K grease fire", "Attic structural flashover", "Tourist crowd density"],
      suggestedUnits: ["DFS-ENG-04", "DFS-LAD-02", "PCR-DEL-03"],
      hospital: "HOSP-02",
    },
    {
      title: "Industrial Chemical Vapor Leak",
      code: "INC-1045",
      location: "Okhla Industrial Area Phase II, Shed 14, New Delhi",
      description: "Chlorine transfer valve gasket failure. High-visibility pungent greenish-yellow vapor detected. Automatic perimeter sensors sounding siren.",
      injuries: "0 Persons",
      roadBlock: "1-Km Isolation Radius",
      priority: "HIGH" as const,
      status: "RESPONDING" as const,
      hazards: ["Toxic vapor inhalation", "Downwind residential plume", "Corrosive oxidizer"],
      suggestedUnits: ["HAZ-DFS-01", "PCR-DEL-19", "AMB-108-09"],
      hospital: "HOSP-03",
    },
  ];

  const handleLaunch = () => {
    setIsProcessing(true);
    soundFX.dispatchChime();

    const sc = scenarios[selectedScenario];

    setTimeout(() => {
      const newInc: Incident = {
        id: "demo-" + Date.now(),
        code: sc.code,
        title: sc.title,
        priority: sc.priority,
        status: sc.status,
        location: sc.location,
        description: sc.description,
        reportedAt: new Date().toISOString(),
        assignedUnits: sc.suggestedUnits,
        injuries: sc.injuries,
        roadBlock: sc.roadBlock,
        coordinates: {
          lat: 28.61 + (Math.random() - 0.5) * 0.04,
          lng: 77.20 + (Math.random() - 0.5) * 0.04,
        },
        aiAnalysis: {
          modelUsed: "Meta Llama 3.1 70B Neural Core",
          inferenceLatency: "0.24s",
          confidenceScore: 0.99,
          hazards: sc.hazards,
          suggestedApparatus: sc.suggestedUnits,
          medicalSummary: "Pre-triage complete. Rapid transport and trauma team activation triggered.",
          icsRecommendedAction: `Deploy ${sc.suggestedUnits.join(", ")} immediately. Notify receiving hospital.`,
        },
      };

      onInjectIncident(newInc);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#081022] border border-rose-500/40 rounded-xl w-full max-w-xl overflow-hidden shadow-red-glow flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a142c] border-b border-[#18294a] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide">
                Inject Live Demo Emergency Incident
              </h2>
              <div className="text-[10px] text-rose-400 font-mono">
                Trigger Real-time Neural Triage & Multi-Agency Dispatch
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#132244]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-300">
            Select a high-stress simulated disaster scenario to test system-wide automated coordination:
          </div>

          <div className="space-y-3">
            {scenarios.map((sc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedScenario(idx);
                  soundFX.blip(750, 0.03);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === idx
                    ? "bg-[#111f3d] border-rose-500 shadow-red-glow text-white"
                    : "bg-[#091224] border-[#152342] text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className="text-rose-400 font-mono">{sc.code}</span>
                    <span>{sc.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold">
                    HIGH PRIORITY
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {sc.description}
                </div>
                <div className="flex items-center space-x-3 text-[10px] text-cyan-400 font-mono">
                  <span>📍 {sc.location}</span>
                  <span>Units: {sc.suggestedUnits.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#070d1e] border-t border-[#18294a] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Llama 3.1 synthesis latency: <strong className="text-cyan-400">~0.25s</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#132244] hover:bg-[#1a2f5e] text-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-1.5 rounded bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-red-glow transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Trigger Incident Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
