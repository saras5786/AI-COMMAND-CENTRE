"use client";

import { useEffect, useRef, useState } from "react";
import { Incident, ResponderUnit, Hospital } from "@/lib/initial-data";
import { SectorLocation } from "@/lib/location-simulator";
import { Filter, Layers, Navigation, AlertTriangle, Shield, Flame, Ambulance, Hospital as HospIcon, MapPin } from "lucide-react";

interface RealOperationsMapProps {
  incidents: Incident[];
  units: ResponderUnit[];
  hospitals: Hospital[];
  center?: [number, number];
  userSector?: SectorLocation;
  onSelectIncident?: (incident: Incident) => void;
  onOpenLocationPrompt?: () => void;
  heightClass?: string;
}

export function RealOperationsMap({
  incidents,
  units,
  hospitals,
  center,
  userSector,
  onSelectIncident,
  onOpenLocationPrompt,
  heightClass = "h-[620px]",
}: RealOperationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  const [activeFilter, setActiveFilter] = useState<"ALL" | "INCIDENTS" | "POLICE" | "FIRE" | "EMS" | "HOSPITALS">("ALL");
  const [selectedItem, setSelectedItem] = useState<{ type: string; data: any } | null>(null);

  const targetCenter: [number, number] = center || (userSector ? [userSector.lat, userSector.lng] : [28.6139, 77.2090]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: targetCenter,
          zoom: 13,
          zoomControl: true,
        });

        // Official OpenStreetMap (100% Free & Open-Source)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        layersGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const layerGroup = layersGroupRef.current;
      if (!map || !layerGroup) return;

      // Update center view when target coordinates change
      map.setView(targetCenter, map.getZoom() || 13);

      layerGroup.clearLayers();

      // 0. Plot User's Command Location if Located
      if (userSector && userSector.isUserLocated) {
        const userIcon = L.divIcon({
          className: "leaflet-user-marker",
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: 0; border-radius: 50%; background: #3b82f6; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const userMarker = L.marker([userSector.lat, userSector.lng], { icon: userIcon });
        userMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 170px; color: #0f172a;">
            <div style="font-weight: 700; color: #2563eb; margin-bottom: 2px;">Your Location (Command Post)</div>
            <div style="font-size: 11px; color: #475569;">Sector: ${userSector.city}</div>
          </div>
        `);
        layerGroup.addLayer(userMarker);
      }

      // 1. Plot Incidents
      if (activeFilter === "ALL" || activeFilter === "INCIDENTS") {
        incidents.forEach((inc) => {
          const isHigh = inc.priority === "HIGH";
          const bgColor = isHigh ? "#ef4444" : inc.priority === "MEDIUM" ? "#f59e0b" : "#3b82f6";

          const icon = L.divIcon({
            className: "leaflet-incident-marker",
            html: `
              <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: 0; border-radius: 50%; background: ${bgColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bgColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                  <span style="font-size: 11px; font-weight: 800;">!</span>
                </div>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          });

          const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], { icon });
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; min-width: 200px; color: #0f172a;">
              <div style="font-weight: 700; font-size: 13px; color: ${bgColor}; margin-bottom: 2px;">
                ${inc.code} - ${inc.title}
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${inc.location}</div>
              <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 6px;">
                <div><strong>Priority:</strong> ${inc.priority}</div>
                <div><strong>Injuries:</strong> ${inc.injuries}</div>
                <div><strong>Assigned:</strong> ${inc.assignedUnits.join(", ") || "None"}</div>
              </div>
            </div>
          `);

          marker.on("click", () => {
            setSelectedItem({ type: "incident", data: inc });
            if (onSelectIncident) onSelectIncident(inc);
          });

          layerGroup.addLayer(marker);
        });
      }

      // 2. Plot Responder Units
      units.forEach((u) => {
        const isPolice = u.agency === "Police";
        const isFire = u.agency === "Fire & Rescue";
        const isEMS = u.agency === "EMS";

        if (
          activeFilter === "ALL" ||
          (activeFilter === "POLICE" && isPolice) ||
          (activeFilter === "FIRE" && isFire) ||
          (activeFilter === "EMS" && isEMS)
        ) {
          const color = isPolice ? "#2563eb" : isFire ? "#dc2626" : "#059669";
          const label = u.callSign;

          const icon = L.divIcon({
            className: "leaflet-unit-marker",
            html: `
              <div style="display: flex; align-items: center; background: #0f172a; border: 2px solid ${color}; border-radius: 14px; padding: 2px 7px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; white-space: nowrap;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 5px;"></span>
                <span style="font-size: 10px; font-weight: 700; font-family: monospace;">${label}</span>
              </div>
            `,
            iconSize: [60, 24],
            iconAnchor: [30, 12],
          });

          const marker = L.marker([u.coordinates.lat, u.coordinates.lng], { icon });
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; min-width: 180px; color: #0f172a;">
              <div style="font-weight: 700; color: ${color}; margin-bottom: 2px;">
                ${u.callSign} (${u.name})
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">Status: <strong>${u.status}</strong></div>
              <div style="font-size: 11px; color: #475569;">ETA: <strong>${u.eta}</strong></div>
              <div style="font-size: 11px; color: #475569;">Current: ${u.currentOrder}</div>
            </div>
          `);

          marker.on("click", () => {
            setSelectedItem({ type: "unit", data: u });
          });

          layerGroup.addLayer(marker);
        }
      });

      // 3. Plot Regional Hospitals
      if (activeFilter === "ALL" || activeFilter === "HOSPITALS") {
        hospitals.forEach((h) => {
          const icon = L.divIcon({
            className: "leaflet-hospital-marker",
            html: `
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #0284c7; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">
                +
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([h.coordinates.lat, h.coordinates.lng], { icon });
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; min-width: 190px; color: #0f172a;">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 2px;">${h.name}</div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">${h.level} • ${h.distanceKm} km away</div>
              <div style="background: #e0f2fe; padding: 6px; border-radius: 6px;">
                <div><strong>Open Beds:</strong> ${h.openBeds} / ${h.totalBeds}</div>
                <div><strong>Capacity:</strong> ${h.capacityUtilization}%</div>
                <div><strong>Status:</strong> ${h.status}</div>
              </div>
            </div>
          `);

          marker.on("click", () => {
            setSelectedItem({ type: "hospital", data: h });
          });

          layerGroup.addLayer(marker);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [incidents, units, hospitals, activeFilter, targetCenter, userSector]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xl">
      {/* Top Filter Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeFilter === "ALL" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            All Layers
          </button>

          <button
            onClick={() => setActiveFilter("INCIDENTS")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
              activeFilter === "INCIDENTS" ? "bg-rose-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter("EMS")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
              activeFilter === "EMS" ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ambulances ({units.filter((u) => u.agency === "EMS").length})</span>
          </button>

          <button
            onClick={() => setActiveFilter("FIRE")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
              activeFilter === "FIRE" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Fire ({units.filter((u) => u.agency === "Fire & Rescue").length})</span>
          </button>

          <button
            onClick={() => setActiveFilter("POLICE")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
              activeFilter === "POLICE" ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Police ({units.filter((u) => u.agency === "Police").length})</span>
          </button>

          <button
            onClick={() => setActiveFilter("HOSPITALS")}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
              activeFilter === "HOSPITALS" ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Hospitals ({hospitals.length})</span>
          </button>
        </div>

        {/* Right Action: Locate / Sector Switcher */}
        <div className="flex items-center space-x-2">
          {onOpenLocationPrompt && (
            <button
              onClick={onOpenLocationPrompt}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userSector?.isUserLocated ? `📍 ${userSector.city}` : "📍 Simulate At My Location"}</span>
            </button>
          )}

          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
            OpenStreetMap
          </span>
        </div>
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Bottom Detail Drawer if Item Selected */}
      {selectedItem && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs animate-in slide-in-from-bottom duration-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {selectedItem.type.toUpperCase()}
              </span>
              <h4 className="font-bold text-white text-sm">
                {selectedItem.data.name || selectedItem.data.title || selectedItem.data.callSign}
              </h4>
            </div>
            <p className="text-slate-400 mt-0.5 text-xs">
              {selectedItem.data.location || selectedItem.data.currentOrder || `Level: ${selectedItem.data.level}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {selectedItem.type === "incident" && onSelectIncident && (
              <button
                onClick={() => onSelectIncident(selectedItem.data)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition shadow-sm"
              >
                Open Incident Action Plan
              </button>
            )}
            <button
              onClick={() => setSelectedItem(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
