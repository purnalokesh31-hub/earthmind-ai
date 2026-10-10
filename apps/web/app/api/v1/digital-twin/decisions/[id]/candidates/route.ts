// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 GET Evaluated Candidate Options API Route
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

    return NextResponse.json({
      success: true,
      data: {
        pipelineExecutionId: id,
        cityId: decisionContext.cityId,
        evaluatedCandidateCount: decisionContext.evaluatedCandidateCount,
        candidates: decisionContext.evaluatedCandidates,
        topRankedOptionId: decisionContext.recommendedCandidate?.optionId || null,
        requiresHumanApproval: true,
        dataSource: 'SIMULATION',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch candidate options' },
      { status: err.statusCode || 401 }
    );
  }
}
