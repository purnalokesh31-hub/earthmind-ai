// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/orchestrations/[id]/dependencies
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { resilienceOrchestrationService } from '@/lib/server/services/resilience-orchestration.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const entity = await resilienceOrchestrationService.getOrchestrationById(id);
    const dependencies = entity?.dependencies || resilienceOrchestrationService.evaluateStructuralDependencies('city-vja');

    return NextResponse.json({
      success: true,
      data: {
        orchestrationId: id,
        dependencies,
        totalDependenciesCount: dependencies.length,
      },
      meta: {
        orchestrationId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch resilience dependencies' },
      { status: err.statusCode || 500 }
    );
  }
}
