"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Play, Radio, Shield, Hospital, Navigation, Sparkles } from "lucide-react";
import { soundFX } from "@/lib/sound";

interface WorkflowSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteIncident?: () => void;
}

export function WorkflowSimModal({
  isOpen,
  onClose,
  onCompleteIncident,
}: WorkflowSimModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const steps = [
    {
      title: "01. Panicked Multimodal Ingestion",
      sub: "Voice audio stream, mobile photo & GPS coordinates ingested from citizen 112 emergency call.",
      icon: Radio,
      badge: "INGESTION: 0.12s",
      color: "text-amber-400",
    },
    {
      title: "02. Llama 3.1 Neural Core Reasoning",
      sub: "Zero-shot extraction: 2 injured occupants, vehicle rollover risk, gas leak hazard. Classifies as HIGH PRIORITY.",
      icon: Sparkles,
      badge: "LLAMA 3.1 INFERENCE: 0.28s",
      color: "text-cyan-400",
    },
    {
      title: "03. Simultaneous Multi-Agency Dispatch",
      sub: "Telemetry calculated: AMB-07 dispatched (ETA 4m), POL-12 dispatched (ETA 7m), LAD-02 notified.",
      icon: Shield,
      badge: "DISPATCH TIME: 0.35s",
      color: "text-blue-400",
    },
    {
      title: "04. Bi-Directional ER Trauma Pre-Alert",
      sub: "City General Trauma Center notified with incoming injury profile. Red Trauma Bay reserved.",
      icon: Hospital,
      badge: "ER SYNC: 0.42s",
      color: "text-emerald-400",
    },
    {
      title: "05. Dynamic GPS Route & Signal Preemption",
      sub: "Municipal traffic signals locked green along East Gate corridor for responding emergency vehicles.",
      icon: Navigation,
      badge: "GRID LOCKED: 0.58s",
      color: "text-purple-400",
    },
  ];

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const startSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setTimerSeconds(0);
    soundFX.blip(600, 0.05);

    // Sequence through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          soundFX.blip(800 + prev * 150, 0.08);
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsRunning(false);
          soundFX.dispatchChime();
          if (onCompleteIncident) onCompleteIncident();
          return prev;
        }
      });
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#081022] border border-cyan-500/40 rounded-xl w-full max-w-2xl overflow-hidden shadow-cyan-glow flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0a142c] border-b border-[#18294a] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide">
                Simulate 30-Second Emergency Response Workflow
              </h2>
              <div className="text-[10px] text-cyan-400 font-mono">
                Traditional Dispatch: 3.5 - 5.0 mins | AI Neural Core: &lt; 1.0 second
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

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b162c] border border-[#17284c]">
            <div className="text-xs text-slate-300">
              Simulation Status:{" "}
              <span className={`font-bold font-mono ${isRunning ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                {isRunning ? `RUNNING IN REAL-TIME (${timerSeconds}s)` : "READY TO EXECUTE"}
              </span>
            </div>
            {!isRunning && (
              <button
                onClick={startSimulation}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-cyan-glow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Trigger Simulation</span>
              </button>
            )}
          </div>

          {/* Stepper list */}
          <div className="space-y-3">
            {steps.map((st, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep && isRunning;
              const isPending = idx > currentStep;
              const StepIcon = st.icon;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? "bg-[#0d1c3a] border-cyan-400 shadow-cyan-glow scale-[1.01]"
                      : isPast
                      ? "bg-[#0a1326] border-emerald-500/40 text-slate-300"
                      : "bg-[#070e1c] border-[#142342] opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isPast
                            ? "bg-emerald-500/20 text-emerald-400"
                            : isCurrent
                            ? "bg-cyan-500/20 text-cyan-400 animate-pulse"
                            : "bg-[#111e38] text-slate-500"
                        }`}
                      >
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{st.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{st.sub}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 border ${
                        isPast
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : isCurrent
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 animate-pulse"
                          : "bg-[#0d172e] border-[#172b50] text-slate-500"
                      }`}
                    >
                      {st.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#070d1e] border-t border-[#18294a] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Total AI Workflow Latency: <strong className="text-cyan-400 font-mono">0.58 seconds</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#132244] hover:bg-[#1a2f5e] text-slate-200 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
