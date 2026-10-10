// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/telemetry/status
// Ingestion pipeline metrics, buffer capacity & backpressure status
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

    const metrics = cityTelemetryIngestionService.getMetrics();

    return new Response(JSON.stringify(successResponse(metrics)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
