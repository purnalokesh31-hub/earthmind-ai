# EarthMind PIOS — Phase 7.8 Cross-Domain Urban Intelligence & Integrated Resilience Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.8 — Cross-Domain Urban Intelligence & Integrated Resilience  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.8 converts independent domain signals (Climate, Mobility, Transit, Utility, Emergency Response, Citizen Intelligence) into a **Unified Citywide Situational Awareness Model**:

$$\text{DOMAIN SIGNALS} \rightarrow \text{NORMALIZATION} \rightarrow \text{CORRELATION} \rightarrow \text{CAUSAL CHAIN} \rightarrow \text{CASCADE PROPAGATION} \rightarrow \text{CITYWIDE RISK} \rightarrow \text{URBAN PRIORITY QUEUE}$$

### Mandatory Governance & Human Controls:
> [!IMPORTANT]
> **Advisory Intelligence System**:
> Phase 7.8 is an intelligence & situational-awareness engine, NOT an autonomous execution system.
> Every recommended priority action strictly enforces `requiresHumanApproval: true` before any operational response.

---

## 2. Core Subsystems & Services

### 2.1 Cross-Domain Correlation Engine (`cross-domain-correlation.service.ts`)
- Supports 6 correlation types: `TEMPORAL`, `SPATIAL`, `CAUSAL`, `OPERATIONAL`, `RESOURCE`, `SERVICE_IMPACT`.
- Generates detailed multi-hop causal chains (e.g. `Extreme Flood -> Road Closure -> Traffic Congestion -> Bus Delay -> Emergency Dispatch Delay`).

### 2.2 Citywide Cascade Risk Engine (`citywide-cascade-risk.service.ts`)
- Calculates cascade risk scores from $0-100$ and classifies risk state:
  - $0-19$: `LOW`
  - $20-39$: `GUARDED`
  - $40-59$: `ELEVATED`
  - $60-79$: `HIGH`
  - $80-100$: `CRITICAL`
- Evaluates direct, secondary, and tertiary propagation metrics, response difficulty, and recovery complexity.

### 2.3 Urban Priority Queue Engine (`urban-priority.service.ts`)
- Ranks citywide incidents using severity, population affected, service criticality, cascade risk score, and time sensitivity.
- Enforces `requiresHumanApproval: true` on every advisory priority item.

### 2.4 Master City Intelligence Service (`city-intelligence.service.ts`)
- Fuses all domain signals into a unified `CityIntelligenceSummaryDto` representing real-time citywide situational awareness.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/cross-domain/intelligence` | `GET` | `JWT + RBAC` | Get unified citywide situational awareness summary |
| `/api/v1/digital-twin/cross-domain/correlations` | `GET` | `JWT + RBAC` | List active cross-domain correlations & causal chains |
| `/api/v1/digital-twin/cross-domain/cascade-risk` | `GET` | `JWT + RBAC` | Retrieve citywide cascade risk score & classification |
| `/api/v1/digital-twin/cross-domain/priority-queue` | `GET` | `JWT + RBAC` | Retrieve ranked citywide urban priority queue |
