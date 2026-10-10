// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-providers/domains
// List supported urban telemetry domains & provider coverage
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

    const domainCoverage = providerRegistryService.listDomains();
    return new Response(JSON.stringify(successResponse(domainCoverage)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
