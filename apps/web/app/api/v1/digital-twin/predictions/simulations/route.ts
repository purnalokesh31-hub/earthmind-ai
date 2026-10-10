// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET / POST /api/v1/digital-twin/predictions/simulations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionSimulationService } from '@/lib/server/services/city-prediction-simulation.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await cityPredictionSimulationService.getScenariosByCity(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const scenario = await cityPredictionSimulationService.createScenario(body);
    return NextResponse.json({ data: scenario }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bad Request' }, { status: 400 });
  }
}
