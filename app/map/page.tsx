"use client";

import { useState } from "react";
import { RealOperationsMap } from "@/components/map/RealOperationsMap";
import { useCommandCenterStore } from "@/lib/store";
import { CommandSheetModal } from "@/components/modals/CommandSheetModal";
import { LocationPromptModal } from "@/components/modals/LocationPromptModal";
import { Incident } from "@/lib/initial-data";
import { Map, Navigation } from "lucide-react";

export default function OperationsMapPage() {
  const {
    incidents,
    units,
    hospitals,
    sectorLocation,
    initializeGridAtLocation,
  } = useCommandCenterStore();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white">Live Regional Operations Map</h1>
                {sectorLocation.isUserLocated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    📍 {sectorLocation.city}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Real-time OpenStreetMap spatial telemetry linking emergency incidents, response fleet, and trauma hospitals
              </p>
            </div>
          </div>
        </div>

        {/* Quick telemetry indicators + Relocate button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{sectorLocation.isUserLocated ? "Change Sector" : "📍 Simulate At My Location"}</span>
          </button>

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
        userSector={sectorLocation}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onOpenLocationPrompt={() => setIsLocationModalOpen(true)}
        heightClass="h-[680px]"
      />

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <CommandSheetModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* Location / Sector Intake Prompt Modal */}
      <LocationPromptModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelected={(lat, lng, city) => initializeGridAtLocation(lat, lng, city)}
      />
    </div>
  );
}
