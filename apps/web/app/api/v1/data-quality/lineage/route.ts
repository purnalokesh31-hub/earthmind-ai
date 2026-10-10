// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/data-quality/lineage
// Query end-to-end data lineage trace by event ID, signal ID, or decision ID
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { dataLineageService } from '../../../../../lib/server/services/data-lineage.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const url = new URL(req.url);
    const traceOrEntityId = url.searchParams.get('id');

    if (traceOrEntityId) {
      const trace = dataLineageService.getTraceById(traceOrEntityId);
      return new Response(JSON.stringify(successResponse(trace || dataLineageService.createSampleTrace())), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const traces = dataLineageService.listAllTraces();
    if (traces.length === 0) {
      dataLineageService.createSampleTrace();
    }

    return new Response(JSON.stringify(successResponse(dataLineageService.listAllTraces())), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
