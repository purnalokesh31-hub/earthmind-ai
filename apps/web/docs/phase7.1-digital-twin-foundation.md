# EarthMind PIOS — Phase 7.1 Urban Digital Twin Foundation Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.1 — Urban Digital Twin Foundation  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Executive Summary & Architectural Vision

Phase 7.1 establishes the **Urban Digital Twin Foundation** for EarthMind PIOS, transforming the platform into a structured, continuously updateable digital representation of real-world municipal infrastructure.

$$\text{COUNTRY} \rightarrow \text{STATE} \rightarrow \text{REGION} \rightarrow \text{DISTRICT} \rightarrow \text{CITY} \rightarrow \text{ZONE} \rightarrow \text{INFRASTRUCTURE ASSET} \rightarrow \text{SENSOR / TELEMETRY}$$

The digital twin foundation operates as an **ADDITIVE ONLY** layer that integrates seamlessly with existing Phase 6.1–6.13 capabilities:
- **Phase 6.5 Evidence Platform**: SHA-256 evidence chain-of-custody linked directly to Twin Entities.
- **Phase 6.6 AI Vision**: YOLOv8/SAM hazard detection telemetry updates asset condition scores.
- **Phase 6.9 Geospatial Hierarchy**: Country/State/Region/District/City/Zone spatial resolution.
- **Phase 6.10 Predictive Intelligence**: Risk forecasts map directly onto infrastructure assets.

---

## 2. Digital Twin Domain Architecture

### 2.1 Domain Model (`lib/server/domain/digital-twin/digital-twin.domain.ts`)
- **Supported Asset Categories**: `ROAD`, `BRIDGE`, `BUILDING`, `DRAINAGE`, `WATER_PIPELINE`, `ELECTRICAL_POLE`, `TRANSFORMER`, `STREET_LIGHT`, `PUBLIC_FACILITY`, `TRAFFIC_SIGNAL`, `WASTE_INFRASTRUCTURE`, `EMERGENCY_FACILITY`.
- **Operational States**: `OPERATIONAL`, `DEGRADED`, `DAMAGED`, `CRITICAL`, `OFFLINE`, `UNDER_MAINTENANCE`, `UNKNOWN`.
- **Telemetry Categories**: `TEMPERATURE`, `WATER_LEVEL`, `RAINFALL`, `VIBRATION`, `ELECTRICAL_LOAD`, `POWER_STATUS`, `TRAFFIC_DENSITY`, `AIR_QUALITY`, `PIPELINE_PRESSURE`, `STRUCTURAL_HEALTH`, `SENSOR_HEALTH`.

---

## 3. Core Engine Implementations

### 3.1 Digital Twin State Engine (`lib/server/services/digital-twin-state.service.ts`)
- Maintains asset operational states, condition scores ($0-100\%$), and maintenance statuses (`GOOD`, `INSPECTION_DUE`, `REPAIR_REQUIRED`, `UNDER_REPAIR`). Validates state transition rules.

### 3.2 Telemetry Abstraction Service (`lib/server/services/twin-telemetry.service.ts`)
- Provider abstraction (`ITelemetryProvider` interface) with `SimulationTelemetryProvider` yielding deterministic sensor readings.

### 3.3 Event Engine (`lib/server/services/digital-twin-event.service.ts`)
- Emits immutable, timestamped audit events (`ASSET_CREATED`, `ASSET_DAMAGED`, `TELEMETRY_UPDATED`, `INCIDENT_LINKED`, etc.).

---

## 4. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin` | `GET` | `JWT + RBAC` | Real-time digital twin municipal overview summary |
| `/api/v1/digital-twin/assets` | `GET` | `JWT + RBAC` | Infrastructure asset registry listing by city |
| `/api/v1/digital-twin/assets/[id]` | `GET` | `JWT + RBAC` | Single asset detail with linked incidents & evidence |
| `/api/v1/digital-twin/telemetry` | `GET` | `JWT + RBAC` | Real-time sensor telemetry readings |
| `/api/v1/digital-twin/events` | `GET` | `JWT + RBAC` | Immutable Digital Twin event audit log |
