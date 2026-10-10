// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Health Check Controller
// GET /api/v1/health
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../lib/server/errors/error-handler';
import { getSystemHealthProbe } from '../../../../lib/server/monitoring';
import { successResponse } from '../../../../lib/server/dto/shared.dto';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const health = await getSystemHealthProbe();
    return new Response(JSON.stringify(successResponse(health)), {
      status: health.status === 'UP' ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
