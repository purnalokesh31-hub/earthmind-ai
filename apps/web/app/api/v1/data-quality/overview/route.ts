// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-quality/overview
// Overall system data trust score, anomaly count, and quality breakdown
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { dataQualityEngineService } from '../../../../../lib/server/services/data-quality-engine.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const overview = dataQualityEngineService.getSystemQualityOverview();

    return new Response(JSON.stringify(successResponse(overview)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
