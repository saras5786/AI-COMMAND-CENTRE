export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "RESPONDING" | "DISPATCHED" | "ON SCENE" | "INVESTIGATING" | "CONTAINED" | "SCHEDULED" | "RESOLVED";
export type UnitAgency = "EMS" | "Police" | "Fire & Rescue";
export type UnitStatus = "RESPONDING" | "BUSY" | "AVAILABLE";

export interface Incident {
  id: string;
  code: string;
  title: string;
  priority: Priority;
  status: IncidentStatus;
  location: string;
  description: string;
  reportedAt: string;
  assignedUnits: string[];
  injuries: string;
  roadBlock: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  aiAnalysis?: {
    modelUsed: string;
    inferenceLatency: string;
    confidenceScore: number;
    hazards: string[];
    suggestedApparatus: string[];
    medicalSummary: string;
    icsRecommendedAction: string;
    closestHospitalId?: string;
  };
}

export interface ResponderUnit {
  id: string;
  callSign: string;
  name: string;
  agency: UnitAgency;
  status: UnitStatus;
  currentOrder: string;
  eta: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  batteryOrFuel?: number;
  personnelCount?: number;
  specialty?: string;
}

export interface Hospital {
  id: string;
  code: string;
  name: string;
  level: string;
  status: "ALERTED" | "NORMAL";
  distanceKm: number;
  etaMin: number;
  capacityUtilization: number; // e.g. 86
  openBeds: number;
  totalBeds: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  traumaBayStatus: "Ready" | "Occupied" | "Critical";
  lastAlertSent?: string;
}

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "1",
    code: "INC-1042",
    title: "Multi-Vehicle Road Collision",
    priority: "HIGH",
    status: "RESPONDING",
    location: "Outer Ring Road near Moti Bagh Flyover, New Delhi",
    description: "High-speed collision involving electric transit bus and two private vehicles. Two passengers trapped with cabin deformation. Fuel and coolant pooling on roadway.",
    reportedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    assignedUnits: ["AMB-108-01", "PCR-DEL-12", "HOSP-01"],
    injuries: "2 Persons",
    roadBlock: "Partial (2 Lanes Blocked on Ring Road)",
    coordinates: { lat: 28.5828, lng: 77.1683 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 70B Neural Core",
      inferenceLatency: "0.28s",
      confidenceScore: 0.98,
      hazards: ["Active battery/coolant leakage", "Ring Road traffic choke point", "Spilled glass & high-speed debris"],
      suggestedApparatus: ["CATS ALS Ambulance", "Delhi Police Traffic Cruiser", "Trauma Bay Staging"],
      medicalSummary: "Patient A: Blunt chest impact, GCS 13; Patient B: Suspected distal extremity fracture, alert and stable.",
      icsRecommendedAction: "Establish outer diversion at Moti Bagh junction; route AMB-108-01 via express green corridor to AIIMS Apex Trauma Centre.",
      closestHospitalId: "HOSP-01"
    }
  },
  {
    id: "2",
    code: "INC-1041",
    title: "Commercial Structural Fire",
    priority: "HIGH",
    status: "DISPATCHED",
    location: "Nehru Place Commercial Complex, Tower 4, South Delhi",
    description: "Electrical duct fire in 3rd floor commercial office hub. Dense smoke rising to floors 4 and 5. Building evacuation initiated by security.",
    reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    assignedUnits: ["DFS-ENG-04", "DFS-LAD-02", "PCR-DEL-03"],
    injuries: "0 Persons",
    roadBlock: "Severe (Nehru Place Outer Ring Diverted)",
    coordinates: { lat: 28.5494, lng: 77.2536 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 70B Neural Core",
      inferenceLatency: "0.32s",
      confidenceScore: 0.95,
      hazards: ["3-phase electrical duct failure", "Toxic smoke accumulation in central atrium", "Crowd density on stairwells"],
      suggestedApparatus: ["DFS Heavy Pumper", "54m Hydraulic Aerial Ladder", "Delhi Police Perimeter"],
      medicalSummary: "No burn casualties identified; EMS staged on south plaza for smoke inhalation precautions.",
      icsRecommendedAction: "Isolate main substation feed, establish 2-in-2-out attack team, vent rooftop bulkhead."
    }
  },
  {
    id: "3",
    code: "INC-1040",
    title: "Cardiac Emergency (Public Concourse)",
    priority: "HIGH",
    status: "ON SCENE",
    location: "Rajiv Chowk Metro Concourse, Gate 3, Connaught Place",
    description: "Adult commuter collapsed near central concourse interchange. Bystander CPR underway with DMRC Automated External Defibrillator (AED) applied.",
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    assignedUnits: ["CATS-AMB-01"],
    injuries: "1 Person (Critical)",
    roadBlock: "None",
    coordinates: { lat: 28.6328, lng: 77.2195 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 70B Neural Core",
      inferenceLatency: "0.19s",
      confidenceScore: 0.99,
      hazards: ["High pedestrian commuter density", "Subterranean concourse access"],
      suggestedApparatus: ["CATS Mobile Intensive Care Unit", "Paramedic Defibrillation Team"],
      medicalSummary: "Ventricular fibrillation rhythm; 1 shock delivered by bystander AED; CPR cycle 3 active.",
      icsRecommendedAction: "Coordinate with DMRC Station Master to open radial elevator gate for rapid gurney evacuation to Dr. RML Hospital."
    }
  },
  {
    id: "4",
    code: "INC-1039",
    title: "Traffic Congestion & Fender Bender",
    priority: "MEDIUM",
    status: "INVESTIGATING",
    location: "DND Flyway Approach, Mayur Vihar Link",
    description: "Two sedans collided during merge. No injuries reported; minor vehicular radiator fluid on pavement causing visual rubbernecking.",
    reportedAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
    assignedUnits: ["TRAFFIC-DEL-08"],
    injuries: "0 Persons",
    roadBlock: "Minor (Left Shoulder Only)",
    coordinates: { lat: 28.5772, lng: 77.2798 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 8B Quick-Triage",
      inferenceLatency: "0.15s",
      confidenceScore: 0.92,
      hazards: ["Commuter highway slowdown wave", "Slick road surface from coolant"],
      suggestedApparatus: ["Delhi Traffic Police Interceptor", "NHAI Flatbed Recovery"],
      medicalSummary: "Both motorists assessed non-injured, declined hospital transport.",
      icsRecommendedAction: "Push vehicles to breakdown lane, apply sand over coolant spill, clear commute corridor."
    }
  },
  {
    id: "5",
    code: "INC-1038",
    title: "Industrial Chemical Vapor Leak",
    priority: "HIGH",
    status: "CONTAINED",
    location: "Okhla Industrial Area Phase II, Shed 14, New Delhi",
    description: "Ammonia refrigeration pressure valve failure inside cold logistics warehouse. Automated leak sensors triggered alarm at 65 PPM.",
    reportedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    assignedUnits: ["HAZ-DFS-01"],
    injuries: "0 Persons",
    roadBlock: "Moderate (Internal Industrial Lane Cordoned)",
    coordinates: { lat: 28.5290, lng: 77.2755 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 70B Neural Core",
      inferenceLatency: "0.29s",
      confidenceScore: 0.97,
      hazards: ["Anhydrous ammonia vapor cloud", "Downwind dispersion toward Mathura Road"],
      suggestedApparatus: ["DFS Hazmat Containment Squad", "Atmospheric Photo-Ionization Unit"],
      medicalSummary: "All facility personnel safely evacuated; zero inhalation hospitalizations.",
      icsRecommendedAction: "Maintain 200m exclusion perimeter until downwind monitoring registers <20 PPM."
    }
  },
  {
    id: "6",
    code: "INC-1037",
    title: "Roadway Obstruction (Tree Limb)",
    priority: "LOW",
    status: "SCHEDULED",
    location: "Shanti Path & Vinay Marg Crossing, Chanakyapuri",
    description: "Fallen neem tree limb obstructing curbside lane following squall winds.",
    reportedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    assignedUnits: [],
    injuries: "0 Persons",
    roadBlock: "Partial (Curbside Lane & Cycle Track)",
    coordinates: { lat: 28.5950, lng: 77.1950 },
    aiAnalysis: {
      modelUsed: "Meta Llama 3.1 8B Quick-Triage",
      inferenceLatency: "0.12s",
      confidenceScore: 0.94,
      hazards: ["Night-time visibility hazard for two-wheelers"],
      suggestedApparatus: ["NDMC Horticulture Quick Team"],
      medicalSummary: "No human contact or injuries.",
      icsRecommendedAction: "Deploy warning reflective cones, schedule municipal hydraulic woodchipper."
    }
  }
];

