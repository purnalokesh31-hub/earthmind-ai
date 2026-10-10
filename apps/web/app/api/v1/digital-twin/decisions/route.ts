// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Decision Intelligence API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';
import { OptimizationStrategy } from '@/lib/server/services/city-decision-objective.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);

    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';
    const strategy = (searchParams.get('strategy') as OptimizationStrategy) || 'BALANCED';

    const decisionContext = await cityDecisionOrchestratorService.runUnifiedPipeline(cityId, strategy);

    return NextResponse.json({
      success: true,
      data: decisionContext,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision optimization context' },
      { status: err.statusCode || 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);

    const body = await req.json();
    const cityId = body.cityId || 'city-vja';
    const strategy = (body.strategy as OptimizationStrategy) || 'BALANCED';

    const decisionContext = await cityDecisionOrchestratorService.runUnifiedPipeline(cityId, strategy);

    return NextResponse.json({
      success: true,
      data: decisionContext,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to run decision optimization pipeline' },
      { status: err.statusCode || 400 }
    );
  }
}
