// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// POST /api/v1/digital-twin/resilience/action-plans/[id]/generate
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceActionPlanningService } from '@/lib/server/services/resilience-action-planning.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const objectiveMode = body.objectiveMode || 'BALANCED';

    const plan = await resilienceActionPlanningService.generateActionPlan(id, objectiveMode);

    return NextResponse.json({
      success: true,
      data: plan,
      meta: {
        orchestrationId: id,
        planId: plan.id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate action plan' },
      { status: err.statusCode || 500 }
    );
  }
}
