// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/predictions/scenarios/[id]/recommendation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionScenarioService } from '@/lib/server/services/city-prediction-scenario.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await context.params;

    const scenario = await cityPredictionScenarioService.getScenario(id);
    if (!scenario || !scenario.recommendation) {
      return NextResponse.json({ error: `Scenario ${id} recommendation not found` }, { status: 404 });
    }

    return NextResponse.json({ data: scenario.recommendation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
