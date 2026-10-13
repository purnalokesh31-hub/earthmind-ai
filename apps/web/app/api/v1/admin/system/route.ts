// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Admin Panel: System Telemetry & Metrics Controller
// GET /api/v1/admin/system
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { getSystemHealthProbe } from '../../../../../lib/server/monitoring';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { prisma } from '../../../../../lib/server/database/prisma';

export async function GET(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const health = await getSystemHealthProbe();

    // Query high-level database metrics
    const [userCount, incidentCount, auditCount, evidenceCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.incident.count().catch(() => 0),
      prisma.auditLog.count().catch(() => 0),
      prisma.evidenceItem.count().catch(() => 0),
    ]);

    const systemInfo = {
      health,
      counts: {
        totalUsers: userCount,
        totalIncidents: incidentCount,
        auditLogs: auditCount,
        evidenceItems: evidenceCount,
      },
      environment: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
    };

    return new Response(JSON.stringify(successResponse(systemInfo)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
