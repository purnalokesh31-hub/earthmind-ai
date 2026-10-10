// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/predictions/scenarios/[id]/comparison
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionScenarioService } from '@/lib/server/services/city-prediction-scenario.service';
import { cityPredictionCascadeService } from '@/lib/server/services/city-prediction-cascade.service';
import { cityPredictionImpactService } from '@/lib/server/services/city-prediction-impact.service';
import { cityPredictionRiskComparisonService } from '@/lib/server/services/city-prediction-risk-comparison.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await context.params;

    const scenario = await cityPredictionScenarioService.getScenario(id);
    if (!scenario || !scenario.result) {
      return NextResponse.json({ error: `Scenario ${id} comparison not available` }, { status: 404 });
    }

    const cascadeHops = cityPredictionCascadeService.simulateCascadePropagation(scenario.input.variables);
    const impact = cityPredictionImpactService.calculateImpact(scenario.input.variables, cascadeHops);
    const comparison = cityPredictionRiskComparisonService.compareBaselineVsScenario(
      scenario.result.risk.simulatedRiskScore,
      impact,
      cascadeHops
    );

    return NextResponse.json({ data: comparison });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
