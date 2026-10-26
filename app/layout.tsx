"use client";

import "./globals.css";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { useCommandCenterStore } from "@/lib/store";
import { DemoIncidentModal } from "@/components/modals/DemoIncidentModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { incidents, units, addIncident } = useCommandCenterStore();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>AI COMMAND CENTRE</title>
        <meta name="description" content="AI COMMAND CENTRE - Multi-Agency Emergency Dispatch & Spatial Triage System" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#050914] text-slate-200 min-h-screen flex antialiased">
        {/* Left Tactical Navigation Sidebar */}
        <Sidebar
          incidentsCount={incidents.length}
          unitsCount={units.length}
        />

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Command Center Header */}
          <TopHeader
            onRunDemoIncident={() => setIsDemoModalOpen(true)}
            pendingAlertsCount={incidents.filter((i) => i.priority === "HIGH").length}
          />

          {/* Page View Container */}
          <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Demo Incident Modal Triggered from Header */}
        <DemoIncidentModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onInjectIncident={(inc) => addIncident(inc)}
        />
      </body>
    </html>
  );
}
