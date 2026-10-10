// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/predictions/scenarios/[id]/impact
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
    if (!scenario || !scenario.result) {
      return NextResponse.json({ error: `Scenario ${id} impact results not available` }, { status: 404 });
    }

    return NextResponse.json({ data: scenario.result.impact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
