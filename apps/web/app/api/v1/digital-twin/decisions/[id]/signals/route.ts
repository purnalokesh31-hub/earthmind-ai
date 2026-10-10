// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/signals
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionFusionService } from '@/lib/server/services/city-decision-fusion.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const signals = cityDecisionFusionService.fuseSignals('city-vja');

    return NextResponse.json({
      success: true,
      data: {
        decisionId: id,
        signals,
        signalsCount: signals.length,
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
      { error: err.message || 'Failed to fetch decision signals' },
      { status: err.statusCode || 500 }
    );
  }
}
