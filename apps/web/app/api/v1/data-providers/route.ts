// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET/POST /api/v1/data-providers
// List registered data providers & register new provider configurations
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

    const sanitizedProviders = providerRegistryService.listSanitizedConfigs();
    return new Response(JSON.stringify(successResponse(sanitizedProviders)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
