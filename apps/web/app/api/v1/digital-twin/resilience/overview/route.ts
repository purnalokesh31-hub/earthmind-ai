// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 REST API Route
// GET /api/v1/digital-twin/resilience/overview
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

    const state = resilienceOrchestrationService.calculateResilienceState(cityId);
    const dependencies = resilienceOrchestrationService.evaluateStructuralDependencies(cityId);
    const priorities = resilienceOrchestrationService.generatePriorities(state);

    return NextResponse.json({
      success: true,
      data: {
        cityId,
        overallResilienceScore: state.overallResilienceScore,
        classification: state.classification,
        domainStates: state.domainStates,
        criticalVulnerabilities: state.criticalVulnerabilities,
        dependencies,
        priorities,
      },
      meta: {
        cityId,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch citywide resilience overview' },
      { status: err.statusCode || 500 }
    );
  }
}
