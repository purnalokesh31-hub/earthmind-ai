# 🌍 EarthMind PIOS
### Planetary Intelligence Operating System

**AI-powered urban intelligence for smarter, safer, and more sustainable cities.**

EarthMind PIOS is an AI-powered city intelligence platform designed to help municipal teams monitor urban problems, analyze reports, identify potential risks, and make better decisions.

It brings information from different city domains into one unified command center, helping human operators understand problems and decide what actions should be taken.

> **EarthMind recommends. Human operators decide. No autonomous physical execution.**

---

## 🎯 Key Features

- 🏙️ **City Command Center** — Monitor city intelligence and urban-domain status in one place.
- 🌦️ **Multi-Domain Monitoring** — Monitor environmental, weather, mobility, transit, utility, emergency, and citizen-related information.
- 📸 **Evidence-Based Reporting** — Support workflows for collecting and analyzing incident evidence.
- 🤖 **AI-Assisted Analysis** — Support visual analysis, voice processing, natural-language queries, and risk assessment.
- ⚠️ **Risk Intelligence** — Identify and prioritize potential urban risks.
- 👨‍💼 **Human Approval** — Keep operational decisions under authorized human control.
- 🧪 **Demo and Simulation** — Explore workflows using mock data and simulated providers.

## 🏙️ Seven Urban Intelligence Domains

1. **Environmental Intelligence** — Pollution, waste, and environmental concerns.
2. **Weather Intelligence** — Weather conditions and weather-related risks.
3. **Mobility Intelligence** — Road conditions, congestion, and mobility incidents.
4. **Transit Intelligence** — Public transportation, delays, and disruptions.
5. **Utility Intelligence** — Water, electricity, and public utility issues.
6. **Emergency Intelligence** — Emergency incidents and risk indicators.
7. **Citizen Intelligence** — Citizen reports, community feedback, and local concerns.

## ⚙️ How It Works

**Collect → Analyze → Assess → Recommend → Human Review → Track**

1. **Collect** — Receive available city data, reports, and evidence.
2. **Analyze** — Process information and identify the relevant domain.
3. **Assess** — Evaluate potential risks and priorities.
4. **Recommend** — Generate suggested actions.
5. **Review** — Authorized operators approve or reject recommendations.
6. **Track** — Record decisions and monitor the workflow.

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Framer Motion
- **Icons:** Lucide Icons
- **Mapping:** MapLibre GL
- **Testing:** Vitest
- **Database:** Prisma, SQLite, PostgreSQL/PostGIS configuration
- **Backend:** Python
- **Deployment Tools:** Docker, Docker Compose, Kubernetes

## 🚧 Current Project Status

EarthMind PIOS has a core application architecture, command-center interface, advisory workflows, governance mechanisms, and demo/simulation capabilities.

Some components are still under development:

- **Live City Data:** Municipal IoT and SCADA integrations are not connected.
- **AI/ML Models:** Some agents still use heuristics and simulated outputs.
- **Predictive Risk:** Risk assessment uses synthetic data and fallback formulas.
- **Database Integration:** SQLite and PostgreSQL/PostGIS configurations need alignment.
- **Shared Packages:** Some reusable packages and documentation are incomplete.
- **CI/CD:** Automated GitHub Actions workflows are pending.
- **Cloud Deployment:** Production cloud hosting is not yet completed.

The project is under active development and is not yet fully production-ready.

## 🔮 Future Implementations

### Phase 1 — Live City Data
Connect authorized municipal APIs, IoT sensors, transit feeds, and utility data.

### Phase 2 — Real AI Models
Integrate computer vision, speech-to-text, language models, and predictive ML models.

### Phase 3 — Database Integration
Align database configurations and improve reliable data storage and geospatial queries.

### Phase 4 — Evidence Collection
Improve image, audio, video, location, and offline evidence collection.

### Phase 5 — Better Architecture
Complete shared packages, reusable components, and API documentation.

### Phase 6 — Security Improvements
Strengthen authentication, access control, input validation, and audit logging.

### Phase 7 — CI/CD Automation
Automate testing, code quality checks, security scans, and builds using GitHub Actions.

### Phase 8 — Cloud Deployment
Deploy the platform through a secure and monitored cloud environment.

### Phase 9 — Explainable AI
Show why recommendations were generated and which evidence supports them.

### Phase 10 — Real-World Pilot
Validate the platform using representative city data and authorized stakeholders.

*These phases represent planned improvements, not completed features.*

## 🔐 Safety and Governance

EarthMind PIOS is a **decision-support system, not an autonomous control system**.

- **Human Approval Required:** Operational decisions require authorized human review.
- **Advisory Only:** AI-generated recommendations are suggestions, not commands.
- **No Autonomous Physical Execution:** The system must not autonomously operate water valves, power equipment, traffic signals, or other physical infrastructure.
- **Audit Logging:** Human decisions should be recorded with appropriate user and timestamp details.

Core safety requirements:

```typescript
requiresHumanApproval === true
advisoryOnly === true
autonomousExecution === false
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/purnalokesh31-hub/earthmind-ai.git
cd earthmind-ai
```

### 2. Start the Web Application

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Start the Python Backend

From the repository root, run:

```bash
python apps/api/app/main.py
```

The API is expected to run at [http://localhost:8000](http://localhost:8000).

**Health check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 4. Run Tests

**Frontend tests:**

```bash
cd apps/web
npm test
```

**Python platform tests** (from the repository root):

```bash
python tests/test_platform.py
```

Ensure your environment variables and dependencies are configured before running the application.

---

## 🤝 Contributions

Suggestions and contributions are welcome in:

- AI/ML integration
- Municipal data connectors
- Frontend development
- Database and API improvements
- Security and testing
- Documentation and deployment

---

## 📄 License

This project is currently under proprietary evaluation. An open-source license will be designated if and when the project is released under one.

---

**EarthMind PIOS — Turning urban data into informed, human-governed decisions.**
