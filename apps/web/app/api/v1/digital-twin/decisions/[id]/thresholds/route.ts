// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/thresholds
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionThresholdService } from '@/lib/server/services/city-decision-threshold.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const thresholdReport = cityDecisionThresholdService.evaluateThresholds(id, {
      riskScore: 88.4,
      populationExposed: 34200,
      cascadeProbability: 0.82,
      confidence: 94.5,
      resourceShortageCount: 2,
      timeToImpactHours: 2.5,
      serviceDisruptionIndex: 78.0,
    });

    return NextResponse.json({
      success: true,
      data: thresholdReport,
      meta: {
        decisionId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision thresholds' },
      { status: err.statusCode || 500 }
    );
  }
}
