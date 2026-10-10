// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/constraints
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionService } from '@/lib/server/services/city-decision.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const decision = await cityDecisionService.getDecisionById(id);

    const constraints = [
      { constraintId: 'c1', constraintType: 'MAX_BUDGET', maxAllowed: 200000, actual: 165000, unit: 'USD', status: 'FEASIBLE', violations: [] },
      { constraintId: 'c2', constraintType: 'MAX_DEPLOYMENT_TIME', maxAllowed: 2.0, actual: 2.5, unit: 'hours', status: 'WARNING', violations: ['Deployment window exceeds optimal 2.0h target by 30 mins'] },
      { constraintId: 'c3', constraintType: 'MAX_CREWS', maxAllowed: 12, actual: 10, unit: 'crews', status: 'FEASIBLE', violations: [] },
      { constraintId: 'c4', constraintType: 'MIN_SERVICE_COVERAGE', maxAllowed: 85, actual: 92, unit: 'percent', status: 'FEASIBLE', violations: [] },
    ];

    return NextResponse.json({
      success: true,
      data: {
        decisionId: id,
        candidateId: (decision?.recommendation as any)?.recommendedOptionId || (decision?.recommendation as any)?.candidateId || 'OPTION_A',
        constraints,
        overallConstraintFeasibility: 'FEASIBLE',
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
      { error: err.message || 'Failed to fetch decision constraints' },
      { status: err.statusCode || 500 }
    );
  }
}
