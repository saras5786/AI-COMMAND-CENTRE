"use client";

import { useState, useEffect } from "react";
import { Incident, ResponderUnit, Hospital, INITIAL_INCIDENTS, INITIAL_UNITS, INITIAL_HOSPITALS } from "./initial-data";
import { SectorLocation, DEFAULT_SECTOR, generateLocalSectorData } from "./location-simulator";

const STORAGE_KEY_INCIDENTS = "cad_emergency_incidents_v3";
const STORAGE_KEY_UNITS = "cad_emergency_units_v3";
const STORAGE_KEY_HOSPITALS = "cad_emergency_hospitals_v3";
const STORAGE_KEY_SECTOR = "cad_emergency_sector_v3";

export function useCommandCenterStore() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [units, setUnits] = useState<ResponderUnit[]>(INITIAL_UNITS);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [sectorLocation, setSectorLocation] = useState<SectorLocation>(DEFAULT_SECTOR);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Initialize from localStorage or fallback
  useEffect(() => {
    try {
      const storedInc = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      const storedUnits = localStorage.getItem(STORAGE_KEY_UNITS);
      const storedHosp = localStorage.getItem(STORAGE_KEY_HOSPITALS);
      const storedSector = localStorage.getItem(STORAGE_KEY_SECTOR);

      if (storedInc) setIncidents(JSON.parse(storedInc));
      if (storedUnits) setUnits(JSON.parse(storedUnits));
      if (storedHosp) setHospitals(JSON.parse(storedHosp));
      if (storedSector) setSectorLocation(JSON.parse(storedSector));
    } catch (e) {
      console.warn("Storage sync error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  const saveIncidents = (updated: Incident[]) => {
    setIncidents(updated);
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
    } catch {}
  };

  const saveUnits = (updated: ResponderUnit[]) => {
    setUnits(updated);
    try {
      localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(updated));
    } catch {}
  };

  const saveHospitals = (updated: Hospital[]) => {
    setHospitals(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(updated));
    } catch {}
  };

  const saveSector = (updated: SectorLocation) => {
    setSectorLocation(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SECTOR, JSON.stringify(updated));
    } catch {}
  };

  // Initialize and simulate emergency grid around user's GPS coordinates
  const initializeGridAtLocation = (lat: number, lng: number, cityName?: string) => {
    const city = cityName || "Local Sector";
    const newSector: SectorLocation = {
      lat,
      lng,
      city,
      isUserLocated: true,
    };
    saveSector(newSector);

    const data = generateLocalSectorData(lat, lng, city);
    saveIncidents(data.incidents);
    saveUnits(data.units);
    saveHospitals(data.hospitals);
  };

  const resetToDefaultSector = () => {
    saveSector(DEFAULT_SECTOR);
    saveIncidents(INITIAL_INCIDENTS);
    saveUnits(INITIAL_UNITS);
    saveHospitals(INITIAL_HOSPITALS);
  };

  // Toggle unit status
  const toggleUnitStatus = (unitId: string) => {
    const updated = units.map((u) => {
      if (u.id === unitId) {
        const nextStatus: Record<string, "AVAILABLE" | "RESPONDING" | "BUSY"> = {
          AVAILABLE: "RESPONDING",
          RESPONDING: "BUSY",
          BUSY: "AVAILABLE",
        };
        const newStatus = nextStatus[u.status] || "AVAILABLE";
        const newEta = newStatus === "AVAILABLE" ? "Ready" : newStatus === "RESPONDING" ? "5 min" : "On Scene";
        const newOrder = newStatus === "AVAILABLE" ? "Sector Patrol" : u.currentOrder;
        return { ...u, status: newStatus, eta: newEta, currentOrder: newOrder };
      }
      return u;
    });
    saveUnits(updated);
  };

  // Notify Unit
  const notifyUnit = (unitId: string, customMessage?: string) => {
    const updated = units.map((u) => {
      if (u.id === unitId) {
        return {
          ...u,
          status: "RESPONDING" as const,
          eta: "4 min",
          currentOrder: customMessage || `Priority Order Dispatched at ${new Date().toLocaleTimeString()}`,
        };
      }
      return u;
    });
    saveUnits(updated);
  };

  // Hospital Pre-Alert
  const sendHospitalAlert = (hospitalId: string, customMessage?: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId || h.code === hospitalId) {
        const openBeds = Math.max(0, h.openBeds - 1);
        return {
          ...h,
          status: "ALERTED" as const,
          openBeds,
          capacityUtilization: Math.min(100, Math.round(((h.totalBeds - openBeds) / h.totalBeds) * 100)),
          lastAlertSent: customMessage || `Trauma Pre-Alert received at ${new Date().toLocaleTimeString()}`,
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  // Inject or Report new Incident
  const addIncident = (newIncident: Incident) => {
    const updated = [newIncident, ...incidents];
    saveIncidents(updated);
  };

  // Update Incident Status
  const updateIncidentStatus = (incidentId: string, nextStatus: Incident["status"]) => {
    const updated = incidents.map((inc) => {
      if (inc.id === incidentId) {
        return { ...inc, status: nextStatus };
      }
      return inc;
    });
    saveIncidents(updated);
  };

  return {
    incidents,
    units,
    hospitals,
    sectorLocation,
    isLoaded,
    selectedIncident,
    setSelectedIncident,
    initializeGridAtLocation,
    resetToDefaultSector,
    toggleUnitStatus,
    notifyUnit,
    sendHospitalAlert,
    addIncident,
    updateIncidentStatus,
  };
}
