// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/telemetry/health
// Streaming transport health and ingestion pipeline status
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { cityTelemetryIngestionService } from '../../../../../lib/server/services/city-telemetry-ingestion.service';
import { providerHealthService } from '../../../../../lib/server/services/provider-health.service';
import { providerRegistryService } from '../../../../../lib/server/services/provider-registry.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const metrics = cityTelemetryIngestionService.getMetrics();
    const snapshot = providerHealthService.generateSnapshot(providerRegistryService.listProviderAdapters());

    const health = {
      status: metrics.backpressureActive ? 'DEGRADED' : 'HEALTHY',
      transport: cityTelemetryIngestionService.getTransport().transportType,
      backpressureActive: metrics.backpressureActive,
      activeBufferCapacityPct: metrics.activeBufferCapacityPct,
      systemwideHealth: snapshot.healthyCount > 0 ? 'HEALTHY' : 'DEGRADED',
      checkedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(successResponse(health)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
