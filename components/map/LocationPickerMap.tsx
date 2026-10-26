"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export function LocationPickerMap({
  initialLat = 28.6139,
  initialLng = 77.2090,
  onLocationSelect,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState<string>("Detecting address...");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Reverse geocode lat/lng to real address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        const display = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(display);
        onLocationSelect(lat, lng, display);
        return display;
      }
    } catch {
      // Fallback
    }
    const fallback = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setAddress(fallback);
    onLocationSelect(lat, lng, fallback);
    return fallback;
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet on client side
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      // OpenStreetMap Official Free & Open-Source Map Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const pinIcon = L.divIcon({
        className: "custom-emergency-pin",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle marker drag
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      // Handle map click
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Initial reverse geocode
      reverseGeocode(coords.lat, coords.lng);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Use Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        reverseGeocode(lat, lng).finally(() => setIsLocating(false));
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access denied or unavailable (${err.message}). You can click on the map to place the pin manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Incident Location Pin (Interactive Map)</span>
        </label>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span>{isLocating ? "Acquiring GPS..." : "📍 Use My Current Location"}</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/90 backdrop-blur-sm border border-slate-700 px-2.5 py-1 rounded-md text-[11px] text-slate-300 font-mono">
          Click map or drag pin to adjust location
        </div>
      </div>

      {/* Detected address pill */}
      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between text-slate-300">
        <div className="truncate pr-2">
          <span className="text-slate-500 mr-1.5">Selected:</span>
          <span className="text-white font-medium">{address}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
