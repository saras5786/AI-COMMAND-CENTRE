# 🚨 AI COMMAND CENTRE

> A Next-Generation Multi-Agency Emergency AI Command & Tactical Dispatch System built with Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet Maps, and a modular Multi-LLM provider architecture.

🌐 **Live Website (GitHub Pages)**: [https://saras5786.github.io/AI-COMMAND-CENTRE/](https://saras5786.github.io/AI-COMMAND-CENTRE/)  
📁 **GitHub Repository**: [https://github.com/saras5786/AI-COMMAND-CENTRE](https://github.com/saras5786/AI-COMMAND-CENTRE)

---

## 🌟 Executive Overview & Purpose

**AI COMMAND CENTRE** transforms chaotic, panicked 911 caller information (unstructured speech waveforms, citizen smartphone photos, broken conversational notes, GPS coordinates) into structured, prioritized Incident Command System (ICS) operational actions in sub-second latency (< 0.3s).

It breaks traditional dispatch bottlenecks by enabling **simultaneous multi-agency dispatch** across EMS Paramedics, Police Cruisers, Fire & Rescue Apparatus, and Receiving Hospital ER Trauma Centers.

---

## 📸 Screenshot-to-Component Mapping

| Screen in Screenshots | Route | Primary Components | Features & Interactions |
| :--- | :--- | :--- | :--- |
| **Tactical Dashboard** (Screenshot 1 Top) | `/` | `StatCards`, `LiveIncidentFeed`, `TacticalRadarMap`, `PriorityBreakdown`, `ERReadinessCard` | Real-time incident stream, animated radar sweep, active vectors count, priority severity bars, ER beds telemetry, Quick Alert buttons. |
| **Report Emergency** (Screenshot 1 Bottom) | `/report` | `TextReportCard`, `VoiceDispatchCard`, `SceneImageCard`, `LocationGPSCard` | Multimodal ingestion (Natural language text, speech-to-text with acoustic emotional stress scoring, computer vision dropzone, GPS lock). Quick scenario loaders: East Gate Crash, Warehouse Fire, Medical Collapse. |
| **Active Incidents** (Screenshot 3 Top) | `/incidents` | `ActiveIncidentsMasterList`, `CommandSheetModal` | Master card list with priority tags (HIGH, MEDIUM, LOW), casualties count, road blockage levels, and interactive FEMA ICS-201 Command Sheet drawer. |
| **Shared Tactical Map** (Screenshot 3 Bottom) | `/map` | `SharedTacticalOperationsGrid`, `VectorRadarSvg` | Live SVG tactical vector map with animated route lines linking dispatched units to incidents, filter pills (Incidents, Ambulances, Police, Hospitals), and interactive telemetry inspector. |
| **Responder Units** (Screenshot 2 Top) | `/units` | `MultiAgencyResponderApparatus` | 13 apparatus cards with live orders, ETAs, agency filter tabs (EMS, Police, Fire), `Toggle Status` button (cycling Available/Responding/Busy), and `Notify Unit` tactical alert chime. |
| **Hospital Alerts** (Screenshot 2 Bottom) | `/hospitals` | `HospitalEmergencyNotification` | Trauma bed availability telemetry, capacity utilization progress bars, ETA countdowns, and instant bi-directional pre-arrival notification transmission. |
| **Fleet Resources** (Sidebar Navigation) | `/fleet` | `FleetResourcesTelemtry` | Fuel/battery propulsion levels, encrypted 5G mesh status, onboard apparatus inventory (Zoll defib, Lucas CPR, Jaws of Life), and diagnostic pings. |
| **Demo Analytics** (Screenshot 4 Top) | `/analytics` | `DemoAnalytics`, `IngestionTrendChart`, `ClassificationBreakdown` | Response efficiency KPIs (2.4s AI triage, 4.8m dispatched ETA, 100% sync), 24-hour ingestion trend bar chart, and FEMA classification breakdown. |
| **System Architecture** (Screenshot 4 Bottom) | `/architecture` | `AIEMergencyPipeline`, `BottleneckComparison`, `PersonasGrid` | 4-step pipeline workflow (Ingestion, Reasoning, Synthesis, Dispatch), Traditional Bottleneck vs AI Coordination Layer comparison, and 6 user persona breakdowns. |

---

## 🧠 Intelligent Multi-LLM Architecture

Rather than routing every task to a single generic model, the system uses a **task-optimized Multi-LLM architecture** where each provider handles what it excels at:

```
                                  ┌──────────────────────────┐
                                  │   Emergency Ingestion    │
                                  │ (Text, Voice, Photo, GPS)│
                                  └────────────┬─────────────┘
                                               │
               ┌───────────────────────────────┼──────────────────────────────┐
               │                               │                              │
               ▼                               ▼                              ▼
    [Sub-second Triage]              [Scene Computer Vision]        [ICS Tactical Strategy]
    Meta Llama 3.1 70B               Google Gemini 1.5 Flash        Claude 3.5 / GPT-4o
    - 0.28s latency                  - Vehicle deformation score    - FEMA ICS-201 briefing
    - Casualty & hazard NER          - Smoke density & fire         - Hot-zone perimeters
    - Apparatus recommendation       - Hazmat placard identification- Radio TAC channels
               │                               │                              │
               └───────────────────────────────┼──────────────────────────────┘
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │    Centralized LLM Service       │
                              │ - Timeout & fallback chaining    │
                              │ - Schema validation (Zod)        │
                              │ - Token, latency, & cost metrics │
                              │ - Zero-config Offline Neural Core│
                              └──────────────────────────────────┘
```

### Model Selection Rationale:
1. **Meta Llama 3.1 70B (via Groq / Local Neural Core)**:
   - **Task**: Live emergency triage and entity extraction.
   - **Why**: Emergency dispatch requires sub-second latency (< 300ms). Groq Llama 3.1 70B delivers ~300 tokens/sec, making instant dispatch decisions before callers hang up.
2. **Google Gemini 1.5 Flash (`gemini-1.5-flash`)**:
   - **Task**: Computer vision scene inspection from witness photos and drone feeds.
   - **Why**: Native multimodal tokenizer accurately identifies vehicle crumple deformation, hazmat placards (UN 1203 gasoline), and smoke toxic densities.
3. **OpenAI GPT-4o-mini / Anthropic Claude 3.5 Sonnet**:
   - **Task**: FEMA Incident Command System (ICS-201/204) operational action plan generation.
   - **Why**: Unsurpassed reasoning depth for multi-agency jurisdictions, hazard radii, and radio interoperability.
4. **Offline Llama 3.1 Neural Core Fallback**:
   - **Why**: Ensures mission-critical reliability when external APIs face outages, rate limits, or during offline deployments without requiring credentials.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router, Server Actions, API Routes)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS with custom midnight command center color tokens
- **Icons**: Lucide React
- **Validation**: Zod (Structured LLM schema enforcement)
- **Audio Synthesizer**: Web Audio API (tactical radar pings, dispatch two-tone chimes, hospital strobe alerts)
- **Testing**: Automated end-to-end pipeline test runner (`scripts/test-pipeline.ts`)

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24 tested)
- **npm**: v9.0.0 or later

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "AI EMERGENCY COMMAND CENTRE"

