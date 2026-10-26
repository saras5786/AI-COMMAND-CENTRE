"use client";

import { useState } from "react";
import { RealOperationsMap } from "@/components/map/RealOperationsMap";
import { useCommandCenterStore } from "@/lib/store";
import { CommandSheetModal } from "@/components/modals/CommandSheetModal";
import { Incident } from "@/lib/initial-data";
import { Map, AlertCircle, Shield, Building2, Flame, Ambulance } from "lucide-react";

export default function OperationsMapPage() {
  const { incidents, units, hospitals } = useCommandCenterStore();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const highPriorityCount = incidents.filter((i) => i.priority === "HIGH").length;
  const activeUnitsCount = units.filter((u) => u.status === "RESPONDING" || u.status === "BUSY").length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Live Regional Operations Map</h1>
              <p className="text-xs text-slate-400">
                Real-time spatial visualization of active emergencies, response fleet, and trauma hospitals
              </p>
            </div>
          </div>
        </div>

        {/* Quick telemetry indicators */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
            <span className="font-bold">{highPriorityCount}</span> Critical Incidents
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
            <span className="font-bold">{activeUnitsCount}</span> Units Dispatched
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
            <span className="font-bold">{hospitals.reduce((acc, h) => acc + h.openBeds, 0)}</span> Open Trauma Beds
          </div>
        </div>
      </div>

      {/* Real Interactive Map */}
      <RealOperationsMap
        incidents={incidents}
        units={units}
        hospitals={hospitals}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        heightClass="h-[680px]"
      />

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <CommandSheetModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
