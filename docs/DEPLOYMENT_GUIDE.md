# EarthMind PIOS — Production & Free Cloud Deployment Guide
**Recommended Architectures**:
1. **Option A (100% Completely Free Tier — $0/month)**: Vercel + Render + Neon Serverless PostgreSQL
2. **Option B (Hybrid Cloud)**: Vercel + Railway Managed PostgreSQL & Python

---

## 🌟 Option A: 100% Free Deployment ($0/month, No Credit Card Required)

This configuration requires **$0** and **zero credit cards**, using permanent free-tier plans:

| Tier | Service | Provider | Cost | Plan Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 App | [Vercel](https://vercel.com) | **$0/mo** | Unlimited deployments, global edge CDN |
| **Backend API** | Python Vision Engine | [Render](https://render.com) | **$0/mo** | 750 free compute hours/mo, free SSL |
| **Database** | PostgreSQL 16 | [Neon](https://neon.tech) / [Supabase](https://supabase.com) | **$0/mo** | 0.5 GB storage, connection pooling, free forever |

```
                       ┌────────────────────────────────────────┐
                       │          Vercel Global Edge            │
                       │     Next.js 15 Frontend & APIs         │
                       │        (100% Free Hobby Tier)          │
                       └──────────────────┬─────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
                  ▼                                               ▼
    ┌───────────────────────────┐                   ┌───────────────────────────┐
    │     Neon PostgreSQL       │                   │       Render.com          │
    │  Serverless Postgres 16   │◄──────────────────┤    Python API Backend     │
    │   (Free Forever, 0.5GB)   │                   │  (Free Web Service Tier)  │
    └───────────────────────────┘                   └───────────────────────────┘
```

---

### Step 1: Create Free PostgreSQL on Neon.tech (2 Minutes)

1. Go to [https://neon.tech](https://neon.tech) and sign up using your **GitHub account** (No credit card needed).
2. Click **Create Project**:
   - Name: `earthmind-db`
   - Region: Choose the region closest to you (e.g. `US East (Ohio)` or `Europe (Frankfurt)`).
3. On your project dashboard, copy the **Connection string** (make sure **Pooled connection** checkbox is checked):
   ```
   postgresql://earthmind_owner:pass123@ep-cool-forest-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this string — you will use it as your `DATABASE_URL`.

---

### Step 2: Push Prisma Database Schema to Neon

From your local machine or terminal:
```powershell
cd apps/web

# Set your Neon connection string in your current terminal session:
$env:DATABASE_URL="postgresql://earthmind_owner:pass123@ep-cool-forest-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push schema tables:
npx prisma db push

# Seed initial departments and demo data:
npx tsx prisma/seed.ts
```
*Your Neon database now contains all 18 EarthMind relational tables!*

---

### Step 3: Deploy Free Python API on Render.com (3 Minutes)

1. Go to [https://render.com](https://render.com) and log in with your **GitHub account**.
2. Click **New +** → **Blueprint** (or **Web Service**):
   - Select your GitHub repository: `purnalokesh31-hub/earthmind-ai`.
   - Render will automatically detect [`render.yaml`](../render.yaml) from the repository!
3. If creating via **Web Service** manually:
   - **Name**: `earthmind-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python apps/api/app/main.py`
   - **Plan Type**: `Free`
   - **Health Check Path**: `/api/v1/health`
4. In **Environment Variables**, add:
   - `PORT`: `10000`
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `GEMINI_API_KEY`: *(Optional, for Gemini 2.0 Flash vision)*
5. Click **Create Web Service**.
6. Once deployed, Render provides your public URL:
   `https://earthmind-api.onrender.com`

---

### Step 4: Deploy Next.js Web App on Vercel (3 Minutes)

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New** → **Project** → Import `purnalokesh31-hub/earthmind-ai`.
3. In the project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`apps/web`**
4. Expand **Environment Variables** and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://earthmind_owner:pass...@ep-...-pooler...neon.tech/neondb?sslmode=require` | Neon connection string with connection pooler |
| `AI_ENGINE_URL` | `https://earthmind-api.onrender.com` | Your public Render Python API URL |
| `NEXT_PUBLIC_API_URL` | `https://your-earthmind.vercel.app/api/v1` | Vercel domain URL |
| `JWT_SECRET` | `a1b2c3d4e5f6g7h8a1b2c3d4e5f6g7h8a1b2c3d4e5f6g7h8a1b2c3d4e5` | 64-character random string |
| `JWT_REFRESH_SECRET` | `z9y8x7w6v5u4t3s2z9y8x7w6v5u4t3s2z9y8x7w6v5u4t3s2z9y8x7w6v5` | 64-character random string |
| `NODE_ENV` | `production` | Production mode |
| `STORAGE_DRIVER` | `local` | Storage driver |

5. Click **Deploy**.
6. Vercel automatically runs `postinstall: prisma generate`, builds the Next.js bundle, and issues a live global HTTPS domain!

---

## 🚀 Option B: Railway + Vercel Deployment

If you prefer using Railway's trial or credit-based infrastructure:

1. **Railway PostgreSQL**:
   - Click **New Project** → **Provision PostgreSQL**.
   - Copy the public `DATABASE_URL` under **Variables**.
2. **Railway Python Service**:
   - Click **New** → **GitHub Repo** → select `earthmind-ai`.
   - Railway auto-detects [`railway.json`](../railway.json) & [`nixpacks.toml`](../nixpacks.toml).
   - Generate a domain under **Settings → Networking**.
3. **Vercel**:
   - Follow Step 4 above with your Railway `DATABASE_URL` and Railway service URL.