# Install dependencies
npm install
```

### 3. Environment Configuration (Optional)
The system runs immediately out-of-the-box using the built-in offline Neural Core. To enable live external cloud models, copy `.env.example` to `.env.local` and configure your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Groq API for Meta Llama 3.1 70B (Sub-second triage)
GROQ_API_KEY=your_groq_api_key_here

# Google Gemini API for Scene Image Vision Analysis
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API for ICS-201 Incident Command Sheet Strategy
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Running the Application
```bash
# Start development server
npm run dev

# Or build and start production server
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running Automated Verification Tests
```bash
npm test
```

Verification suite checks:
- Initial data parity with all reference screenshots
- Llama 3.1 Neural Core triage extraction
- Multimodal computer vision analysis
- Voice dispatch acoustic noise filtering & stress scoring
- FEMA ICS-201 strategy generation

---

## 🎮 Interactive Features to Try

1. **Top Bar "RUN DEMO INCIDENT" Button**:
   - Click the glowing red header button on any screen to inject high-stress disasters (e.g., *Freeway 3-Vehicle Pileup*, *Industrial Ammonia Leak*, *Waterfront Grease Fire*).
   - Generates live audio dispatch, assigns units, notifies hospitals, and updates feeds.
2. **"Simulate 30-Second Workflow" Banner**:
   - Click the play button on the dashboard banner to step through the 5-phase automated response sequence with real-time timer countdowns.
3. **Report Emergency Studio (`/report`)**:
   - Click `East Gate Car Crash`, `Warehouse Fire`, or `Medical Collapse` to pre-load multimodal assets.
   - Test `Simulate Call` to see real-time acoustic stress scoring.
   - Click `Dispatch Incident Now` to execute the full AI pipeline.
4. **Command Sheet Modal (`/incidents`)**:
   - Click `View Command Sheet >` on any incident to inspect the AI reasoning model, inference latency, detected hazards, and FEMA ICS directives.
5. **Apparatus & Telemetry Control (`/units`)**:
   - Click `Toggle Status` to change unit deployments (Available ➔ Responding ➔ Busy).
   - Click `Notify Unit` to transmit acoustic tactical alerts.
6. **Shared Tactical Operations Grid (`/map`)**:
   - Filter by Incidents, Ambulances, Police, or Hospitals.
   - Click any node to open the live vector telemetry inspector card.
