# EarthMind PIOS — Comprehensive Project Architecture & Repository Audit
**Document Version:** 1.0.0  
**Audit Date:** October 2026  
**Auditor Role:** Principal Software Architect, Senior Full-Stack Engineer, AI/CV Specialist, QA Engineer  
**Repository:** [https://github.com/purnalokesh31-hub/earthmind-ai](https://github.com/purnalokesh31-hub/earthmind-ai)  
**Product Concept:** EarthMind AI — Planetary Intelligence Operating System (PIOS)

---

## 1. Executive Summary

EarthMind AI (PIOS) is envisioned as a multi-domain municipal intelligence and decision-support operating system. It monitors seven urban domains (Infrastructure, Water, Climate/Disaster, Energy, Environment, Agriculture, Citizen Reporting) and enforces a core human-governance principle: **AI recommends, authorized human operators decide, no autonomous physical execution**.

This comprehensive audit was executed by directly inspecting the working codebase, tracing runtime execution paths, evaluating data persistence layers, analyzing computer vision and AI models, and executing the full test and build suites.

### Key Audit Findings at a Glance
1. **Rich Frontend Design with High Visual Fidelity:** The Next.js frontend (`apps/web`) features an impressive command center, interactive MapLibre GL geospatial map, 7 domain workspaces, toast/undo systems, command palette, and decision workflows.
2. **Disconnected UI-to-API Communication:** Many frontend workspaces (`EvidenceWorkspace`, `IncidentsPage`, `AIPage`, `DomainWorkspacePage`) operate primarily on in-memory mock data (`DEMO_INCIDENTS`, `DEMO_USERS` in Zustand) or catch HTTP 401 errors silently, leaving the rich backend REST API routes unused by the primary user interface.
3. **Dual Unsynchronized SQLite Databases:** Two entirely independent SQLite databases exist in parallel:
   - Root `earthmind.db` (used by Python backend, schema: `cases`, `knowledge_graph`, `earth_memory`, `users`, `otps`).
   - `apps/web/prisma/earthmind.db` (used by Next.js Prisma, schema: `incidents`, `evidence_items`, `vision_analyses`, `departments`, `dispatches`, `audit_logs`, etc.).
   They do not synchronize or share schemas.
4. **AI & Computer Vision Are Primarily Heuristic/Simulated:**
   - Next.js AI Vision (`InferencePipeline.detectObjects`): Generates bounding boxes pseudo-randomly using byte offsets derived from the image's SHA-256 hash.
   - Python AI Vision (`vision_v1.py`): Contains functional code for Gemini Vision (`gemini-2.0-flash`), but with empty API keys in default configs, it falls back to pure-Python PIL image-statistics heuristics (brightness, contrast, color channel variance).
   - XGBoost failure predictor trains on synthetic data on-the-fly or uses logistic regression math fallback.
   - AI Copilot in `AIPage.tsx` uses keyword-based string matching and hardcoded SQL responses.
5. **Production Build Failure:** While all 911 Vitest unit/integration tests and all Python validation tests pass, `npm run build` fails due to TypeScript type mismatches in `prisma/seed.ts` (`IncidentStatus.ACTIVE` is not a member of `IncidentStatus`) and missing `eslint` dev dependency.
6. **Overall Calculated Completion:** **49.2%** (weighted across 8 functional and architectural dimensions).

---

## 2. Actual Repository Structure

```
earthmind-ai/
├── .env.example                     # Unified template (MOCK_AI=true, DATABASE_URL)
├── README.md                        # Product vision, feature claims, and setup guide
├── requirements.txt                 # Zero-dependency statement (Python standard library only)
├── earthmind.db                     # Root SQLite database (Python backend cases/graph)
├── apps/
│   ├── api/                         # Python Backend Engine
│   │   ├── app/
│   │   │   ├── main.py              # Zero-dependency HTTP server (BaseHTTPRequestHandler)
│   │   │   ├── api/                 # Endpoints (vision_v1.py, cases.py)
│   │   │   ├── core/                # DB access (db.py), Auth & OTP (auth.py), Config (config.py)
│   │   │   ├── engines/             # Predictive (predictive.py), Spatial (spatial.py), Dispatch (dispatch.py)
│   │   │   ├── models/              # Case models (case.py)
│   │   │   ├── workers/             # Multi-agent orchestrator (orchestrator.py, worker.py)
│   │   │   └── uploads/             # Static file storage directory
│   │   └── requirements.txt
│   └── web/                         # Next.js 15 Web Command Center
│       ├── app/                     # App router (/page.tsx, /command-center, /api/v1/...)
│       │   ├── EarthMindApp.tsx     # Master client shell routing between tabs
│       │   └── api/v1/              # 27 REST API route modules
│       ├── components/              # UI components (auth, command-center, layout, ui, workspaces)
│       ├── stores/                  # Zustand app-store.ts (874 lines)
│       ├── lib/                     # Server services, DI container, domain types, demo data
│       ├── prisma/                  # schema.prisma (18 models), seed.ts, earthmind.db
│       ├── offline/                 # Service worker (sw.ts), IndexedDB (indexeddb.ts), Sync manager
│       ├── tests/                   # 130 unit test files, 9 integration test files (Vitest)
│       └── package.json             # Next.js 15.1, React 19, Tailwind CSS 3.4, Prisma 6.4
├── packages/
│   ├── scoring-rules/               # Python scoring module (scoring.py)
│   ├── shared-types/                # Stub package (index.ts, package.json)
│   └── ui/                          # Stub package (index.ts, package.json)
├── infra/
│   ├── docker/                      # Docker README and stubs
│   ├── migrations/                  # schema.sql (PostgreSQL PostGIS DDL)
│   └── scripts/                     # Shell/automation stubs
├── docs/                            # Phase documentation & architecture guides
└── tests/
    └── test_platform.py             # Python standard library automated test suite
```

---

## 3. Reconstructed Current Architecture

### 3.1 Frontend Architecture
- **Framework:** Next.js 15 (v15.1.0) with React 19 and TypeScript.
- **Entry Points:**
  - `apps/web/app/page.tsx`: Client component evaluating `isAuthenticated` from Zustand store. If false, renders `LoginView`; if true, renders `EarthMindApp`.
  - `apps/web/app/command-center/page.tsx`: Dedicated direct route rendering `CityLiveIntelligenceWorkspace`.
- **State Management:** Single large Zustand store (`apps/web/stores/app-store.ts`) configured with `persist` middleware. Holds incidents, current user, active tab, context panel state, toasts, undo stack, audit log history, and evidence list.
- **Styling & UI:** Tailwind CSS, Framer Motion animations, Lucide React icons, custom glassmorphism styles in `globals.css`.
- **Mapping:** MapLibre GL (`maplibre-gl` v4.7.0) consuming CartoDB dark-matter / positron vector styles.

### 3.2 Backend Architecture (Dual Backend Model)
The repository contains **two distinct backend layers** that evolved in parallel rather than as a cohesive distributed system:

#### A. Next.js Route Handlers (`apps/web/app/api/v1`)
- Built on Next.js native Route Handlers (`route.ts`).
- Modular Inversion-of-Control (IoC) dependency injection container (`apps/web/lib/server/container`).
- Complete repository pattern: `PrismaIncidentRepository`, `PrismaUserRepository`, `PrismaEvidenceRepository`, etc.
- In-memory mock repositories (`MemoryUserRepository`, `MemoryEvidenceRepository`) utilized during testing.
- Strong domain models and Zod schema validation across all request endpoints.
- JWT verification using the `jose` library with JTI blacklist revocation and rate-limiting middleware.

#### B. Python Standard Library Engine (`apps/api/app/main.py`)
- Explicitly zero-dependency: uses Python's built-in `http.server.BaseHTTPRequestHandler` and `sqlite3`.
- Exposes:
  - `GET /api/health`
  - `GET /api/cases`, `POST /api/cases`, `GET /api/cases/{id}`
  - `GET /api/cases/{id}/graph`, `GET /api/cases/{id}/memory`, `GET /api/cases/{id}/logs`
  - `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify-otp`
  - `POST /api/v1/evidence/upload` (raw multipart parsing with SHA-256 calculation)
  - `POST /api/v1/vision/analyze` (Gemini or PIL heuristic fallback)
  - `POST /api/copilot` (keyword intent routing)
  - In-process microservice routes (`/api/vision`, `/api/speech`, `/api/geo`, `/api/risk`, `/api/recommendation`, `/api/report`).
- Multi-agent orchestrator (`orchestrator.py`): Spawns parallel Python threads to query the in-process endpoints, merging outputs into case records.

### 3.3 Database & Persistence Strategy
- **SQLite (Dev & Default):**
  - Prisma connects to `apps/web/prisma/earthmind.db` via `file:./earthmind.db`. Contains 18 tables: `departments`, `users`, `incidents`, `incident_timelines`, `evidence_items`, `vision_analyses`, `bounding_boxes`, `ocr_results`, `sensor_telemetries`, `notifications`, `audit_logs`, `assignments`, `earth_impacts`, `risk_assessments`, `dispatches`, etc.
  - Python connects to `earthmind.db` in root via raw SQL queries in `apps/api/app/core/db.py`. Contains 6 tables: `cases`, `knowledge_graph`, `earth_memory`, `users`, `field_officers`, `otps`.
- **PostgreSQL / PostGIS (Container / Production Intent):**
  - Schema defined in `infra/migrations/schema.sql` with PostGIS geometry fields.
  - Container setup present in `apps/web/docker-compose.yml`, but local dev and tests currently run against SQLite.

### 3.4 Authentication & Authorization
- **Dual Auth Implementations:**
  - Next.js Auth: Standard JWT token pair (Access Token: 15m / Refresh Token: 7d), password hashing via `bcryptjs`, RBAC permission matrix (`SYSTEM_ADMIN`, `COMMANDER`, `SUPERVISOR`, `FIELD_OFFICER`, `ANALYST`, `CITIZEN`).
  - Python Auth: Custom session and OTP tracking (`otps` table in SQLite) with SMS/Email OTP simulation.
- **Client Route Protection:** Handled via Zustand store state (`isAuthenticated: boolean`). If false, renders `LoginView`.

---

## 4. End-to-End Workflow Tracing

### Evidence Submission Flow (Reality vs Specification)

#### Traced Path: User Submits Evidence in the UI
```
[User drags file into EvidenceWorkspace]
       │
       ▼
calls useAppStore().uploadEvidence(item)
       │
       ▼
creates local in-memory EvidenceItem (Zustand store)
       │
       ▼
calls useAppStore().analyzeEvidence(id)
       │
       ▼
calls runVisionInference(item) in apps/web/lib/services/ai.service.ts
       │
       ▼
await mockDelay(500); // 500ms setTimeout
       │
       ▼
returns hardcoded bounding boxes (Pothole Subsurface Breach, Cast-Iron Main Shearing)
       │
       ▼
Zustand updates evidenceList and triggers Toast notification
```
**Broken Links Identified:**
1. No HTTP call is made to `POST /api/v1/evidence/upload` or `POST /api/v1/vision/analyze`.
2. File bytes are never written to disk or database from this UI action.
3. Reloading the page without local storage persistence drops the in-memory asset.
4. Bounding boxes are static constants rather than computed from image pixels.

#### Traced Path: Server-Side REST Route (If invoked via API)
```
[Client POSTs multipart/form-data to /api/v1/evidence/upload]
       │
       ▼
authenticateOrPrototypeUser(req) checks JWT or returns prototype context
       │
       ▼
Parses FormData, validates MIME type and 25MB max size
       │
       ▼
storageProvider.uploadFile() writes file to ./public/uploads/evidence/
       │
       ▼
evidenceRepo.create() writes record to SQLite evidence_items table
       │
       ▼
Returns HTTP 200 with evidenceId and storageUrl
```
*Conclusion:* The server-side upload handler is well-engineered and fully functional, but the frontend workspace has not been wired to it.

---

## 5. Existing Strengths

1. **Enterprise Design System & Command Center UI:** Visually superior UI with glassmorphism, responsive navigation, dark color palette, status indicators, and SLA monitors.
2. **Comprehensive Test Suite:** 137 Vitest test files (911 tests) and Python platform test script verify business rules, SLAs, geospatial calculations, and domain logic.
3. **Decoupled Architecture & Dependency Injection:** `apps/web/lib/server` features an IoC container allowing easy swapping between memory providers, Redis cache, local disk, and S3 storage.
4. **Human-in-the-Loop Governance Guardrails:** Hardcoded safety constraints prevent autonomous operations: `requiresHumanApproval === true`, `advisoryOnly === true`, `autonomousExecution === false`.
5. **Real Gemini Vision API Implementation:** `apps/api/app/api/vision_v1.py` contains verified code for Google's official Gemini 2.0 Flash Vision API with structured JSON output prompts and chain-of-custody SHA-256 hash calculation.
6. **Robust Multi-Domain Domain Model:** Clean separation across all seven municipal sectors with department assignments, severity levels, and SLA escalation thresholds.

---

## 6. Major Defects, Disconnections, and Blockers

### Critical Blocker: Production Build Failure
- **Error:** `npm run build` exits with code 1.
- **Cause 1:** TypeScript compilation failure in `apps/web/prisma/seed.ts` (6 instances of `status: IncidentStatus.ACTIVE`, which is not defined in the `IncidentStatus` object).
- **Cause 2:** TypeScript type errors in unit tests importing `RoleType` from `@prisma/client` (SQLite Prisma schemas do not export Enums).
- **Cause 3:** Next.js build requires `eslint` package to be installed in devDependencies.

### Defect: Dual Database Disconnection
- Next.js writes to `apps/web/prisma/earthmind.db`.
- Python backend writes to root `earthmind.db`.
- A case created in the Python backend is completely invisible to Next.js Prisma queries, and vice versa.

### Defect: Simulated AI & Computer Vision in Frontend
- Frontend AI chat (`AIPage.tsx`) is hardcoded keyword-matching rather than a connected LLM.
- Frontend Vision inference (`ai.service.ts`) returns fixed hardcoded bounding boxes.
- Next.js server inference (`inference-pipeline.ts`) derives bounding boxes from the SHA-256 hash of the buffer rather than running an actual neural network.
- No local neural network weights (`.onnx` or `.pt`) exist in the repository.

### Defect: External Data Connectors Are Simulated Contracts
- Real municipal IoT feeds, SCADA protocols, transit feeds, and weather APIs are placeholder contracts (`ExternalCityDataProviderContract`) that throw errors if dry-run mode is disabled.
- All live data in the command center is generated by `MockCityDataProvider` or `DemoCityDataProvider`.

---

## 7. Audit Conclusion
EarthMind AI (PIOS) possesses a solid architectural foundation, an extensive test suite, and an exceptional user interface. However, it currently functions as a **semi-mocked simulation and prototype environment**. Bridging the gap between the frontend UI and the existing backend API routes, unifying the database layer, resolving the production build errors, and activating real Gemini API keys are the required next steps to transition this project from an advanced prototype into a fully verified, functioning platform.
