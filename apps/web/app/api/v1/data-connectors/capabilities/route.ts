// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-connectors/capabilities
// Provider Capability Discovery Endpoint across all 7 urban domains
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../../lib/server/services/provider-registry.service';
import { ExternalProviderAdapter } from '../../../../../lib/server/adapters/external-provider.adapter';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const capabilities = providerRegistryService
      .listProviderAdapters()
      .filter((a): a is ExternalProviderAdapter => a instanceof ExternalProviderAdapter)
      .map((a) => a.getCapabilities());

    return new Response(JSON.stringify(successResponse(capabilities)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
