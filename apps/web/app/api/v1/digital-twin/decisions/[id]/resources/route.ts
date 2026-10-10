// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/resources
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResourceDecisionService } from '@/lib/server/services/city-resource-decision.service';
import { cityDecisionService } from '@/lib/server/services/city-decision.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const decision = await cityDecisionService.getDecisionById(id);
    const inventory = cityResourceDecisionService.getMunicipalResourceInventory();
    const candidateId = (decision?.recommendation as any)?.recommendedOptionId || (decision?.recommendation as any)?.candidateId || 'OPTION_A';
    const demand = cityResourceDecisionService.evaluateResourceDemand(candidateId, { emergencyCrews: 8, mobileGenerators: 4, pneumaticBarriers: 20 });

    return NextResponse.json({
      success: true,
      data: {
        decisionId: id,
        inventory,
        recommendedCandidateDemand: demand,
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
      { error: err.message || 'Failed to fetch decision resource analysis' },
      { status: err.statusCode || 500 }
    );
  }
}
