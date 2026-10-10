// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-providers/[id]/health
// Single provider health metrics and circuit breaker evaluation
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../../../lib/server/services/provider-registry.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const { id } = await params;
    const health = await providerRegistryService.getProviderHealth(id);
    return new Response(JSON.stringify(successResponse(health)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
