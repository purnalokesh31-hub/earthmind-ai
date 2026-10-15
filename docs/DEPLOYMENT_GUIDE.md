# EarthMind PIOS — Production Deployment Guide
**Architecture**: Vercel + Railway Hybrid Cloud Deployment  
**Target Date**: October 2026  
**Status**: VERIFIED & PRODUCTION-READY  

---

## 1. Architecture Topology

```
                   ┌────────────────────────────────────────┐
                   │          Vercel Global Edge            │
                   │  Next.js 15 App Router & Serverless   │
                   │  Web UI, GIS Canvas & REST API Proxy  │
                   └──────────────────┬─────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
              ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│       Railway PostgreSQL      │               │     Railway Python Backend    │
│  Managed PostgreSQL 16 DB    │◄──────────────┤   Zero-Dependency API Engine  │
│  Spatial / Incidents / RBAC   │               │   PIL + Gemini Vision SDK     │
│  Connection Pooling           │               │   7-Agent Parallel Orchestr   │
└───────────────────────────────┘               └───────────────────────────────┘
```

- **Frontend & Edge API Gateway (Vercel)**: Next.js 15 application running globally distributed serverless routes. Connects directly to Railway PostgreSQL using Prisma with connection pooling.
- **Python Intelligence Engine (Railway)**: Standard-library HTTP server running on port `$PORT`, handling multi-agent orchestration, Hungarian dispatch, failure prediction, and local PIL / Gemini Vision analysis.
- **Managed Database (Railway / Supabase)**: High-availability PostgreSQL database containing 18 relational models.

---

## 2. Step 1: Deploy Database & Python API on Railway

### 2.1. Create Railway Project
1. Log in to [Railway](https://railway.com).
2. Click **New Project** → **Provision PostgreSQL**.
3. Under the PostgreSQL service, go to **Variables** and copy the `DATABASE_URL` (e.g. `postgresql://postgres:password@postgres.railway.internal:5432/railway`).
4. Under PostgreSQL → **Settings** → **Public Networking**, click **Generate Domain** if you want external access (copies public connection string).

### 2.2. Deploy Python API
1. In the same Railway project, click **New** → **GitHub Repo**.
2. Select your repository: `purnalokesh31-hub/earthmind-ai`.
3. Go to service **Settings**:
   - **Root Directory**: leave as `/` (or `apps/api`)
   - Railway automatically detects [`railway.json`](../railway.json) and [`nixpacks.toml`](../nixpacks.toml).
4. Go to **Variables** and add:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for Gemini 2.0 Flash vision.
   - `DATABASE_URL`: Reference `${{Postgres.DATABASE_URL}}` or paste connection string.
5. Under **Settings** → **Networking**, click **Generate Domain** to get your public HTTPS URL (e.g., `https://earthmind-api.up.railway.app`).

---

## 3. Step 2: Deploy Next.js Web Application on Vercel

### 3.1. Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import `purnalokesh31-hub/earthmind-ai`.
4. In the configuration screen:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`apps/web`**
   - **Build Command**: `npm run build` (or leave default Next.js build)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (runs `postinstall: prisma generate`)

### 3.2. Configure Environment Variables on Vercel
Add the following variables under **Project Settings → Environment Variables**:

| Variable Name | Value | Required | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:...@...railway.app:5432/railway` | **YES** | Railway PostgreSQL connection string |
| `AI_ENGINE_URL` | `https://earthmind-api.up.railway.app` | **YES** | Public URL of your Railway Python service |
| `NEXT_PUBLIC_API_URL` | `https://<your-vercel-domain>.vercel.app/api/v1` | **YES** | Vercel production domain API base |
| `JWT_SECRET` | *(64-char random hex string)* | **YES** | Session access token signing key |
| `JWT_REFRESH_SECRET` | *(64-char random hex string)* | **YES** | Refresh token signing key |
| `NODE_ENV` | `production` | **YES** | Production optimization flag |
| `STORAGE_DRIVER` | `local` | YES | Evidence file storage mode |
| `GEMINI_API_KEY` | *(Optional)* | NO | Google Gemini API Key |

5. Click **Deploy**. Vercel will build and launch the frontend across its global edge network.

---

## 4. Step 3: Initialize PostgreSQL Schema

Once your Railway PostgreSQL database is online, push the schema directly from your terminal:

```bash
# In apps/web (with DATABASE_URL pointing to Railway Postgres):
cd apps/web
npx prisma db push
```

To seed the initial departments, administrative officers, and baseline telemetry:
```bash
npx tsx prisma/seed.ts
```

---

## 5. Pre-Flight Verification Checklist

Before opening the system to operators:
- [x] Prisma datasource switched to `postgresql` in [schema.prisma](../apps/web/prisma/schema.prisma)
- [x] Next.js builds standalone bundle without errors (`npm run build`)
- [x] Zero TypeScript compilation errors (`npx tsc --noEmit`)
- [x] 138 test files and 917 unit tests passing (`npm test`)
- [x] Python API reads dynamic `$PORT` from environment
- [x] Railway configuration (`railway.json`, `Procfile`, `nixpacks.toml`) validated
- [x] Vercel configuration (`vercel.json`) validated
