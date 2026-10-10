// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Kubernetes Readiness Probe Controller
// GET /api/v1/ready
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../lib/server/errors/error-handler';
import { readinessService } from '../../../../lib/server/monitoring/readiness.service';
import { successResponse } from '../../../../lib/server/dto/shared.dto';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const result = await readinessService.checkReadiness();
    const statusCode = result.isReady ? 200 : 503;

    return new Response(JSON.stringify(successResponse(result)), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
