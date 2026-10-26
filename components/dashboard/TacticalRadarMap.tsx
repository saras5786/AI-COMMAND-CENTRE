"use client";

import { RealOperationsMap } from "@/components/map/RealOperationsMap";
import { useCommandCenterStore } from "@/lib/store";
import { Map, ExternalLink } from "lucide-react";
import Link from "next/link";

export function TacticalRadarMap() {
  const { incidents, units, hospitals, setSelectedIncident } = useCommandCenterStore();

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Operations Map
            </h3>
            <p className="text-[11px] text-slate-400">Real-time OpenStreetMap spatial telemetry</p>
          </div>
        </div>

        <Link
          href="/map"
          className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
        >
          <span>Expand</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Real Mini Map */}
      <div className="rounded-xl overflow-hidden border border-slate-800">
        <RealOperationsMap
          incidents={incidents}
          units={units}
          hospitals={hospitals}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          heightClass="h-[270px]"
        />
      </div>
    </div>
  );
}
