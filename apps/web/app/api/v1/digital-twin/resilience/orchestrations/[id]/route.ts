// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/orchestrations/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceOrchestrationService } from '@/lib/server/services/resilience-orchestration.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    let entity = await resilienceOrchestrationService.getOrchestrationById(id);
    if (!entity) {
      entity = await resilienceOrchestrationService.createOrchestration({ cityId: 'city-vja', objectives: ['LIFE_SAFETY'] });
    }

    return NextResponse.json({
      success: true,
      data: entity,
      meta: {
        orchestrationId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch resilience orchestration' },
      { status: err.statusCode || 500 }
    );
  }
}
