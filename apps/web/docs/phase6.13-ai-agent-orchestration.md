# EarthMind PIOS — Phase 6.13 Enterprise AI Agent Orchestration & Knowledge Intelligence Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 6.13 — AI Agent Orchestration & Knowledge Intelligence  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Principles

Phase 6.13 transforms EarthMind PIOS into a unified AI-powered operational intelligence platform:

$$\text{UNDERSTAND} \rightarrow \text{RETRIEVE} \rightarrow \text{VERIFY} \rightarrow \text{ANALYZE} \rightarrow \text{REASON} \rightarrow \text{RECOMMEND} \rightarrow \text{REQUEST HUMAN AUTHORIZATION} \rightarrow \text{EXECUTE AUTHORIZED ACTION} \rightarrow \text{AUDIT}$$

### Key Principles:
1. **Additive Architecture**: Reuses all existing authentication, RBAC, evidence management, AI vision, GIS, dispatch, predictive intelligence, and Command Center services.
2. **Pluggable Tool Registry**: Exposes 20 registered operational tools with fine-grained permission scopes.
3. **Verified Knowledge Citations**: Every AI-generated operational recommendation identifies supporting source records (Incident ID, SHA-256 Evidence Checksum, Prediction Entity ID, Warning ID).
4. **Mandatory Human-in-the-Loop Safeguards**: AI recommendations never execute consequential actions (dispatch, escalation, warnings, resource reallocation) without explicit authorized human approval (`requiresHumanApproval: true`).

---

## 2. Core Subsystems

### 2.1 AI Agent Domain Model (`lib/server/domain/ai-agent.domain.ts`)
- **Agent Lifecycle States**: `IDLE`, `RECEIVING`, `RETRIEVING`, `ANALYZING`, `REASONING`, `GENERATING_RECOMMENDATION`, `WAITING_FOR_APPROVAL`, `EXECUTING`, `COMPLETED`, `FAILED`, `CANCELLED`.
- **Supported Task Types**: `INCIDENT_ANALYSIS`, `RISK_ANALYSIS`, `RESOURCE_PLANNING`, `DISPATCH_ANALYSIS`, `PREDICTION_ANALYSIS`, `CROSS_CITY_ANALYSIS`, `CITIZEN_REPORT_ANALYSIS`, `EVIDENCE_ANALYSIS`, `SITUATION_SUMMARY`, `DECISION_SUPPORT`, `EMERGENCY_BRIEFING`, `DAILY_OPERATIONS_BRIEF`, `CUSTOM_QUERY`.

### 2.2 Tool Registry (`lib/server/ai-agents/tool-registry.ts`)
- Registers 20 operational tools with RBAC definitions:
  - `tool-evd-search`, `tool-evd-meta`, `tool-vision-analyze`, `tool-gis-query`, `tool-juris-lookup`, `tool-inc-search`, `tool-disp-status`, `tool-resp-avail`, `tool-reg-risk`, `tool-pred-get`, `tool-warn-get`, `tool-sit-snap`, `tool-cit-search`, `tool-cit-fb`, `tool-hist-search`, `tool-sla-status`, `tool-dept-workload`, `tool-city-compare`, `tool-timeline-get`, `tool-audit-get`.

### 2.3 Knowledge Retrieval Engine (`lib/server/ai-agents/knowledge-retrieval.service.ts`)
- Generates `KnowledgeCitationDto` linking operational facts to verified source records.

### 2.4 AI Reasoning & Guardrail Engine (`lib/server/ai-agents/reasoning-engine.service.ts` & `guardrail.service.ts`)
- Evaluates confidence thresholds ($\ge 70\%$), flags stale/conflicting data, and enforces human authorization guardrails.

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/ai/query` | `POST` | `JWT + RBAC` | Execute natural language operational AI query |
| `/api/v1/ai/tasks` | `GET` | `JWT + RBAC` | List AI agent tasks and reasoning states |
| `/api/v1/ai/tasks/[id]` | `GET` | `JWT + RBAC` | Retrieve detailed AI task breakdown with citations |
| `/api/v1/ai/briefings` | `GET` | `JWT + RBAC` | Generate executive emergency briefing |
| `/api/v1/ai/recommendations/[id]/approve` | `POST` | `JWT + RBAC` | Authorize AI decision recommendation |
| `/api/v1/ai/recommendations/[id]/reject` | `POST` | `JWT + RBAC` | Reject AI decision recommendation |
