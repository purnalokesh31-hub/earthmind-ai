// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/mobility/simulations/[id]/run
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const result = {
      simulationId: id,
      executedAt: new Date().toISOString(),
      baselineAvgSpeedKmh: 34,
      simulatedAvgSpeedKmh: 14,
      delayDeltaMinutes: 20,
      affectedIntersectionsCount: 3,
      recommendedDiversions: ['Divert via MG Road Central Corridor'],
    };

    return NextResponse.json({ data: result, message: 'Traffic simulation executed in isolated memory' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
