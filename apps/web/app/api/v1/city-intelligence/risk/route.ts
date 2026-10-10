// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/city-intelligence/risk
// Current city risk score and active predictive alerts
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { cityIntelligenceRuntimeService } from '../../../../../lib/server/services/city-intelligence-runtime.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const url = new URL(req.url);
    const cityId = url.searchParams.get('cityId') || 'city-vja';

    const risk = await cityIntelligenceRuntimeService.getRiskStatus(cityId);

    return new Response(JSON.stringify(successResponse(risk)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
