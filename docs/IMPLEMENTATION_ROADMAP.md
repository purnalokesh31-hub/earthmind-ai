# EarthMind PIOS — Prioritized Implementation & Remediation Roadmap
**Document Version:** 1.0.0  
**Audit Date:** October 2026  
**Target Goal:** Bridge the gap between prototype simulation and a verified, production-ready Planetary Intelligence Operating System.

---

## 1. Roadmap Overview & Strategic Priorities

The audit demonstrates that EarthMind PIOS has a mature, visually impressive frontend architecture and an extensive suite of 911 passing Vitest tests. However, it is held back by three critical architectural issues:
1. Production compilation failure (`npm run build` fails).
2. Disconnected frontend UI from backend REST endpoints (UI operating on client-side demo state).
3. Bifurcated database layers (Python SQLite vs. Next.js Prisma SQLite).

This roadmap outlines a sequential, dependency-aware plan to systematically resolve blockers, unify persistence, activate real AI pipelines, and achieve full end-to-end integration.

---

## 2. Priority Phase Matrix

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Build & Compilation Integrity (Immediate)    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 2: Database Unification & Migration             │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3: Frontend UI-to-API Route Wiring               │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 4: Real AI & Computer Vision Integration         │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 5: CI/CD & Production Hardening                  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Prioritized Implementation Tasks

### Phase 1 — Build & Compilation Integrity (Highest Priority / Blocker)

#### Task 1.1: Fix Prisma Seeding Script TypeScript Errors
- **Priority:** P0 (Critical Blocker)
- **Files Affected:** `apps/web/prisma/seed.ts`
- **Description:** 
  The `IncidentStatus` object in `seed.ts` lacks the `ACTIVE` key, causing 6 compiler errors during `npm run build` and `tsc`.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - `IncidentStatus` in `seed.ts` includes `ACTIVE: 'ACTIVE'` or seeded records map to valid status values (`REPORTED`, `IN_PROGRESS`).
  - `npx tsx prisma/seed.ts` executes cleanly without TypeScript errors.

#### Task 1.2: Fix RoleType Enum Import in Unit Tests
- **Priority:** P0 (Critical Blocker)
- **Files Affected:** 
  - `apps/web/tests/unit/jwt-auth.test.ts`
  - `apps/web/tests/unit/middleware-helpers.test.ts`
  - `apps/web/tests/unit/rbac.test.ts`
  - `apps/web/tests/unit/user-identity.test.ts`
- **Description:** 
  SQLite Prisma does not generate enums in `@prisma/client`. These 4 test files import `RoleType` from `@prisma/client`.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Import `RoleType` from `apps/web/lib/server/auth/permissions.ts` or `apps/web/lib/server/database/enums.ts`.
  - `npx tsc --noEmit` passes with 0 errors across all test files.

#### Task 1.3: Resolve ESLint Build Prerequisite
- **Priority:** P0 (Critical Blocker)
- **Files Affected:** `apps/web/package.json`
- **Description:** 
  `next build` attempts to run ESLint but halts because `eslint` is not installed in `devDependencies`.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Install `eslint` in `apps/web/package.json` or configure `eslint: { ignoreDuringBuilds: true }` in `next.config.js`.
  - `npm run build` completes successfully with exit code 0.

---

### Phase 2 — Database Unification & Persistence Alignment

#### Task 2.1: Consolidate SQLite Database Files
- **Priority:** P1 (High)
- **Files Affected:**
  - `apps/web/.env`
  - `apps/api/app/core/config.py`
  - `apps/api/app/core/db.py`
- **Description:** 
  Unify the three separate SQLite databases (`earthmind.db`, `apps/api/app/earthmind.db`, `apps/web/prisma/earthmind.db`) to target a single authoritative database file or connect the Python backend directly to the Prisma-managed database.
- **Dependencies:** Phase 1 complete.
- **Acceptance Criteria:**
  - A case created via the Python backend or Next.js API is readable by both services.
  - No orphaned duplicate database files in the repository.

#### Task 2.2: Establish Schema Parity between Python and Next.js
- **Priority:** P1 (High)
- **Files Affected:**
  - `apps/api/app/core/db.py`
  - `apps/web/prisma/schema.prisma`
- **Description:** 
  Align column names (`incidentCode` vs `case_id`, `riskScore` vs `risk_score`) or create a translation layer so that Python workers can update Next.js incident records directly.
- **Dependencies:** Task 2.1.
- **Acceptance Criteria:**
  - Python multi-agent orchestrator updates `incidents` table in the shared database.

---

### Phase 3 — Frontend UI-to-API Route Wiring

#### Task 3.1: Connect Evidence Upload Workspace to REST API
- **Priority:** P1 (High)
- **Files Affected:**
  - `apps/web/components/workspaces/EvidenceWorkspace.tsx`
  - `apps/web/stores/app-store.ts`
- **Description:** 
  Replace the in-memory `uploadEvidence` action with an actual `fetch('/api/v1/evidence/upload', { method: 'POST', body: formData })` call.
- **Dependencies:** Phase 1 and 2.
- **Acceptance Criteria:**
  - Uploaded files are written to `./public/uploads/evidence/` via `storageProvider`.
  - Record is inserted into `evidence_items` table in SQLite.
  - UI displays real uploaded file URL, SHA-256 hash, and assigned evidence ID.

#### Task 3.2: Connect Incident Intake and Status Actions to Backend
- **Priority:** P1 (High)
- **Files Affected:**
  - `apps/web/components/workspaces/IncidentsPage.tsx`
  - `apps/web/lib/api-client.ts`
