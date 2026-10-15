# ──────────────────────────────────────────────────────────────
# EarthMind PIOS — Python AI Engine Dockerfile
# Standard library HTTP Server + PIL + Gemini Vision + Multi-Agent Orchestrator
# ──────────────────────────────────────────────────────────────

FROM python:3.11-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "apps/api/app/main.py"]
