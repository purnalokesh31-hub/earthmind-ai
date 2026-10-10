// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incidents Primary Collection Controller
// GET  /api/v1/incidents — Search, filter & paginate incidents
// POST /api/v1/incidents — Create new incident
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../lib/server/auth/middleware.helpers';
import { validateBody, validateQuery } from '../../../../lib/server/validation/validate';
import { CreateIncidentSchema, IncidentQuerySchema } from '../../../../lib/server/validation/incident.schema';
import { successResponse } from '../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../lib/server/container';
import { IIncidentService } from '../../../../lib/server/services/incident.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'READ');

    const { searchParams } = new URL(req.url);
    const validation = validateQuery(searchParams, IncidentQuerySchema);
    if (!validation.success) return validation.response;

    const {
      page,
      pageSize,
      query,
      sortBy,
      sortOrder,
      status,
      severity,
      category,
      department,
      departmentId,
      assignedOfficerId,
      createdById,
      fromDate,
      toDate,
      minRiskScore,
      maxRiskScore,
      lat,
      lng,
      radiusKm,
    } = validation.data;

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);

    const filter = {
      page,
      pageSize,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      status,
      severity,
      category,
      department,
      departmentId,
      assignedOfficerId,
      createdById,
      from: fromDate ? new Date(fromDate) : undefined,
      to: toDate ? new Date(toDate) : undefined,
      minRiskScore,
      maxRiskScore,
      lat,
      lng,
      radiusKm,
    };

    const paginatedResult = await service.searchIncidentsPaginated(query || '', filter);

    return new Response(
      JSON.stringify(
        successResponse(
          {
            incidents: paginatedResult.incidents,
            total: paginatedResult.total,
            page: paginatedResult.page,
            pageSize: paginatedResult.pageSize,
          },
          {
            page: paginatedResult.page,
            pageSize: paginatedResult.pageSize,
            total: paginatedResult.total,
            totalPages: Math.ceil(paginatedResult.total / paginatedResult.pageSize) || 1,
          }
        )
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
}

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    const user = await authenticate(nextReq);
    await authorizePermission(nextReq, 'INCIDENT', 'CREATE');

    const validation = await validateBody(req, CreateIncidentSchema);
    if (!validation.success) return validation.response;

    const service = container.resolve<IIncidentService>(TOKENS.IncidentService);
    const created = await service.createIncident(validation.data, user.userId);

    return new Response(JSON.stringify(successResponse(created)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
