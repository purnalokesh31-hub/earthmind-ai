# EarthMind AI — Planetary Intelligence Operating System (PIOS)

EarthMind AI is a unified, offline-first planetary intelligence platform for environmental and infrastructure monitoring. It provides a standardized pipeline to capture field evidence, analyze coordinates, compute composite risk scores, and map recommended action items.

To ensure the platform is highly feasible, lightweight, and deployable on any machine on Earth—including resource-constrained settings or environments running newer Python releases (e.g., Python 3.14 on Windows)—the backend is built **entirely on Python's built-in standard libraries**. 

**There are zero Python package dependencies (no pip install required).**

---

## Repository Structure

```
earthmind-ai/
├── apps/
│   ├── api/                   # Zero-dependency python API server
│   │   └── app/
│   │       ├── api/           # API handlers (cases)
│   │       ├── core/          # Configuration and SQLite database drivers
│   │       └── workers/       # Background AI analysis pipelines
│   └── web/                   # Next.js frontend app
│       ├── app/               # Layout & view page containers
│       ├── components/        # Dashboard layout with offline map radar grids
│       ├── lib/               # Client canvas image compressors
│       └── offline/           # Service Worker caches and IndexedDB queues
├── packages/
│   └── scoring_rules/         # Configuration-based scoring engines
├── infra/
│   └── migrations/            # Database schema definitions
├── tests/                     # Automated platform check scripts
└── README.md                  # Installation guide
```

---

## Setup & Running Guide

### 1. Run the Backend API

Make sure Python is installed. 

1. Navigate to the project root directory.
2. Run the server script:
   ```bash
   python apps/api/app/main.py
   ```

* The API server will start on port `8000`.
* A local database file `earthmind.db` will be initialized automatically in the root.
* You can check the health check status at: `http://localhost:8000/api/health`

### 2. Run the Web Dashboard

Make sure Node.js is installed.

1. Navigate to the frontend directory:
   ```bash
   cd apps/web
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

* The Next.js dashboard will be accessible at: `http://localhost:3000`
* You can test case submissions, upload evidence files, capture voice inputs, toggle offline mode in browser devtools, and witness the sync queue sync metadata and binaries sequentially once connection restores.

### 3. Run Automated Checks

To run the full suite of scoring, SQLite operations, and pipeline verification checks:
```bash
python tests/test_platform.py
```
