# EarthMind PIOS — Phase 7.2 Enterprise Digital Twin Simulation Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.2 — Digital Twin Simulation & What-If Scenario Intelligence  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Simulation Isolation

Phase 7.2 transforms the Urban Digital Twin into an interactive **What-If Scenario Simulation Platform**:

$$\text{DIGITAL TWIN} \rightarrow \text{SELECT ASSET/ZONE} \rightarrow \text{HYPOTHETICAL INPUTS} \rightarrow \text{SIMULATION RUN} \rightarrow \text{IMPACT PROPAGATION} \rightarrow \text{BASELINE VS SCENARIO COMPARISON} \rightarrow \text{EXPLAINABLE ADVISORY RECOMMENDATION} \rightarrow \text{HUMAN REVIEW} \rightarrow \text{AUTHORIZED DISPATCH}$$

### Non-Negotiable Safety Principle:
> [!IMPORTANT]
> **Production State Isolation**:
> All scenario simulations run in isolated memory models using cloned asset entities.
> Simulation execution **NEVER** mutates live production infrastructure status, dispatches real responders, or broadcasts emergency notifications without explicit human authorization (`requiresHumanApproval: true`).

---

## 2. Core Subsystems

### 2.1 Simulation Domain (`lib/server/domain/digital-twin/simulation.domain.ts`)
- **Scenario Lifecycle**: `DRAFT`, `CONFIGURED`, `RUNNING`, `COMPLETED`, `REVIEWING`, `APPROVED`, `REJECTED`, `ARCHIVED`.
- **Supported Scenario Types**: `FLOOD_SIMULATION`, `FIRE_SIMULATION`, `POWER_FAILURE`, `WATER_NETWORK_FAILURE`, `ROAD_CLOSURE`, `TRAFFIC_DISRUPTION`, `GARBAGE_OVERLOAD`, `INFRASTRUCTURE_FAILURE`, `EXTREME_WEATHER`, `RESOURCE_REALLOCATION`, `MAINTENANCE_INTERVENTION`, `CUSTOM_SCENARIO`.

### 2.2 Impact Propagation Engine (`lib/server/services/digital-twin-impact-propagation.service.ts`)
- Evaluates relationship dependency chains (e.g. `PUMP FAILURE` $\rightarrow$ `DRAINAGE SURGE` $\rightarrow$ `ROAD INUNDATION` $\rightarrow$ `RESPONSE DELTA`).

### 2.3 Baseline vs Scenario Comparison Engine (`lib/server/services/digital-twin-comparison.service.ts`)
- Calculates risk deltas (+15.7 pts), critical asset counts, estimated incidents generated, and response time delays.

### 2.4 Digital Twin Simulation Engine (`lib/server/services/digital-twin-simulation.service.ts`)
- Orchestrates scenario creation, isolated propagation execution, baseline comparison, and advisory mitigation recommendations.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/simulations` | `GET` | `JWT + RBAC` | List digital twin simulation scenarios |
| `/api/v1/digital-twin/simulations` | `POST` | `JWT + RBAC` | Create new simulation scenario |
| `/api/v1/digital-twin/simulations/[id]` | `GET` | `JWT + RBAC` | Retrieve single scenario detail |
| `/api/v1/digital-twin/simulations/[id]/run` | `POST` | `JWT + RBAC` | Run simulation in isolated memory |
| `/api/v1/digital-twin/simulations/[id]/approve` | `POST` | `JWT + RBAC` | Record human authorization approval |
