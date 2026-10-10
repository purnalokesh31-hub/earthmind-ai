// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/telemetry/recent
// Recent normalized CityTelemetryEvent stream (supports domain filter)
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { cityTelemetryIngestionService } from '../../../../../lib/server/services/city-telemetry-ingestion.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const events = cityTelemetryIngestionService.getRecentEvents(domain, limit);

    return new Response(JSON.stringify(successResponse(events)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
