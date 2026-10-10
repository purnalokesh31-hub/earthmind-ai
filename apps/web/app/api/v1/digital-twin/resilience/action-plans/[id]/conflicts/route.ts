// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/action-plans/[id]/conflicts
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceActionPlanningService } from '@/lib/server/services/resilience-action-planning.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    let plan = await resilienceActionPlanningService.getPlanById(id);
    if (!plan) {
      plan = await resilienceActionPlanningService.generateActionPlan(`orch-${id}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        planId: id,
        conflicts: plan.conflicts,
        conflictsCount: plan.conflicts.length,
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
      { error: err.message || 'Failed to fetch action conflicts' },
      { status: err.statusCode || 500 }
    );
  }
}
