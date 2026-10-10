// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/predictions/scenarios/[id]/run
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionScenarioService } from '@/lib/server/services/city-prediction-scenario.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await context.params;

    const existing = await cityPredictionScenarioService.getScenario(id);
    if (!existing) {
      return NextResponse.json({ error: `Scenario ${id} not found` }, { status: 404 });
    }

    if (existing.status === 'RUNNING') {
      return NextResponse.json({ error: `Scenario ${id} is already running` }, { status: 409 });
    }

    const executed = await cityPredictionScenarioService.executeScenarioSimulation(id);
    return NextResponse.json({ data: executed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error running scenario' }, { status: 400 });
  }
}
