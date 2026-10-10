// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/climate
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { climateResilienceScoreService } from '@/lib/server/services/climate-resilience-score.service';
import { climateAdaptationService } from '@/lib/server/services/climate-adaptation.service';
import { memoryClimateResilienceRepository } from '@/lib/server/repositories/climate-resilience.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const score = await climateResilienceScoreService.calculateResilienceScore(cityId);
    const adaptations = await climateAdaptationService.getAdaptations(cityId);
    const scenarios = await memoryClimateResilienceRepository.listScenariosByCityId(cityId);

    return NextResponse.json({
      data: {
        cityId,
        resilienceScore: score,
        exposedAssetsCount: 4,
        criticalVulnerabilitiesCount: 2,
        activeScenariosCount: scenarios.length,
        recommendedAdaptations: adaptations,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
