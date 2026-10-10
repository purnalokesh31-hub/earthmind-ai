// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/city-intelligence/overview
// Unified 8-stage pipeline situation overview
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

    const overview = await cityIntelligenceRuntimeService.executePipeline(cityId);

    return new Response(JSON.stringify(successResponse(overview)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
