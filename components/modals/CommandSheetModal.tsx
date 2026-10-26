"use client";

import { useState } from "react";
import { X, Shield, AlertTriangle, Clock, MapPin, Radio, Activity, Hospital, Send } from "lucide-react";
import { Incident } from "@/lib/initial-data";
import { soundFX } from "@/lib/sound";

interface CommandSheetModalProps {
  incident: Incident | null;
  onClose: () => void;
  onSendHospitalAlert?: (incident: Incident) => void;
}

export function CommandSheetModal({
  incident,
  onClose,
  onSendHospitalAlert,
}: CommandSheetModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ics" | "units">("overview");

  if (!incident) return null;

  const priorityColor =
    incident.priority === "HIGH"
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
      : incident.priority === "MEDIUM"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#081022] border border-[#1b2f56] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a142c] border-b border-[#18294a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded border ${priorityColor}`}>
              {incident.priority} PRIORITY
            </span>
            <span className="text-cyan-400 font-mono text-xs font-bold">{incident.code}</span>
            <h2 className="text-white font-bold text-base">{incident.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#132244] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#18294a] px-6 bg-[#070e20]">
          <button
            onClick={() => {
              setActiveTab("overview");
              soundFX.blip(700, 0.03);
            }}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            AI Triage & Scene Summary
          </button>
          <button
            onClick={() => {
              setActiveTab("ics");
              soundFX.blip(700, 0.03);
            }}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "ics"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            FEMA ICS-201 Tactical Strategy
          </button>
          <button
            onClick={() => {
              setActiveTab("units");
              soundFX.blip(700, 0.03);
            }}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "units"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Assigned Apparatus & Telemetry
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === "overview" && (
            <>
              {/* Location & Status Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#0c162e] border border-[#162a50]">
                  <div className="text-[10px] text-slate-400 uppercase">Location</div>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{incident.location}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0c162e] border border-[#162a50]">
                  <div className="text-[10px] text-slate-400 uppercase">Casualties</div>
                  <div className="font-semibold text-rose-400 mt-1">{incident.injuries}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0c162e] border border-[#162a50]">
                  <div className="text-[10px] text-slate-400 uppercase">Road Blockage</div>
                  <div className="font-semibold text-amber-400 mt-1">{incident.roadBlock}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0c162e] border border-[#162a50]">
                  <div className="text-[10px] text-slate-400 uppercase">Operational Status</div>
                  <div className="font-semibold text-cyan-400 mt-1">{incident.status}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg bg-[#0b1428] border border-[#18294a]">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Incident Narrative
                </div>
                <p className="text-slate-200 leading-relaxed">{incident.description}</p>
              </div>

              {/* AI Neural Analysis Card */}
              {incident.aiAnalysis && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs">
                      <Radio className="w-4 h-4 text-blue-400" />
                      <span>{incident.aiAnalysis.modelUsed}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] font-mono">
                      <span className="text-slate-400">
                        Inference: <strong className="text-blue-300">{incident.aiAnalysis.inferenceLatency}</strong>
                      </span>
                      <span className="text-slate-400">
                        Confidence: <strong className="text-emerald-400">{Math.round(incident.aiAnalysis.confidenceScore * 100)}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1.5">
                        Identified Hazards & Risks:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.aiAnalysis.hazards.map((h, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-medium"
                          >
                            ⚠ {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                        Medical & Triage Assessment:
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
                        {incident.aiAnalysis.medicalSummary}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                        Operational Directive (Incident Commander):
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-blue-200 font-mono text-[11px] leading-relaxed">
                        {incident.aiAnalysis.icsRecommendedAction}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "ics" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0b1428] border border-[#18294a]">
                <div className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>ICS-201 Operational Command Directive</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Unified command structure activated under Municipal Mutual Aid Agreement. Staging
                  area coordinates established outside the 150m hazard perimeter.
                </p>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded bg-[#081020] border border-[#16274a]">
                    <div className="text-[10px] text-slate-400">PRIMARY TAC FREQUENCY</div>
                    <div className="font-mono font-bold text-cyan-400 mt-1">TAC-FIRE-04 (154.280 MHz)</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#081020] border border-[#16274a]">
                    <div className="text-[10px] text-slate-400">SECONDARY TRAUMA CORRIDOR</div>
                    <div className="font-mono font-bold text-cyan-400 mt-1">EMS-TRAUMA-02 (462.950 MHz)</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0b1428] border border-[#18294a]">
                <div className="font-bold text-white text-xs uppercase mb-2 text-rose-300">
                  Safety Officer Directives
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li>Mandatory PPE Level B within hot-zone perimeter</li>
                  <li>Continuous atmospheric volatile organic compound (VOC) sniffer deployment</li>
                  <li>Secondary charged foam line staged at driver-side engine compartment</li>
                  <li>Maintain rapid ingress/egress corridor on 4th Ave for emergency transport</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "units" && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                Currently Assigned Multi-Agency Units to {incident.code}:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {incident.assignedUnits.map((u, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0c162e] border border-cyan-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-cyan-400 font-mono">{u}</div>
                      <div className="text-[10px] text-slate-400">En Route • ETA 4m</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold">
                      RESPONDING
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#070d1e] border-t border-[#18294a] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Telemetry Stream: <span className="text-emerald-400 font-mono">LIVE / ENCRYPTED</span>
          </div>

          <div className="flex items-center space-x-3">
            {onSendHospitalAlert && (
              <button
                onClick={() => {
                  soundFX.hospitalAlert();
                  onSendHospitalAlert(incident);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Hospital className="w-3.5 h-3.5" />
                <span>Pre-Alert Receiving ER</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#132244] hover:bg-[#1a2f5e] text-slate-200 font-semibold text-xs transition-all"
            >
              Close Command Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
