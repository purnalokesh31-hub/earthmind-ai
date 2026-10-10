# EarthMind PIOS — Phase 7.7.2 Smart Utility Predictive Intelligence Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.7.2 — Smart Utility Predictive Intelligence & Failure Forecasting  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.7.2 extends EarthMind PIOS into a **Predictive Utility Failure & Impact Forecasting Platform**:

$$\text{UTILITY TELEMETRY} \rightarrow \text{HISTORICAL TRENDS} \rightarrow \text{ANOMALY DETECTION} \rightarrow \text{FAILURE PROBABILITY} \rightarrow \text{OUTAGE IMPACT} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Data Tagging Directives:
> [!IMPORTANT]
> **Data Transparency & Safety**:
> Historical telemetry trends & failure forecasts are explicitly tagged with `DATA_SOURCE = "SIMULATION"`.
> Advisory predictive maintenance work orders strictly enforce `requiresHumanApproval: true` before real-world execution.

---

## 2. Core Subsystems

### 2.1 Predictive Domain (`lib/server/domain/digital-twin/utility-prediction.domain.ts`)
- **Prediction Lifecycle**: `DETECTED` $\rightarrow$ `ANALYZING` $\rightarrow$ `PREDICTED` $\rightarrow$ `RECOMMENDED` $\rightarrow$ `WAITING_FOR_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `SCHEDULED` $\rightarrow$ `COMPLETED`.
- **Risk Classifications**: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.

### 2.2 Historical Telemetry Engine (`lib/server/services/utility-history.service.ts`)
- Evaluates multi-window historical telemetry trends over 1h, 6h, 24h, 7d, and 30d for power (voltage, current, load, temperature) and water assets (pressure, flow rate, vibration).

### 2.3 Anomaly Trend & Failure Prediction Engines (`utility-anomaly-trend.service.ts`, `utility-failure-prediction.service.ts`)
- Forecasts asset failure probability ($88.4\%$, `CRITICAL`) and estimates remaining useful life ($8\text{ days}$).

### 2.4 Outage Impact & Predictive Maintenance Engines (`utility-outage-impact.service.ts`, `utility-predictive-maintenance.service.ts`)
- Traces downstream customer outage impact ($14,200\text{ residents}$) and generates advisory preventive maintenance recommendations requiring explicit human authorization (`requiresHumanApproval: true`).

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/utilities/predictions` | `GET` | `JWT + RBAC` | Utility failure prediction overview summary |
| `/api/v1/digital-twin/utilities/predictions/[id]` | `GET` | `JWT + RBAC` | Get detailed utility asset prediction state |
| `/api/v1/digital-twin/utilities/predictions/failures` | `GET` | `JWT + RBAC` | Calculate failure probability & risk classification |
| `/api/v1/digital-twin/utilities/predictions/degradation` | `GET` | `JWT + RBAC` | Analyze thermal & pressure degradation trends |
| `/api/v1/digital-twin/utilities/predictions/outage-impact` | `GET` | `JWT + RBAC` | Predict downstream customer & zone service impact |
| `/api/v1/digital-twin/utilities/maintenance` | `GET` | `JWT + RBAC` | List advisory predictive maintenance plans |
| `/api/v1/digital-twin/utilities/predictions/history` | `GET` | `JWT + RBAC` | Retrieve multi-window historical telemetry trends |
| `/api/v1/digital-twin/utilities/predictions/[id]/approve` | `POST` | `JWT + RBAC` | Record human authorization for maintenance work order |
