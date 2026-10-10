// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-quality/providers
// Per-provider data trust metrics, uptime, latency, and failure rates
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../../lib/server/services/provider-registry.service';
import { dataQualityEngineService } from '../../../../../lib/server/services/data-quality-engine.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const providers = providerRegistryService
      .listProviderAdapters()
      .map((a) => dataQualityEngineService.getProviderQualityMetrics(a.config.providerId))
      .filter(Boolean);

    return new Response(JSON.stringify(successResponse(providers)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
