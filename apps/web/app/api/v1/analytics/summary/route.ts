// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Analytics & Mission Control Summary Controller
// GET /api/v1/analytics/summary — Mission Control Dashboard Analytics
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IAnalyticsService } from '../../../../../lib/server/services/analytics.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'METRICS', 'READ');

    const service = container.resolve<IAnalyticsService>(TOKENS.AnalyticsService);
    const summary = await service.getMissionControlSummary();

    return new Response(JSON.stringify(successResponse(summary)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
