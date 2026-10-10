// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-connectors
// List registered real-world data connectors and sanitized configuration
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../lib/server/services/provider-registry.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const connectors = providerRegistryService
      .listProviderAdapters()
      .filter((a) => a.config.providerType === 'EXTERNAL_CONTRACT')
      .map((a) => providerRegistryService.sanitizeConfig(a.config));

    return new Response(JSON.stringify(successResponse(connectors)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
