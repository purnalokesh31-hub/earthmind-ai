# EarthMind PIOS — Phase 7.7.3 Smart Utility Network Simulation & Resilience Optimization Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.7.3 — Smart Utility Network Simulation & Resilience Optimization  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.7.3 extends EarthMind PIOS into a **Network-Level Utility Failure Simulation & Resilience Optimization Platform**:

$$\text{UTILITY NETWORK} \rightarrow \text{FAILURE SCENARIO} \rightarrow \text{ISOLATED SIMULATION} \rightarrow \text{FAILURE PROPAGATION} \rightarrow \text{SERVICE IMPACT} \rightarrow \text{RESILIENCE SCORE} \rightarrow \text{RECOVERY PLANS} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Data Tagging Directives:
> [!IMPORTANT]
> **Data Transparency & Safety**:
> All network simulation results run in isolated memory and are explicitly tagged with `DATA_SOURCE = "SIMULATION"`.
> Advisory resilience recovery plans strictly enforce `requiresHumanApproval: true` before real-world execution.

---

## 2. Core Subsystems

### 2.1 Simulation Domain (`lib/server/domain/digital-twin/utility-simulation.domain.ts`)
- **Simulation Lifecycle**: `CREATED` $\rightarrow$ `RUNNING` $\rightarrow$ `COMPLETED` $\rightarrow$ `ANALYZED` $\rightarrow$ `RECOMMENDATION_READY` $\rightarrow$ `WAITING_FOR_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `REJECTED` $\rightarrow$ `ARCHIVED`.
- **Scenarios**: `TRANSFORMER_FAILURE`, `SUBSTATION_FAILURE`, `WATER_PUMP_FAILURE`, `PIPELINE_FAILURE`, `MULTI_ASSET_FAILURE`, `EXTREME_LOAD`, `EXTREME_DEMAND`, `CASCADING_FAILURE`, `CUSTOM_UTILITY_FAILURE`.

### 2.2 Network Graph & Failure Propagation Engines (`utility-network-graph.service.ts`, `utility-failure-propagation.service.ts`)
- Builds logical dependency graph linking substations, transformers, feeder lines, pump stations, pipelines, utility zones, and critical facilities.
- Traces multi-hop cascading failure propagation depth ($3\text{ hops}$, cascading risk score $84.5$).

### 2.3 Service Impact & Resilience Engines (`utility-service-impact.service.ts`, `utility-resilience.service.ts`)
- Simulates affected population ($14,200\text{ residents}$) and computes network resilience score ($48.5 / 100$, `VULNERABLE`).

### 2.4 Recovery Strategy & Resilience Optimization Engines (`utility-recovery.service.ts`, `utility-resilience-optimization.service.ts`)
- Evaluates candidate recovery plans (PLAN_A, PLAN_B, PLAN_C) and recommends inter-tie breaker load reroutes under explicit human authorization (`requiresHumanApproval: true`).

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/utilities/simulations` | `GET` | `JWT + RBAC` | List active simulation scenarios |
| `/api/v1/digital-twin/utilities/simulations` | `POST` | `JWT + RBAC` | Create new utility failure simulation scenario |
| `/api/v1/digital-twin/utilities/simulations/[id]` | `GET` | `JWT + RBAC` | Get detailed simulation scenario state |
| `/api/v1/digital-twin/utilities/simulations/[id]/run` | `POST` | `JWT + RBAC` | Run utility scenario in isolated memory |
| `/api/v1/digital-twin/utilities/simulations/[id]/propagation` | `GET` | `JWT + RBAC` | Retrieve failure propagation chain |
| `/api/v1/digital-twin/utilities/simulations/[id]/impact` | `GET` | `JWT + RBAC` | Calculate simulated population & service impact |
| `/api/v1/digital-twin/utilities/simulations/[id]/resilience` | `GET` | `JWT + RBAC` | Calculate network resilience score |
| `/api/v1/digital-twin/utilities/simulations/[id]/recovery` | `GET` | `JWT + RBAC` | Generate advisory recovery plans |
| `/api/v1/digital-twin/utilities/simulations/[id]/comparison` | `GET` | `JWT + RBAC` | Compare baseline vs simulated scenario |
| `/api/v1/digital-twin/utilities/resilience` | `GET` | `JWT + RBAC` | Retrieve network resilience overview |
| `/api/v1/digital-twin/utilities/resilience/optimization` | `GET` | `JWT + RBAC` | Retrieve resilience optimization plan |
| `/api/v1/digital-twin/utilities/simulations/[id]/approve` | `POST` | `JWT + RBAC` | Record human approval for recovery plan |
