// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/action-plans/[id]/recommendation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceActionPlanningService } from '@/lib/server/services/resilience-action-planning.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const recommendation = await resilienceActionPlanningService.getRecommendation(id);

    return NextResponse.json({
      success: true,
      data: recommendation,
      meta: {
        orchestrationId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch action plan recommendation' },
      { status: err.statusCode || 500 }
    );
  }
}
