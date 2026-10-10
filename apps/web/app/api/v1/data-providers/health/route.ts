// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-providers/health
// Systemwide provider health snapshot across all urban domains
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

    const snapshot = providerRegistryService.getOverallHealthSnapshot();
    return new Response(JSON.stringify(successResponse(snapshot)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
