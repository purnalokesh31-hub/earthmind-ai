# EarthMind PIOS — Phase 7.7.1 Smart Utility Infrastructure Digital Twin Foundation Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.7.1 — Smart Utility Infrastructure Digital Twin Foundation  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Hierarchy

Phase 7.7.1 extends EarthMind PIOS into a **Smart Utility Infrastructure Digital Twin Platform**:

$$\text{COUNTRY} \rightarrow \text{STATE} \rightarrow \text{REGION} \rightarrow \text{DISTRICT} \rightarrow \text{CITY} \rightarrow \text{UTILITY ZONE} \rightarrow \text{UTILITY NETWORK} \rightarrow \text{UTILITY ASSET} \rightarrow \text{SENSOR}$$

### Covered Utility Infrastructure:
1. **Electricity Network**: Power substations, distribution transformers, feeder lines, electrical poles.
2. **Water Network**: Water treatment plants, pump stations, storage tanks, distribution pipelines, control valves.

### Mandatory Governance & Data Tagging Directives:
> [!IMPORTANT]
> **Data Transparency & Safety**:
> Simulated utility telemetry indicators are explicitly tagged with `DATA_SOURCE = "SIMULATION"`.
> All state evaluations & recommended preventive maintenance dispatches strictly enforce `requiresHumanApproval: true` before real-world execution.

---

## 2. Core Subsystems

### 2.1 Utility Domain (`lib/server/domain/digital-twin/utility.domain.ts`)
- **Utility Types**: `ELECTRICITY`, `WATER`.
- **Asset Types**: `POWER_SUBSTATION`, `DISTRIBUTION_TRANSFORMER`, `FEEDER_LINE`, `ELECTRICAL_POLE`, `WATER_TREATMENT_PLANT`, `WATER_PUMP_STATION`, `WATER_STORAGE_TANK`, `DISTRIBUTION_PIPELINE`, `CONTROL_VALVE`.
- **Asset States**: `OPERATIONAL`, `DEGRADED`, `CRITICAL`, `OFFLINE`, `UNDER_MAINTENANCE`.

### 2.2 Telemetry Provider Abstraction (`lib/server/services/utility-telemetry.service.ts`)
- `IUtilityTelemetryProvider` interface with `SimulationUtilityTelemetryProvider` delivering power metrics (voltage, current, load, core temperature) and water metrics (pipeline pressure, flow rate, tank level, leakage indicators).

### 2.3 Utility State & Event Engines (`utility-state.service.ts`, `utility-event.service.ts`)
- Evaluates asset health scores ($0-100$) and records immutable audit events for state changes, telemetry anomalies, and outages.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/utilities` | `GET` | `JWT + RBAC` | Utility infrastructure overview & sector health |
| `/api/v1/digital-twin/utilities/assets` | `GET` | `JWT + RBAC` | List utility assets with type filtering |
| `/api/v1/digital-twin/utilities/assets/[id]` | `GET` | `JWT + RBAC` | Get detailed utility asset specs & condition score |
| `/api/v1/digital-twin/utilities/telemetry` | `GET` | `JWT + RBAC` | Get live/simulated asset telemetry readings |
| `/api/v1/digital-twin/utilities/events` | `GET` | `JWT + RBAC` | Retrieve immutable utility anomaly & outage event history |
| `/api/v1/digital-twin/utilities/zones` | `GET` | `JWT + RBAC` | Retrieve utility zone sector health summaries |
