// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/action-plans/[id]/comparison
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceActionComparisonService } from '@/lib/server/services/resilience-action-comparison.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const comparisons = resilienceActionComparisonService.generatePlanComparisons([], 48.5);

    return NextResponse.json({
      success: true,
      data: {
        planId: id,
        comparisons,
        comparisonsCount: comparisons.length,
      },
      meta: {
        planId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch plan comparisons' },
      { status: err.statusCode || 500 }
    );
  }
}
