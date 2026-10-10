# EarthMind PIOS — Phase 7.9.2 Citywide Predictive Scenario Simulation Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.9.2 — Citywide Predictive Scenario Simulation & Impact Forecasting  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.9.2 adds a **What-If Cross-Domain Predictive Scenario Simulation Subsystem** to EarthMind PIOS:

$$\text{PREDICTIVE FORECAST} \rightarrow \text{WHAT-IF SCENARIO} \rightarrow \text{CASCADE SIMULATION} \rightarrow \text{IMPACT FORECAST} \rightarrow \text{RISK COMPARISON} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Human Controls:
> [!IMPORTANT]
> **Advisory Simulation Subsystem**:
> Predictive scenario simulations are strictly advisory what-if tools. They NEVER execute consequential infrastructure changes automatically.
> Every scenario recommendation enforces `requiresHumanApproval: true` before human operator authorization.

---

## 2. Core Subsystems & Services

### 2.1 Simulation Domain (`city-prediction-simulation.domain.ts`)
- Scenario Types: `CLIMATE_ESCALATION`, `TRANSIT_DISRUPTION`, `UTILITY_FAILURE`, `TRAFFIC_SURGE`, `EMERGENCY_SURGE`, `MULTI_DOMAIN_CASCADE`, `CUSTOM_CITYWIDE_SCENARIO`.
- Severity Levels: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
- Lifecycle: `DRAFT`, `READY`, `RUNNING`, `COMPLETED`, `FAILED`, `ARCHIVED`.
- DTOs: `CityPredictionScenarioEntity`, `CityPredictionScenarioInputDto`, `PredictionScenarioVariableDto`, `PredictionScenarioResultDto`, `PredictionScenarioRiskDto`, `PredictionScenarioImpactDto`, `PredictionScenarioCascadeDto`, `PredictionScenarioComparisonDto`, `PredictionScenarioRecommendationDto`, `PredictionScenarioApprovalDto`.

### 2.2 In-Memory Simulation Repository (`city-prediction-simulation.repository.ts`)
- `MemoryCityPredictionSimulationRepository`: CRUD management of scenario inputs, execution results, comparison deltas, and approval audit records.

### 2.3 Predictive Simulation Service (`city-prediction-simulation.service.ts`)
- `createScenario`: creates new scenario inputs with custom domain variables and constraint thresholds.
- `runScenario`: executes what-if cross-domain cascade propagation, risk delta calculation ($+36.5\text{ pts}$), municipal impact forecasting, constraint check, and advisory recommendation (`requiresHumanApproval: true`).
- `compareScenarios`: computes risk score, downtime, and cost deltas between scenario options.
- `approveRecommendation`: records human operator authorization and audit log.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/predictions/simulations` | `GET / POST` | `JWT + RBAC` | List active scenarios or create a new what-if scenario |
| `/api/v1/digital-twin/predictions/simulations/[id]` | `GET` | `JWT + RBAC` | Get complete scenario detail & simulation results |
| `/api/v1/digital-twin/predictions/simulations/[id]/run` | `POST` | `JWT + RBAC` | Execute cross-domain cascade scenario simulation |
| `/api/v1/digital-twin/predictions/simulations/[id]/recommendation` | `GET` | `JWT + RBAC` | Retrieve advisory scenario mitigation recommendation |
| `/api/v1/digital-twin/predictions/simulations/[id]/approve` | `POST` | `JWT + RBAC` | Authorize scenario recommendation (human approval) |
| `/api/v1/digital-twin/predictions/simulations/compare` | `GET` | `JWT + RBAC` | Compare risk, cost, and downtime deltas between scenarios |
