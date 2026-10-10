// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/scorecard
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOptionService } from '@/lib/server/services/city-decision-option.service';
import { cityDecisionTradeOffService } from '@/lib/server/services/city-decision-tradeoff.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const profileParam = (searchParams.get('profile') as any) || 'BALANCED';

    const options = cityDecisionOptionService.generateOptions(id, 'city-vja');
    const recommended = options[0];
    const scorecard = cityDecisionTradeOffService.generateScorecard(recommended, profileParam);

    return NextResponse.json({
      success: true,
      data: scorecard,
      meta: {
        decisionId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision scorecard' },
      { status: err.statusCode || 500 }
    );
  }
}
