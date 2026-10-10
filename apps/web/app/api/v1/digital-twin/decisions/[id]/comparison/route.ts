// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 GET Candidate Trade-Off Comparison API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticate(req);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const decisionContext = await cityDecisionOrchestratorService.getDecisionById(id);
    const topRanked = decisionContext.recommendedCandidate;

    const scoreDeltas = decisionContext.evaluatedCandidates.map((opt) => ({
      optionId: opt.optionId,
      title: opt.title,
      overallDecisionScore: opt.overallDecisionScore,
      deltaFromTopRanked: topRanked ? Math.round((topRanked.overallDecisionScore - opt.overallDecisionScore) * 10) / 10 : 0,
      riskReduction: opt.riskReduction,
      costUsd: opt.costUsd,
      downtimeHours: opt.downtimeHours,
      rank: opt.rank,
      isFeasible: opt.evaluationStatus !== 'CONSTRAINT_VIOLATION',
    }));

    return NextResponse.json({
      success: true,
      data: {
        pipelineExecutionId: id,
        cityId: decisionContext.cityId,
        strategy: decisionContext.optimizationStrategy,
        topRankedOptionId: topRanked?.optionId || null,
        topRankedTitle: topRanked?.title || null,
        comparison: scoreDeltas,
        candidates: decisionContext.evaluatedCandidates,
        requiresHumanApproval: true,
        dataSource: 'SIMULATION',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch candidate comparison metrics' },
      { status: err.statusCode || 401 }
    );
  }
}
