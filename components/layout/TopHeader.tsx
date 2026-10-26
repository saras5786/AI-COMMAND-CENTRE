"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldCheck, Key, Plus, Clock, Sparkles } from "lucide-react";
import { soundFX } from "@/lib/sound";
import { AISettingsModal } from "@/components/modals/AISettingsModal";
import { llmService } from "@/lib/llm";
import Link from "next/link";

interface TopHeaderProps {
  onRunDemoIncident?: () => void;
  pendingAlertsCount?: number;
}

export function TopHeader({ onRunDemoIncident, pendingAlertsCount = 1 }: TopHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<{ name: string; isReal: boolean }>({
    name: "Built-in Emergency Heuristics",
    isReal: false,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    setProvider(llmService.getConnectedProvider());

    return () => clearInterval(interval);
  }, [isSettingsOpen]);

  return (
    <>
      <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between shrink-0 select-none">
        {/* Left Title & Status */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                AI COMMAND CENTRE
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SYSTEM ONLINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-Agency Computer Aided Dispatch & Spatial Triage System
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* AI Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              provider.isReal
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[160px]">{provider.name}</span>
          </button>

          {/* Clock */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || "00:00:00"}</span>
          </div>

          {/* New Report Button */}
          <Link
            href="/report"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report Emergency</span>
          </Link>
        </div>
      </header>

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setProvider(llmService.getConnectedProvider());
        }}
      />
    </>
  );
}
