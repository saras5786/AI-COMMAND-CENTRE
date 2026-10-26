"use client";

import { useState } from "react";
import { MapPin, Navigation, Loader2, Compass, CheckCircle2, X } from "lucide-react";
import { soundFX } from "@/lib/sound";

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (lat: number, lng: number, cityName: string) => void;
}

export function LocationPromptModal({
  isOpen,
  onClose,
  onLocationSelected,
}: LocationPromptModalProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);
    soundFX.blip(800, 0.04);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let cityName = "Your Local District";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address;
            cityName =
              address?.city ||
              address?.town ||
              address?.county ||
              address?.state ||
              "Your Local District";
          }
        } catch {
          // fallback
        }

        setIsLocating(false);
        soundFX.dispatchChime();
        onLocationSelected(lat, lng, cityName);
        onClose();
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(`Location permission denied or unavailable (${err.message}). You can select a demo metropolitan sector below.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectPreset = (lat: number, lng: number, city: string) => {
    soundFX.blip(700, 0.04);
    onLocationSelected(lat, lng, city);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Initialize Local CAD Sector</h2>
              <p className="text-xs text-slate-400">
                Simulate emergency incidents & apparatus in your local city
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary GPS Button */}
        <div className="space-y-3">
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="w-full py-4 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-semibold transition flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-600/30 disabled:opacity-60"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Acquiring GPS & Localizing District...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>📍 Detect My Location & Simulate Local Incidents</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Asks for your device location to generate simulated emergencies, ambulances, and trauma hospitals around your neighborhood.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 uppercase font-semibold">
            Or Choose A City
          </span>
        </div>

        {/* Preset Cities */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleSelectPreset(37.7749, -122.4194, "San Francisco, CA")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
          >
            <div className="font-semibold text-white">San Francisco</div>
            <div className="text-[10px] text-slate-400">California, USA</div>
          </button>

          <button
            onClick={() => handleSelectPreset(40.7128, -74.006, "New York City, NY")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
          >
            <div className="font-semibold text-white">New York City</div>
            <div className="text-[10px] text-slate-400">New York, USA</div>
          </button>

          <button
            onClick={() => handleSelectPreset(51.5074, -0.1278, "London, UK")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
          >
            <div className="font-semibold text-white">London</div>
            <div className="text-[10px] text-slate-400">United Kingdom</div>
          </button>

          <button
            onClick={() => handleSelectPreset(28.6139, 77.209, "New Delhi, India")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
          >
            <div className="font-semibold text-white">New Delhi</div>
            <div className="text-[10px] text-slate-400">Delhi, India</div>
          </button>
        </div>
      </div>
    </div>
  );
}
