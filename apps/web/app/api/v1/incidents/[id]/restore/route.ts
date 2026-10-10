// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incidents Restore Controller
// POST /api/v1/incidents/[id]/restore
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../../lib/server/auth/middleware.helpers';
import { validateBodyOptional } from '../../../../../../lib/server/validation/validate';
import { RestoreIncidentSchema } from '../../../../../../lib/server/validation/incident.schema';
import { successResponse } from '../../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../../lib/server/container';
import { IIncidentService } from '../../../../../../lib/server/services/incident.service';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const nextReq = req as any;
    const user = await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'UPDATE');

    const validation = await validateBodyOptional(req, RestoreIncidentSchema);
    if (!validation.success) return validation.response;

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const restored = await service.restoreIncident(id, user.userId);

    return new Response(JSON.stringify(successResponse(restored)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