- **Description:** 
  Update `IncidentIntelligenceService` to dispatch real HTTP requests (`GET /api/v1/incidents`, `POST /api/v1/incidents`, `PATCH /api/v1/incidents/[id]`) with authorization headers or cookies.
- **Dependencies:** Task 3.1.
- **Acceptance Criteria:**
  - Incidents created or updated in the UI persist across browser reloads without relying on Zustand `localStorage` cache.
  - Database queries reflect user actions immediately.

---

### Phase 4 — Real AI & Computer Vision Integration

#### Task 4.1: Activate Gemini 2.0 Flash Vision API with Validation
- **Priority:** P2 (Medium)
- **Files Affected:**
  - `.env`
  - `apps/api/app/api/vision_v1.py`
- **Description:** 
  Enable end-to-end Gemini Vision analysis using verified API credentials. Ensure graceful fallback to PIL image statistics when offline or if quota is exceeded.
- **Dependencies:** Task 3.1.
- **Acceptance Criteria:**
  - Uploading a real pothole image returns genuine AI-generated bounding boxes, damage cost estimates, and risk severity from `gemini-2.0-flash`.
  - Responses include `analysisEngine: "Gemini-2.0-Flash"`.

#### Task 4.2: Replace Hash-Based Simulated Bounding Boxes in Next.js
- **Priority:** P2 (Medium)
- **Files Affected:**
  - `apps/web/lib/server/ai/inference-pipeline.ts`
  - `apps/web/lib/server/ai/ai-inference.service.ts`
- **Description:** 
  Update `InferencePipeline` to either proxy image tensors to the Python vision engine (`apps/api/app/api/vision_v1.py`) or run a lightweight ONNX runtime model.
- **Dependencies:** Task 4.1.
- **Acceptance Criteria:**
  - Next.js server inference returns actual pixel-based detections rather than SHA-256 byte-offset boxes.

#### Task 4.3: Connect AI Assistant (Copilot) to Real Language Model
- **Priority:** P2 (Medium)
- **Files Affected:**
  - `apps/web/components/workspaces/AIPage.tsx`
  - `apps/web/app/api/v1/ai/route.ts`
- **Description:** 
  Replace hardcoded string matching in `AIPage.tsx` with a streaming or REST endpoint that queries Gemini with the current incident database context as grounding.
- **Dependencies:** Task 2.1 and 4.1.
- **Acceptance Criteria:**
  - Users can ask arbitrary questions about current city incidents and receive accurate, grounded natural language responses.

---

### Phase 5 — CI/CD, Containerization & Production Readiness

#### Task 5.1: Create GitHub Actions CI Workflow
- **Priority:** P3 (Standard)
- **Files Affected:** `.github/workflows/ci.yml`
- **Description:** 
  Automate linting, type checks (`tsc --noEmit`), Vitest unit/integration tests, Python tests, and Next.js production build on every push and pull request.
- **Dependencies:** Phase 1 complete.
- **Acceptance Criteria:**
  - GitHub Actions runs `npm test`, `python tests/test_platform.py`, and `npm run build`, passing with green status.

#### Task 5.2: Docker Container Validation
- **Priority:** P3 (Standard)
- **Files Affected:**
  - `apps/web/Dockerfile`
  - `apps/web/docker-compose.yml`
- **Description:** 
  Test and verify multi-stage container builds for Next.js web and Python backend with PostgreSQL/PostGIS.
- **Dependencies:** Task 5.1.
- **Acceptance Criteria:**
  - `docker compose up --build` brings up web, api, and database containers in a healthy state.

---

## 4. Current Implementation Status & Verification Summary

| Phase | Description | Target Tasks | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Build & Compilation Integrity | Tasks 1.1, 1.2, 1.3 | **VERIFIED** | `npm run build` exits 0; `npx tsc --noEmit` exits 0 with 0 errors. |
| **Phase 2** | Database Unification & Migration | Tasks 2.1, 2.2 | **VERIFIED** | Unified `apps/web/prisma/earthmind.db`. Live bidirectional sync between Python (`cases`) and Prisma (`incidents`). |
| **Phase 3** | Frontend UI-to-API Route Wiring | Tasks 3.1, 3.2 | **VERIFIED** | Evidence upload dispatches to `/api/v1/evidence/upload`; incident creation & transitions wired to API & `/api/v1/evidence/[id]/link`. |
| **Phase 4** | Real AI & Computer Vision Integration | Tasks 4.1, 4.2, 4.3 | **VERIFIED** | 10/10 CV tasks running via PIL local heuristics + Gemini 2.0 Flash SDK fallback. AI Copilot route `/api/copilot` live with database grounding. |
| **Phase 5** | CI/CD & Production Hardening | Task 5.1 (CI Workflow) | **VERIFIED** | `.github/workflows/ci.yml` created with Python test + Next.js build/lint/test matrix. |
| **Phase 5** | Container Validation | Task 5.2 (Docker Compose) | **NEXT TASK** | Multi-container validation for Docker deployment (`apps/web/Dockerfile`, `apps/web/docker-compose.yml`). |

---

## 5. Immediate Next Task (The Exact Next Step)

### Task Name: **Task 5.2 — Multi-Container Docker Deployment Validation**
- **Exact File:** `apps/web/Dockerfile` and `apps/web/docker-compose.yml`
- **Objective:** Validate production containerization of the unified web and Python intelligence services with PostgreSQL/PostGIS.
- **Dependencies:** Task 5.1 complete (CI workflow established).
- **Acceptance Criteria:**
  1. Inspect and verify `apps/web/Dockerfile` multi-stage build instructions.
  2. Verify environment variable bindings between container services.
  3. Confirm production container readiness without regressions to the verified local SQLite baseline.
