// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/regional/compare
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const comparison = [
      {
        cityId: 'city-vja',
        cityName: 'Vijayawada',
        incidents: 14,
        criticalIncidents: 4,
        averageResponseTimeMinutes: 18.5,
        slaComplianceRate: 94.2,
        dispatchWorkload: 85,
        aiDetections: 12,
        resolvedIncidents: 28,
        riskScore: 92,
      },
      {
        cityId: 'city-gtr',
        cityName: 'Guntur',
        incidents: 4,
        criticalIncidents: 1,
        averageResponseTimeMinutes: 14.0,
        slaComplianceRate: 98.0,
        dispatchWorkload: 32,
        aiDetections: 5,
        resolvedIncidents: 16,
        riskScore: 38,
      },
      {
        cityId: 'city-vzg',
        cityName: 'Visakhapatnam',
        incidents: 8,
        criticalIncidents: 2,
        averageResponseTimeMinutes: 22.0,
        slaComplianceRate: 91.5,
        dispatchWorkload: 55,
        aiDetections: 9,
        resolvedIncidents: 22,
        riskScore: 64,
      },
    ];

    return NextResponse.json({ data: comparison });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
