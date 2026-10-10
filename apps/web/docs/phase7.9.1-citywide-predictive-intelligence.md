# EarthMind PIOS — Phase 7.9.1 Citywide Predictive Intelligence Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.9.1 — Citywide Predictive Intelligence & Risk Forecasting Foundation  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.9.1 transforms cross-domain signals into a **Multi-Horizon Citywide Risk Prediction Engine**:

$$\text{HISTORICAL SIGNALS} \rightarrow \text{FEATURE NORMALIZATION} \rightarrow \text{TEMPORAL TRENDS} \rightarrow \text{FEATURE FUSION} \rightarrow \text{RISK FORECAST} \rightarrow \text{PREDICTION CONFIDENCE} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Human Controls:
> [!IMPORTANT]
> **Advisory Predictive Intelligence**:
> Multi-horizon risk predictions run in advisory mode and NEVER trigger autonomous infrastructure changes directly.
> Every predictive alert and risk forecast strictly enforces `requiresHumanApproval: true` before initiating mitigation actions.

---

## 2. Core Subsystems & Services

### 2.1 City Prediction Domain (`city-prediction.domain.ts`)
- Prediction Horizons: `1h`, `6h`, `24h`, `7d`, `30d`, `90d`.
- Trend Directions: `STABLE`, `INCREASING`, `DECREASING`, `VOLATILE`.
- DTOs: `CityPredictionEntity`, `PredictionSignalDto`, `PredictionFeatureDto`, `CityRiskForecastDto`, `PredictionConfidenceDto`, `PredictionHorizonDto`, `PredictionTrendDto`, `PredictiveAlertDto`, `CityPredictionSummaryDto`.

### 2.2 Historical Intelligence Service (`city-prediction-history.service.ts`)
- Supports deterministic simulation history windows (`1h`, `6h`, `24h`, `7d`, `30d`, `90d`).

### 2.3 Feature Engineering Service (`city-prediction-feature.service.ts`)
- Fuses Climate signals, Mobility congestion, Transit disruption, Utility health, Emergency response, Citizen reports, Cross-domain correlations, and Cascade risk scores.

### 2.4 Risk Prediction Engine (`city-risk-prediction.service.ts`)
- Generates predictions for flood risk, traffic disruption, transit disruption, utility outage, emergency demand, citywide service degradation, and cross-domain cascade risk ($82.5/100$, `CRITICAL` at $6\text{h}$ horizon).

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/predictions` | `GET` | `JWT + RBAC` | Get citywide predictive intelligence summary |
| `/api/v1/digital-twin/predictions/overview` | `GET` | `JWT + RBAC` | Retrieve primary citywide risk forecast |
| `/api/v1/digital-twin/predictions/trends` | `GET` | `JWT + RBAC` | Retrieve metric rate of change trend analysis |
| `/api/v1/digital-twin/predictions/risks` | `GET` | `JWT + RBAC` | Retrieve multi-horizon risk forecasts (1h to 90d) |
| `/api/v1/digital-twin/predictions/alerts` | `GET` | `JWT + RBAC` | Retrieve predictive risk alerts requiring approval |
| `/api/v1/digital-twin/predictions/history` | `GET` | `JWT + RBAC` | Retrieve historical simulation prediction windows |
