// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/city-intelligence/signals
// Active normalized cross-domain signals with data quality scores
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../../lib/server/services/provider-registry.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const url = new URL(req.url);
    const cityId = url.searchParams.get('cityId') || 'city-vja';

    const signalsResponse = await providerRegistryService.fetchSignalsIsolated('provider-mock-gateway', cityId);

    return new Response(JSON.stringify(successResponse(signalsResponse)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
