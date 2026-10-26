"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Shield,
  Building2,
  Truck,
  BarChart3,
  Cpu,
  Layers,
} from "lucide-react";
import { soundFX } from "@/lib/sound";

interface SidebarProps {
  incidentsCount?: number;
  unitsCount?: number;
}

export function Sidebar({ incidentsCount = 6, unitsCount = 13 }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      highlight: false,
    },
    {
      href: "/report",
      label: "Report Emergency",
      icon: AlertTriangle,
      badge: null,
      highlight: true,
    },
    {
      href: "/incidents",
      label: "Active Incidents",
      icon: Layers,
      badge: incidentsCount,
      highlight: false,
    },
    {
      href: "/map",
      label: "Live Operations Map",
      icon: Map,
      badge: null,
      highlight: false,
    },
    {
      href: "/units",
      label: "Responder Units",
      icon: Shield,
      badge: unitsCount,
      highlight: false,
    },
    {
      href: "/hospitals",
      label: "Hospital Capacity",
      icon: Building2,
      badge: null,
      highlight: false,
    },
    {
      href: "/fleet",
      label: "Fleet Telemetry",
      icon: Truck,
      badge: null,
      highlight: false,
    },
    {
      href: "/analytics",
      label: "Dispatch Analytics",
      icon: BarChart3,
      badge: null,
      highlight: false,
    },
    {
      href: "/architecture",
      label: "System Architecture",
      icon: Cpu,
      badge: null,
      highlight: false,
    },
  ];

  return (
    <aside className="w-64 bg-[#0a1020] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white">
              AI COMMAND CENTRE
            </div>
            <div className="text-[11px] text-slate-400">
              Multi-Agency Dispatch
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFX.blip(600, 0.04)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : item.highlight
                    ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : item.highlight
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>Incident CAD</span>
          <span className="font-mono text-emerald-400 font-semibold">v3.2</span>
        </div>
        <p>Built for City Emergency Services & Disaster Coordination</p>
      </div>
    </aside>
  );
}
