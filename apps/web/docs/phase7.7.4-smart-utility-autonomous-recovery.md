# EarthMind PIOS — Phase 7.7.4 Smart Utility Autonomous Recovery & Resilience Optimization Architecture

> **System Name:** EarthMind PIOS (Public Impact Operations System)  
> **Subsystem:** Phase 7.7.4 — Smart Utility Autonomous Recovery & Resilience Optimization  
> **Status:** `PRODUCTION READY & CERTIFIED`  

---

## 1. Architectural Vision & Pipeline

Phase 7.7.4 extends EarthMind PIOS into an **Advisory Multi-Objective Recovery & Resilience Optimization Platform**:

$$\text{UTILITY FAILURE DATA} \rightarrow \text{NETWORK STATE} \rightarrow \text{CANDIDATE GENERATION} \rightarrow \text{MULTI-OBJECTIVE OPTIMIZATION} \rightarrow \text{RESOURCE ALLOCATION} \rightarrow \text{RECOVERY SEQUENCE} \rightarrow \text{HUMAN AUTHORIZATION}$$

### Mandatory Governance & Data Tagging Directives:
> [!IMPORTANT]
> **Data Transparency & Human Governance**:
> Multi-objective optimization algorithms run in advisory mode and NEVER execute live infrastructure changes directly.
> Every recommended recovery plan strictly enforces `requiresHumanApproval: true` before real-world execution.

---

## 2. Core Subsystems

### 2.1 Optimization Domain (`lib/server/domain/digital-twin/utility-optimization.domain.ts`)
- **Objectives**: `MINIMIZE_COST`, `MINIMIZE_DOWNTIME`, `MINIMIZE_POPULATION_IMPACT`, `MAXIMIZE_RESILIENCE`, `MAXIMIZE_SERVICE_CONTINUITY`, `BALANCED`.
- **Action Types**: `INSPECT`, `REPAIR`, `REPLACE`, `ISOLATE`, `REROUTE`, `ACTIVATE_BACKUP`, `DEPLOY_GENERATOR`, `DEPLOY_PUMP`, `RECONFIGURE_NETWORK`, `RESTORE_SERVICE`.
- **Optimization Lifecycle**: `CREATED` $\rightarrow$ `ANALYZING` $\rightarrow$ `OPTIMIZED` $\rightarrow$ `RECOMMENDED` $\rightarrow$ `WAITING_FOR_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `REJECTED` $\rightarrow$ `EXECUTING` $\rightarrow$ `EXECUTED`.

### 2.2 Operational Constraint Engine (`utility-optimization-constraint.service.ts`)
- Evaluates candidate plans against hard limits: `MAX_BUDGET` ($15,000$), `MAX_DOWNTIME` ($4.0\text{ hrs}$), `MAX_POPULATION_IMPACT` ($20,000$), `MAX_CREW_USAGE` ($10$), and `MAX_EQUIPMENT_USAGE` ($5$), classifying candidates as `FEASIBLE` or `INFEASIBLE`.

### 2.3 Recovery Sequencing & Resource Allocation Engines (`utility-recovery-sequence.service.ts`, `utility-resource-allocation.service.ts`)
- Computes ordered recovery timelines ($1.5\text{ hrs}$ total) and allocates engineering teams ($1$), electrical crews ($2$), mobile generators ($1$), and replacement components ($1$).

### 2.4 Master Optimization & Comparison Services (`utility-recovery-optimization.service.ts`, `utility-optimization-comparison.service.ts`)
- Evaluates CANDIDATE_A vs CANDIDATE_B vs CANDIDATE_C and generates advisory recommendations under human authorization (`requiresHumanApproval: true`).

---

## 3. REST API Suite

| Endpoint | Method | Security | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/digital-twin/utilities/optimizations` | `GET` | `JWT + RBAC` | List active recovery optimization scenarios |
| `/api/v1/digital-twin/utilities/optimizations` | `POST` | `JWT + RBAC` | Create new multi-objective recovery scenario |
| `/api/v1/digital-twin/utilities/optimizations/[id]` | `GET` | `JWT + RBAC` | Get detailed optimization scenario state |
| `/api/v1/digital-twin/utilities/optimizations/[id]/run` | `POST` | `JWT + RBAC` | Run multi-objective optimization algorithm |
| `/api/v1/digital-twin/utilities/optimizations/[id]/candidates` | `GET` | `JWT + RBAC` | Retrieve candidate recovery plans |
| `/api/v1/digital-twin/utilities/optimizations/[id]/sequence` | `GET` | `JWT + RBAC` | Calculate step-by-step ordered recovery steps |
| `/api/v1/digital-twin/utilities/optimizations/[id]/resources` | `GET` | `JWT + RBAC` | Retrieve optimized crew & equipment allocation |
| `/api/v1/digital-twin/utilities/optimizations/[id]/comparison` | `GET` | `JWT + RBAC` | Compare candidates on cost, downtime & resilience |
| `/api/v1/digital-twin/utilities/optimizations/[id]/resilience` | `GET` | `JWT + RBAC` | Calculate resilience improvement delta |
| `/api/v1/digital-twin/utilities/optimizations/[id]/recommendation` | `GET` | `JWT + RBAC` | Retrieve advisory recommended recovery plan |
| `/api/v1/digital-twin/utilities/optimizations/[id]/approve` | `POST` | `JWT + RBAC` | Record human authorization with operator user audit |
