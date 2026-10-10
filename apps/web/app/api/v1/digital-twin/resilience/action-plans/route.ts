// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET & POST /api/v1/digital-twin/resilience/action-plans
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceActionPlanningService } from '@/lib/server/services/resilience-action-planning.service';
import { resilienceActionPlanningRepository } from '@/lib/server/repositories/resilience-action-planning.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const plans = await resilienceActionPlanningRepository.listAllPlans();

    return NextResponse.json({
      success: true,
      data: plans,
      count: plans.length,
      meta: {
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list resilience action plans' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();
    const orchestrationId = body.orchestrationId || `orch-${Date.now()}`;
    const objectiveMode = body.objectiveMode || 'BALANCED';

    const plan = await resilienceActionPlanningService.generateActionPlan(orchestrationId, objectiveMode);

    return NextResponse.json({
      success: true,
      data: plan,
      meta: {
        planId: plan.id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create resilience action plan' },
      { status: err.statusCode || 500 }
    );
  }
}
