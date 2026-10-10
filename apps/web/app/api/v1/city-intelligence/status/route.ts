// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/city-intelligence/status
// Unified City Intelligence Runtime execution status & mode
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { cityIntelligenceRuntimeService } from '../../../../../lib/server/services/city-intelligence-runtime.service';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const status = {
      executionMode: cityIntelligenceRuntimeService.getExecutionMode(),
      runtimeStatus: cityIntelligenceRuntimeService.getRuntimeStatus(),
      advisoryOnly: true,
      requiresHumanApproval: true,
      autonomousExecution: false,
      checkedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(successResponse(status)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
