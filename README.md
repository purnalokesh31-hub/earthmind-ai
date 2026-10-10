# 🌍 EarthMind PIOS
### Planetary Intelligence Operating System

**AI-powered urban intelligence for smarter, safer, and more sustainable cities.**

EarthMind PIOS is a city intelligence platform designed to help municipal teams monitor urban problems, analyze reports, identify potential risks, and make better decisions using AI.

It brings information from different city domains into one unified command center, helping human operators understand problems and decide what actions should be taken.

> **"EarthMind recommends. Human operators decide. No autonomous physical execution."**

---

## 🎯 Key Features

- 🏙️ **City Command Center** — View real-time city intelligence and urban-domain status in one place.
- 🌦️ **Multi-Domain Monitoring** — Organize information about weather, the environment, mobility, transit, utilities, emergencies, and citizen reports.
- 📸 **Evidence-Based Reporting** — Support workflows for collecting, compressing, and analyzing incident evidence (images, audio, GPS).
- 🤖 **AI-Assisted Analysis** — Architecture for visual analysis, voice processing, natural-language queries, and risk assessment.
- ⚠️ **Risk Intelligence** — Identify, prioritize, and simulate potential urban cascading risks.
- 👨‍💼 **Human Approval & Governance** — Keep operational decisions strictly under authorized human control (`requiresHumanApproval: true`).
- 🧪 **Demo and Simulation** — Explore supported workflows using mock data, demo gateways, and simulated providers.

---

## 🏙️ Seven Urban Intelligence Domains

1. **Environmental Intelligence** — Air quality, soil saturation, heat islands, and ecological anomalies.
2. **Weather Intelligence** — Precipitation, storm tracking, temperature spikes, and climate exposure.
3. **Mobility Intelligence** — Traffic bottleneck identification, arterial congestion, and emergency vehicle routing.
4. **Transit Intelligence** — Public transit telemetry, bus/rail disruptions, delay tracking, and multimodal detours.
5. **Utility Intelligence** — Water pressure anomalies, pipe leakage detection, power grid load balancing, and transformer thermal mitigation.
6. **Emergency Intelligence** — Incident triage, emergency services readiness, and multi-agency response coordination.
7. **Citizen Intelligence** — Verified citizen field reports, community feedback, and local hazard verification.

---

## ⚙️ How It Works

```
COLLECT ──► ANALYZE ──► ASSESS ──► RECOMMEND ──► REVIEW & APPROVE ──► TRACK & AUDIT
```

1. **Collect** — Receive city telemetry feeds, citizen reports, and uploaded evidence.
2. **Analyze** — Process evidence (vision tags, audio notes, geolocation) and identify the relevant domain.
3. **Assess** — Evaluate potential risks, failure probabilities, and priority queues.
4. **Recommend** — Generate resource-constrained, multi-objective suggested actions.
5. **Review** — Authorized human operators review, inspect tradeoffs, and approve or reject recommendations.
6. **Track** — Record decisions into immutable audit logs and follow the operational lifecycle.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
- **Mapping:** MapLibre GL
- **Testing:** Vitest (136 test suites, 900+ passing tests)
- **Database & ORM:** Prisma ORM, SQLite (local development) and PostgreSQL/PostGIS (containerized target)
- **Backend Intelligence:** Python standard-library zero-dependency API server (`apps/api`)
- **Deployment Tools:** Docker, Docker Compose, Kubernetes

---

## 🚧 Current Project Status

EarthMind PIOS has a core application architecture, command-center interface, advisory workflows, governance mechanisms, and demo/simulation capabilities.

Some components are still under active development:

- **Live municipal IoT and SCADA integrations** are not connected (currently utilizing mock adapters and demo fixtures with fallback resilience).
- **AI agents** currently leverage heuristic rules and simulated inference pipelines rather than live tensor model servers.
- **Predictive risk assessment** currently relies on synthetic training data and fallback logistic formulas.
- **Database configuration** between SQLite and PostgreSQL/PostGIS requires ongoing alignment.
- **Placeholder directories** remain in select shared package and documentation folders.
- **Automated CI/CD pipelines** and live cloud hosting deployments are pending.

The project is **under active development** and is designed as an advisory decision-support platform.

---

## 🔮 Future Implementations

### Phase 1 — Live City Data
Connect authorized municipal APIs, IoT sensors, transit feeds (GTFS-RT), and utility telemetry sources.

### Phase 2 — Real AI Models
Replace simulated AI workflows with evaluated computer vision (YOLOv11), speech-to-text (Whisper), LLM reasoning (Gemini API), and fine-tuned predictive models.

### Phase 3 — Database Integration
Harmonize Prisma SQLite and PostgreSQL/PostGIS schemas and establish production clustering with spatial indexing.

### Phase 4 — Evidence Collection
Complete offline media caching, progressive client-side canvas compression, and background synchronization queues.

### Phase 5 — Better Architecture
Complete shared packages (`@earthmind/shared-types`, `@earthmind/ui`), reusable modules, and formal API specifications.

### Phase 6 — Security and API Improvements
Strengthen JWT token rotation, role-based access control (RBAC), request validation, tamper-proof logging, and security headers.

### Phase 7 — Automated Testing and CI/CD
Automate code quality checks, end-to-end testing, security dependency scanning, and Docker builds via GitHub Actions.

### Phase 8 — Cloud Deployment
Deploy the platform through a secure, monitored, and repeatable cloud deployment process (Kubernetes / Helm / Managed Cloud).

### Phase 9 — Explainable Recommendations
Expose transparent attribution scorecards showing operators why a recommendation was generated, which evidence supports it, and what confidence levels exist.

### Phase 10 — Real-World Pilot
Validate the platform with representative municipal pilot datasets and authorized public safety stakeholders.

*These phases represent planned development roadmap milestones.*

---

## 🔐 Safety and Governance

EarthMind PIOS is a **decision-support system, not an autonomous control system**.

Its core safety requirements are:

- **Human Approval Required:** Every operational action requires explicit human operator sign-off (`requiresHumanApproval: true`).
- **Advisory Only:** All AI-generated recommendations, priority rankings, and interventions are strictly advisory.
- **No Autonomous Physical Execution:** Physical infrastructure such as water valves, power switches, and traffic control signals are **never** operated autonomously.
- **Audit Logging:** Every human operator approval, rejection, or override is immutably logged with user identification and timestamps.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/purnalokesh31-hub/earthmind-ai.git
cd earthmind-ai
```

### 2. Run the Web Command Center (Next.js)

```bash
cd apps/web
npm install
npm run dev
```

The web dashboard will be available at: **`http://localhost:3000`**

### 3. Run the Python Backend API (Zero-Dependency)

From the project root:

```bash
python apps/api/app/main.py
```

The API will start at: **`http://localhost:8000`** (Health check: `http://localhost:8000/api/health`)

### 4. Run Test Suites

* **Frontend & Domain Suite:**
  ```bash
  cd apps/web
  npm test
  ```
* **Python Platform Suite:**
  ```bash
  python tests/test_platform.py
  ```

---

## 🤝 Contributions

Contributions and suggestions are welcome in areas such as AI/ML model integration, municipal data connectors, frontend usability, database reliability, security, testing, and documentation.

---

## 📄 License

This project is currently under proprietary evaluation. An open-source license will be designated upon public release.

---

**EarthMind PIOS — Turning urban data into informed, human-governed decisions.**
