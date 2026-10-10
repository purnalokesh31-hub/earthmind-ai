// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/tradeoffs
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionService } from '@/lib/server/services/city-decision.service';
import { cityDecisionTradeOffService } from '@/lib/server/services/city-decision-tradeoff.service';
import { cityDecisionOptionService } from '@/lib/server/services/city-decision-option.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const decision = await cityDecisionService.getDecisionById(id);
    const options = cityDecisionOptionService.generateOptions(id, decision?.input?.cityId || 'city-vja');
    const recommended = options[0];
    const tradeOffAnalysis = cityDecisionTradeOffService.analyzeTradeOffs(recommended, options.slice(1));

    return NextResponse.json({
      success: true,
      data: {
        decisionId: id,
        recommendedCandidateId: recommended.optionId,
        tradeOffAnalysis,
      },
      meta: {
        decisionId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision trade-offs' },
      { status: err.statusCode || 500 }
    );
  }
}
