// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/predictions/scenarios/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionSimulationService } from '@/lib/server/services/city-prediction-simulation.service';
import { cityPredictionScenarioService } from '@/lib/server/services/city-prediction-scenario.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await authenticate(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const existing = await cityPredictionScenarioService.getScenario(id);
    if (!existing) {
      return NextResponse.json({ error: `Scenario ${id} not found` }, { status: 404 });
    }

    if (!existing.recommendation) {
      return NextResponse.json({ error: `Scenario ${id} has no recommendation to approve` }, { status: 400 });
    }

    if (existing.recommendation.approvalStatus === 'APPROVED') {
      return NextResponse.json({ error: `Scenario ${id} recommendation is already approved` }, { status: 409 });
    }

    const updated = await cityPredictionSimulationService.approveRecommendation(
      id,
      authContext.userId,
      body.notes
    );

    return NextResponse.json({
      data: {
        scenarioId: updated.scenarioId,
        recommendationId: updated.recommendation?.recommendationId,
        approvalAudit: updated.approvalAudit,
        approvalStatus: updated.recommendation?.approvalStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Approval failed' }, { status: err.statusCode || 400 });
  }
}
