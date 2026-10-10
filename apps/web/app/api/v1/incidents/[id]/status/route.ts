// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incidents Status Transition Controller
// POST /api/v1/incidents/[id]/status
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../../lib/server/auth/middleware.helpers';
import { validateBody } from '../../../../../../lib/server/validation/validate';
import { UpdateIncidentStatusSchema } from '../../../../../../lib/server/validation/incident.schema';
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

    const validation = await validateBody(req, UpdateIncidentStatusSchema);
    if (!validation.success) return validation.response;

    const { status, note } = validation.data;
    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const updated = await service.changeStatus(id, status, user.userId, note);

    return new Response(JSON.stringify(successResponse(updated)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