export const INITIAL_UNITS: ResponderUnit[] = [
  {
    id: "u1",
    callSign: "AMB-108-01",
    name: "CATS Medic 1 ALS",
    agency: "EMS",
    status: "RESPONDING",
    currentOrder: "INC-1042 (Outer Ring Road)",
    eta: "4 min",
    coordinates: { lat: 28.5750, lng: 77.2100 },
    batteryOrFuel: 88,
    personnelCount: 2,
    specialty: "Advanced Life Support / Cardiac Defibrillator"
  },
  {
    id: "u2",
    callSign: "CATS-AMB-01",
    name: "CATS MICU Critical Care",
    agency: "EMS",
    status: "BUSY",
    currentOrder: "INC-1040 (Rajiv Chowk Metro)",
    eta: "On Scene",
    coordinates: { lat: 28.6328, lng: 77.2195 },
    batteryOrFuel: 92,
    personnelCount: 3,
    specialty: "Mobile Intensive Care / Emergency Physician"
  },
  {
    id: "u3",
    callSign: "AMB-108-03",
    name: "108 Ambulance Unit 3",
    agency: "EMS",
    status: "AVAILABLE",
    currentOrder: "Safdarjung Base Standby",
    eta: "Ready",
    coordinates: { lat: 28.5700, lng: 77.2050 },
    batteryOrFuel: 100,
    personnelCount: 2,
    specialty: "Basic Life Support / Rapid Trauma Transport"
  },
  {
    id: "u4",
    callSign: "AMB-108-09",
    name: "108 Trauma Unit 9",
    agency: "EMS",
    status: "AVAILABLE",
    currentOrder: "South Sector Station Standby",
    eta: "Ready",
    coordinates: { lat: 28.5400, lng: 77.2400 },
    batteryOrFuel: 79,
    personnelCount: 2,
    specialty: "Mass Casualty / Bariatric Stretcher"
  },
  {
    id: "u5",
    callSign: "AMB-108-11",
    name: "108 Ambulance Unit 11",
    agency: "EMS",
    status: "AVAILABLE",
    currentOrder: "West Delhi Station Standby",
    eta: "Ready",
    coordinates: { lat: 28.6400, lng: 77.1200 },
    batteryOrFuel: 95,
    personnelCount: 2,
    specialty: "BLS Rapid Transport"
  },
  {
    id: "u6",
    callSign: "PCR-DEL-12",
    name: "Delhi Police PCR 12",
    agency: "Police",
    status: "RESPONDING",
    currentOrder: "INC-1042 (Outer Ring Road)",
    eta: "5 min",
    coordinates: { lat: 28.5840, lng: 77.1710 },
    batteryOrFuel: 84,
    personnelCount: 2,
    specialty: "Highway Accident Management & Traffic Diversion"
  },
  {
    id: "u7",
    callSign: "TRAFFIC-DEL-08",
    name: "Traffic Interceptor 08",
    agency: "Police",
    status: "BUSY",
    currentOrder: "INC-1039 (DND Flyway)",
    eta: "On Scene",
    coordinates: { lat: 28.5772, lng: 77.2798 },
    batteryOrFuel: 71,
    personnelCount: 2,
    specialty: "Corridor Clearance & Speed Laser Interception"
  },
  {
    id: "u8",
    callSign: "PCR-DEL-03",
    name: "Delhi Police QRT 03",
    agency: "Police",
    status: "AVAILABLE",
    currentOrder: "Connaught Place Sector",
    eta: "Ready",
    coordinates: { lat: 28.6300, lng: 77.2150 },
    batteryOrFuel: 90,
    personnelCount: 3,
    specialty: "Quick Response Team & Urban Patrol"
  },
  {
    id: "u9",
    callSign: "PCR-DEL-19",
    name: "Special Cell Tactical Unit",
    agency: "Police",
    status: "AVAILABLE",
    currentOrder: "HQ Reserve, Police HQ",
    eta: "Ready",
    coordinates: { lat: 28.6200, lng: 77.2300 },
    batteryOrFuel: 96,
    personnelCount: 4,
    specialty: "Tactical Counter-Assault & Hostage Rescue"
  },
  {
    id: "u10",
    callSign: "DFS-ENG-04",
    name: "Delhi Fire Service Engine 4",
    agency: "Fire & Rescue",
    status: "BUSY",
    currentOrder: "INC-1041 (Nehru Place)",
    eta: "On Scene",
    coordinates: { lat: 28.5494, lng: 77.2536 },
    batteryOrFuel: 83,
    personnelCount: 4,
    specialty: "Heavy Foam Tender & 4500L Water Pumper"
  },
  {
    id: "u11",
    callSign: "DFS-LAD-02",
    name: "DFS 54m Hydraulic Platform",
    agency: "Fire & Rescue",
    status: "RESPONDING",
    currentOrder: "INC-1041 (Nehru Place)",
    eta: "3 min",
    coordinates: { lat: 28.5680, lng: 77.1850 },
    batteryOrFuel: 77,
    personnelCount: 4,
    specialty: "54-Meter High-Rise Articulated Turntable Ladder"
  },
  {
    id: "u12",
    callSign: "HAZ-DFS-01",
    name: "DFS Hazmat Haz-1",
    agency: "Fire & Rescue",
    status: "BUSY",
    currentOrder: "INC-1038 (Okhla Phase II)",
    eta: "On Scene",
    coordinates: { lat: 28.5290, lng: 77.2755 },
    batteryOrFuel: 89,
    personnelCount: 3,
    specialty: "Chemical Spill Neutralization & Vapor Detectors"
  },
  {
    id: "u13",
    callSign: "AIR-DEL-01",
    name: "AIIMS Heli-Medevac 1",
    agency: "EMS",
    status: "AVAILABLE",
    currentOrder: "Safdarjung Helipad Ready",
    eta: "Ready",
    coordinates: { lat: 28.5830, lng: 77.2060 },
    batteryOrFuel: 100,
    personnelCount: 3,
    specialty: "Critical Care Aeromedical Rotorcraft"
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: "h1",
    code: "HOSP-01",
    name: "AIIMS Apex Trauma Centre",
    level: "Apex Level 1 Trauma",
    status: "ALERTED",
    distanceKm: 2.8,
    etaMin: 5,
    capacityUtilization: 84,
    openBeds: 18,
    totalBeds: 150,
    coordinates: { lat: 28.5672, lng: 77.2090 },
    traumaBayStatus: "Ready",
    lastAlertSent: "INC-1042 (2 trauma casualties en route, ETA 4m)"
  },
  {
    id: "h2",
    code: "HOSP-02",
    name: "Safdarjung Emergency & Burn Centre",
    level: "Level 1 Emergency & Burns",
    status: "NORMAL",
    distanceKm: 3.4,
    etaMin: 7,
    capacityUtilization: 91,
    openBeds: 8,
    totalBeds: 120,
    coordinates: { lat: 28.5705, lng: 77.2070 },
    traumaBayStatus: "Occupied"
  },
  {
    id: "h3",
    code: "HOSP-03",
    name: "Dr. Ram Manohar Lohia Hospital (RML)",
    level: "Level 1 Central Emergency",
    status: "ALERTED",
    distanceKm: 4.2,
    etaMin: 9,
    capacityUtilization: 72,
    openBeds: 28,
    totalBeds: 110,
    coordinates: { lat: 28.6253, lng: 77.2014 },
    traumaBayStatus: "Ready",
    lastAlertSent: "INC-1040 (Cardiac arrest resuscitation bay prepped)"
  },
  {
    id: "h4",
    code: "HOSP-04",
    name: "Max Super Speciality Hospital, Saket",
    level: "Level 2 Comprehensive Acute",
    status: "NORMAL",
    distanceKm: 5.8,
    etaMin: 12,
    capacityUtilization: 65,
    openBeds: 35,
    totalBeds: 100,
    coordinates: { lat: 28.5273, lng: 77.2112 },
    traumaBayStatus: "Ready"
  }
];
