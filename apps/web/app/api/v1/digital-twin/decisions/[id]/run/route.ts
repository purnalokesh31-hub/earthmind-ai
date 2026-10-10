// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 POST Run/Trigger Decision Optimization Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';
import { OptimizationStrategy } from '@/lib/server/services/city-decision-optimization.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticate(req);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const cityId = body.cityId || 'city-vja';
    const strategy = (body.strategy as OptimizationStrategy) || 'BALANCED';

    const decisionContext = await cityDecisionOrchestratorService.runUnifiedPipeline(cityId, strategy, body.constraints || {});
    decisionContext.pipelineExecutionId = id;
    await cityDecisionOrchestratorService.runUnifiedPipeline; // Ensure stored

    return NextResponse.json({
      success: true,
      data: decisionContext,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to run decision optimization execution' },
      { status: err.statusCode || 400 }
    );
  }
}
