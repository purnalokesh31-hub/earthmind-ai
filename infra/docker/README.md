# EarthMind PIOS — Docker & Infrastructure Deployment

This directory contains container configurations and orchestration resources for deploying EarthMind PIOS across containerized environments.

## Services

1. **Web Command Center (`apps/web/Dockerfile`)**:
   - Multi-stage Next.js 15 standalone production build.
   - High-performance Node runtime serving static assets, SSR routes, and GIS maps.

2. **PostgreSQL 16 + PostGIS Spatial Database**:
   - Image: `postgis/postgis:16-3.4`
   - Spatially indexed coordinate storage (`latitude`, `longitude`).
   - Compatible with `infra/migrations/schema.sql` and Prisma ORM.

3. **Redis 7 In-Memory Cache**:
   - Image: `redis:7-alpine`
   - Real-time event pub/sub, session state caching, and operational dispatch queue.

4. **Python Intelligence Engine (`apps/api`)**:
   - Zero-dependency Python 3 HTTP microservice.
   - Hosts the computer vision heuristics, XGBoost failure prediction, and graph causal reasoning pipelines.

## Launching with Docker Compose

To run all integrated platform services locally with containerization:

```bash
cd apps/web
docker-compose up -d
```
