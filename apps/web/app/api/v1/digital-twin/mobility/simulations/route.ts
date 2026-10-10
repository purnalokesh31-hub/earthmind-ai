// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/mobility/simulations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const scenario = {
      scenarioId: `mob-sim-${Date.now()}`,
      title: body.title || 'Custom Traffic Disruption Scenario',
      description: body.description || 'Simulates road closure delay delta',
      cityId: body.cityId || 'city-vja',
      disruptionType: body.disruptionType || 'ROAD_CLOSURE',
      targetSegmentId: body.targetSegmentId || 'seg-rd-101',
      simulatedCongestion: 'GRIDLOCK',
      estimatedDelayDeltaMinutes: 24,
      status: 'COMPLETED',
    };

    return NextResponse.json({ data: scenario, message: 'Traffic simulation scenario created' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
