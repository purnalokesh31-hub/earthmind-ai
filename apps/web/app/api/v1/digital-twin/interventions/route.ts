// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// City Interventions List & Create API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || undefined;

    const list = cityInterventionOrchestratorService.listInterventions(cityId);
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized or failed to fetch interventions' },
      { status: err.statusCode || 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticate(req);
    const body = await req.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_INPUT: Field "title" is required.' },
        { status: 400 }
      );
    }

    const input = {
      cityId: body.cityId || 'city-vja',
      scenarioId: body.scenarioId,
      predictionId: body.predictionId,
      decisionId: body.decisionId,
      title: body.title,
      description: body.description,
      requestedBy: session.userId || 'operator-user',
      targetDomains: body.targetDomains,
      targetZones: body.targetZones,
      optimizationObjective: body.optimizationObjective || 'BALANCED',
      budgetConstraintUsd: body.budgetConstraintUsd || 15000,
      maxDowntimeHours: body.maxDowntimeHours || 4.0,
    };

    const created = cityInterventionOrchestratorService.createIntervention(input);
    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create intervention plan' },
      { status: err.statusCode || 400 }
    );
  }
}
