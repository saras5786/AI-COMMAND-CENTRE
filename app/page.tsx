"use client";

import { useState } from "react";
import { Radio, Play, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCommandCenterStore } from "@/lib/store";
import { StatCards } from "@/components/dashboard/StatCards";
import { LiveIncidentFeed } from "@/components/dashboard/LiveIncidentFeed";
import { TacticalRadarMap } from "@/components/dashboard/TacticalRadarMap";
import { PriorityBreakdown } from "@/components/dashboard/PriorityBreakdown";
import { ERReadinessCard } from "@/components/dashboard/ERReadinessCard";
import { CommandSheetModal } from "@/components/modals/CommandSheetModal";
import { WorkflowSimModal } from "@/components/modals/WorkflowSimModal";
import { DemoIncidentModal } from "@/components/modals/DemoIncidentModal";
import { soundFX } from "@/lib/sound";

export default function DashboardPage() {
  const {
    incidents,
    units,
    hospitals,
    selectedIncident,
    setSelectedIncident,
    sendHospitalAlert,
    addIncident,
  } = useCommandCenterStore();

  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>AI COMMAND CENTRE</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated computer-aided dispatch correlating emergency caller transcripts, scene images, GPS coordinates, and receiving trauma hospitals.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/report"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </Link>
          <button
            onClick={() => {
              soundFX.blip(650, 0.05);
              setIsWorkflowModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Play className="w-3.5 h-3.5 fill-slate-300" />
            <span>Simulate Workflow</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <StatCards incidents={incidents} units={units} />

      {/* Main Grid: Feed & Tactical Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Incident Feed (7 cols) */}
        <div className="lg:col-span-7">
          <LiveIncidentFeed
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* Right Column: Live Map, Severity & Hospitals (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Real Map */}
          <TacticalRadarMap />

          {/* Incident Priority Breakdown */}
          <PriorityBreakdown incidents={incidents} />

          {/* Regional Hospital Trauma Readiness */}
          <ERReadinessCard
            hospitals={hospitals}
            onQuickAlert={(hId) => sendHospitalAlert(hId)}
          />
        </div>
      </div>

      {/* FEMA ICS-201 Tactical Command Sheet Modal */}
      {selectedIncident && (
        <CommandSheetModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* 30-Second Dispatch Workflow Simulation Modal */}
      <WorkflowSimModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* Demo Incident Injection Modal */}
      <DemoIncidentModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onInjectIncident={(inc) => addIncident(inc)}
      />
    </div>
  );
}
