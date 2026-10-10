// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incidents Individual Item Controller
// GET    /api/v1/incidents/[id] — Get single incident
// PATCH  /api/v1/incidents/[id] — Update incident
// DELETE /api/v1/incidents/[id] — Delete incident
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { UpdateIncidentSchema } from '../../../../../lib/server/validation/incident.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { NotFoundError } from '../../../../../lib/server/errors';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IIncidentService } from '../../../../../lib/server/services/incident.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'READ');

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const incident = await service.getIncidentById(id);

    if (!incident) {
      throw new NotFoundError(`Incident with ID '${id}' not found`);
    }

    return new Response(JSON.stringify(successResponse(incident)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const nextReq = req as any;
    const user = await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'UPDATE');

    const validation = await validateBody(req, UpdateIncidentSchema);
    if (!validation.success) return validation.response;

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const updated = await service.updateIncident(id, validation.data, user.userId);

    return new Response(JSON.stringify(successResponse(updated)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const nextReq = req as any;
    const user = await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'DELETE');

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const success = await service.deleteIncident(id, user.userId);

    return new Response(JSON.stringify(successResponse({ success, deletedId: id })), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
