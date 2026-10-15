// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Linking Controller
// POST /api/v1/evidence/[id]/link  — Link Evidence Entity to Incident Record
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { authenticateOrPrototypeUser } from '../../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../../lib/server/container';
import { IEvidenceRepository } from '../../../../../../lib/server/repositories/evidence.repository';
import { BadRequestError, NotFoundError } from '../../../../../../lib/server/errors';
import { logger } from '../../../../../../lib/server/logger';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    await authenticateOrPrototypeUser(req as unknown as NextRequest);
    const { id: evidenceId } = await params;

    const body = await req.json().catch(() => null);
    const incidentId = body?.incidentId;

    if (!incidentId || typeof incidentId !== 'string') {
      throw new BadRequestError('incidentId is required to link evidence.');
    }

    const evidenceRepo = container.resolve<IEvidenceRepository>(TOKENS.EvidenceRepository);
    const existing = await evidenceRepo.findById(evidenceId);
    if (!existing) {
      throw new NotFoundError(`Evidence asset with ID '${evidenceId}' was not found.`);
    }

    await evidenceRepo.linkToIncident(evidenceId, incidentId);
    logger.info(`[EvidenceLinkAPI] Linked evidence '${evidenceId}' to incident '${incidentId}'`);

    return new Response(
      JSON.stringify(
        successResponse({
          evidenceId,
          linkedIncidentId: incidentId,
          updatedAt: new Date().toISOString(),
        })
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
): Promise<Response> {
  return POST(req, props);
}
