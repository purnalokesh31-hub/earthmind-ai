// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/transit/simulations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const scenario = {
      scenarioId: `trn-sim-${Date.now()}`,
      title: body.title || 'Custom Transit Disruption Scenario',
      description: body.description || 'Simulates bus route detour delay delta',
      cityId: body.cityId || 'city-vja',
      disruptionType: body.disruptionType || 'ROUTE_CLOSURE',
      targetRouteId: body.targetRouteId || 'rt-bus-12',
      simulatedState: 'SEVERELY_DELAYED',
      estimatedDelayDeltaMinutes: 28,
      status: 'COMPLETED',
    };

    return NextResponse.json({ data: scenario, message: 'Transit simulation scenario created' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
