# EarthMind PIOS — Phase 7.4 Climate Resilience & Infrastructure Adaptation Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.4 — Climate Resilience & Infrastructure Adaptation  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.4 extends EarthMind PIOS into a **Climate Resilience Intelligence Platform**:

$$\text{CLIMATE DATA} \rightarrow \text{HAZARD SCENARIO} \rightarrow \text{EXPOSURE} \rightarrow \text{VULNERABILITY} \rightarrow \text{IMPACT PROPAGATION} \rightarrow \text{RESILIENCE SCORE} \rightarrow \text{ADAPTATION OPTIONS} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Data Tagging Directives:
> [!IMPORTANT]
> **Data Transparency & Safety**:
> Simulated climate indicators are explicitly tagged with `DATA_SOURCE = "SIMULATION"`.
> Advisory adaptation options strictly enforce `requiresHumanApproval: true` before capital investment or infrastructure changes.

---

## 2. Core Subsystems

### 2.1 Climate Resilience Domain (`lib/server/domain/digital-twin/climate-resilience.domain.ts`)
- **Supported Hazard Types**: `FLOOD`, `EXTREME_HEAT`, `CYCLONE`, `HEAVY_RAINFALL`, `DROUGHT`, `STORM_SURGE`, `LANDSLIDE`, `MULTI_HAZARD`.
- **Scenario Horizons**: `NEXT_24_HOURS`, `NEXT_7_DAYS`, `NEXT_30_DAYS`, `NEXT_1_YEAR`, `NEXT_5_YEARS`, `NEXT_10_YEARS`.
- **Lifecycle States**: `DRAFT`, `READY`, `RUNNING`, `COMPLETED`, `REVIEWING`, `APPROVED`, `REJECTED`, `ARCHIVED`.

### 2.2 Climate Data Provider Abstraction (`lib/server/services/climate-data.service.ts`)
- Pluggable provider architecture (`IClimateDataProvider` interface) with `SimulationClimateDataProvider` producing deterministic hazard metrics (`rainfallIntensityMmHr: 84.5`, `temperatureAnomalyCelsius: +3.2°C`, `floodRiskIndex: 88%`).

### 2.3 Exposure & Vulnerability Engines (`climate-exposure.service.ts`, `infrastructure-vulnerability.service.ts`)
- Evaluates asset proximity to hazards and computes vulnerability scores ($0-100$) classified into `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.

### 2.4 Resilience Score Engine (`lib/server/services/climate-resilience-score.service.ts`)
- Calculates city composite climate resilience score ($58.4 / 100$, classified `VULNERABLE`).

### 2.5 Adaptation Recommendation & Investment Engines (`climate-adaptation.service.ts`, `climate-investment-priority.service.ts`)
- Generates advisory infrastructure adaptation plans (Plan A - Balanced, Plan B - Max Shield) requiring explicit human authorization.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/climate` | `GET` | `JWT + RBAC` | Climate resilience overview summary |
| `/api/v1/digital-twin/climate/scenarios` | `GET` | `JWT + RBAC` | List climate hazard scenarios |
| `/api/v1/digital-twin/climate/scenarios` | `POST` | `JWT + RBAC` | Create new climate hazard scenario |
| `/api/v1/digital-twin/climate/exposure` | `GET` | `JWT + RBAC` | List exposed assets under climate scenario |
| `/api/v1/digital-twin/climate/vulnerability` | `GET` | `JWT + RBAC` | List infrastructure vulnerability indices |
| `/api/v1/digital-twin/climate/resilience` | `GET` | `JWT + RBAC` | Get composite city resilience score |
| `/api/v1/digital-twin/climate/adaptations` | `GET` | `JWT + RBAC` | List advisory adaptation options |
| `/api/v1/digital-twin/climate/adaptations/[id]/approve` | `POST` | `JWT + RBAC` | Record human authorization for adaptation plan |
| `/api/v1/digital-twin/climate/investments` | `GET` | `JWT + RBAC` | List capital adaptation investment priorities |
