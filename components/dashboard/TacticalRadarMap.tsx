"use client";

import { RealOperationsMap } from "@/components/map/RealOperationsMap";
import { useCommandCenterStore } from "@/lib/store";
import { Map, ExternalLink, Navigation } from "lucide-react";
import Link from "next/link";

interface TacticalRadarMapProps {
  onOpenLocationPrompt?: () => void;
}

export function TacticalRadarMap({ onOpenLocationPrompt }: TacticalRadarMapProps) {
  const { incidents, units, hospitals, sectorLocation, setSelectedIncident } = useCommandCenterStore();

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
            <p className="text-[11px] text-slate-400">
              {sectorLocation.isUserLocated ? `📍 Sector: ${sectorLocation.city}` : "OpenStreetMap real-time spatial CAD"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenLocationPrompt && (
            <button
              onClick={onOpenLocationPrompt}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Locate</span>
            </button>
          )}
          <Link
            href="/map"
            className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
          >
            <span>Expand</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Real Mini Map */}
      <div className="rounded-xl overflow-hidden border border-slate-800">
        <RealOperationsMap
          incidents={incidents}
          units={units}
          hospitals={hospitals}
          userSector={sectorLocation}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onOpenLocationPrompt={onOpenLocationPrompt}
          heightClass="h-[270px]"
        />
      </div>
    </div>
  );
}
