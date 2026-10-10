# EarthMind PIOS — Phase 7.9.4: Citywide Predictive Decision Intelligence & Action Prioritization

## Executive Overview
Phase 7.9.4 establishes the continuous, resource-aware decision intelligence layer for EarthMind PIOS (Public Impact Operations System). It transforms multi-sensor anomaly signals, 6-hour predictive forecasts, and counterfactual cascade simulations into ranked, resource-feasible intervention options.

## Mandatory Human Governance & Safeguard Rule
- **`requiresHumanApproval: true`** is strictly enforced on every DTO, recommendation, REST endpoint, and AI tool response.
- **Autonomous Execution is FORBIDDEN**. The system provides advisory decision support only and never executes physical grid switching, emergency dispatch, or infrastructure shutoffs automatically.
- **Human Authorization** is explicitly recorded via `/api/v1/digital-twin/decisions/[id]/approve` capturing operator identity, decision status (`APPROVED` / `REJECTED`), timestamp, and operator notes into an immutable audit event (`HUMAN_AUTHORIZATION_*`).

## Core Architecture Chain
```
PREDICTION SIGNALS ──► RISK FORECAST ──► CASCADE SIMULATION ──► INTERVENTION OPTIONS ──► RESOURCE CONSTRAINTS ──► SCORECARD ──► SENSITIVITY ──► EXPLANATION ──► THRESHOLD EVALUATION ──► HUMAN REVIEW & APPROVAL ──► IMMUTABLE AUDIT LOG
```

## Weight Profiles & Scoring Strategies
1. **`LIFE_SAFETY_FIRST`**: Prioritizes Population Protection (35%) and Risk Reduction (30%).
2. **`SERVICE_CONTINUITY`**: Prioritizes Service Recovery (35%) and Downtime Minimization (20%).
3. **`COST_EFFICIENCY`**: Prioritizes Cost Efficiency (40%) and Resource Preservation (15%).
4. **`RAPID_RESPONSE`**: Prioritizes Deployment Speed (40%) and Time-to-Impact.
5. **`BALANCED`**: Equalized multi-objective weighting across all 8 dimensions.

## REST API Matrix
- `GET /api/v1/digital-twin/decisions`: List active decision optimization scenarios.
- `POST /api/v1/digital-twin/decisions`: Create a new decision scenario.
- `GET /api/v1/digital-twin/decisions/[id]`: Get details for a decision scenario.
- `POST /api/v1/digital-twin/decisions/[id]/run`: Execute decision analysis pipeline.
- `GET /api/v1/digital-twin/decisions/[id]/options`: Get advisory decision options.
- `GET /api/v1/digital-twin/decisions/[id]/priority`: Get ranked action priority queue.
- `GET /api/v1/digital-twin/decisions/[id]/comparison`: Compare candidate vs no-action baseline.
- `GET /api/v1/digital-twin/decisions/[id]/recommendation`: Get top advisory recommendation.
- `GET /api/v1/digital-twin/decisions/[id]/explanation`: Get explainable decision reasoning.
- `POST /api/v1/digital-twin/decisions/[id]/approve`: Record human operator authorization.
- `GET /api/v1/digital-twin/decisions/[id]/resources`: Get municipal resource inventory & demand.
- `GET /api/v1/digital-twin/decisions/[id]/constraints`: Get constraint evaluation status.
- `GET /api/v1/digital-twin/decisions/[id]/tradeoffs`: Get trade-off analysis matrix.
- `GET /api/v1/digital-twin/decisions/[id]/sensitivity`: Get sensitivity perturbation report.
- `GET /api/v1/digital-twin/decisions/[id]/scorecard`: Get strategy scorecard.
- `GET /api/v1/digital-twin/decisions/[id]/thresholds`: Get threshold evaluation & escalation state.
- `GET /api/v1/digital-twin/decisions/[id]/audit`: Get chronological decision audit events.
- `GET /api/v1/digital-twin/decisions/history`: Get historical decision audit records.

## Data Provenance
- Every payload generated from predictive modeling sets `dataSource: "SIMULATION"`.
- Simulated data is visually demarcated in the Command Center UI as **`SIMULATION MODE`**.
