// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Kubernetes Liveness Probe Controller
// GET /api/v1/live
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../lib/server/errors/error-handler';
import { livenessService } from '../../../../lib/server/monitoring/liveness.service';
import { successResponse } from '../../../../lib/server/dto/shared.dto';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const result = await livenessService.checkLiveness();
    const statusCode = result.isAlive ? 200 : 500;

    return new Response(JSON.stringify(successResponse(result)), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
