// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incidents Merge Controller
// POST /api/v1/incidents/[id]/merge
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../../lib/server/auth/middleware.helpers';
import { validateBody } from '../../../../../../lib/server/validation/validate';
import { MergeIncidentSchema } from '../../../../../../lib/server/validation/incident.schema';
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

    const validation = await validateBody(req, MergeIncidentSchema);
    if (!validation.success) return validation.response;

    const { duplicateIncidentId } = validation.data;
    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const merged = await service.mergeIncident(id, duplicateIncidentId, user.userId);

    return new Response(JSON.stringify(successResponse(merged)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
