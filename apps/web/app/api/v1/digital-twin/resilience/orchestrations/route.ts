// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET & POST /api/v1/digital-twin/resilience/orchestrations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceOrchestrationService } from '@/lib/server/services/resilience-orchestration.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const searchParams = req.nextUrl.searchParams;
    const cityId = searchParams.get('cityId') || 'city-vja';

    const orchestrations = await resilienceOrchestrationService.listOrchestrations(cityId);

    return NextResponse.json({
      success: true,
      data: orchestrations,
      count: orchestrations.length,
      meta: {
        cityId,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list resilience orchestrations' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();
    const cityId = body.cityId || 'city-vja';
    const objectives = body.objectives || ['LIFE_SAFETY', 'SERVICE_CONTINUITY'];

    const entity = await resilienceOrchestrationService.createOrchestration({
      cityId,
      objectives,
      constraints: body.constraints,
      simulationMode: true,
    });

    return NextResponse.json({
      success: true,
      data: entity,
      meta: {
        orchestrationId: entity.id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create resilience orchestration' },
      { status: err.statusCode || 500 }
    );
  }
}
