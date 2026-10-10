// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/predictions/simulations/[id]/run
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionSimulationService } from '@/lib/server/services/city-prediction-simulation.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await context.params;

    const scenario = await cityPredictionSimulationService.runScenario(id);
    return NextResponse.json({ data: scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error executing simulation' }, { status: 400 });
  }
}
