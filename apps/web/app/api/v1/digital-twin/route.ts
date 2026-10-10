// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryInfrastructureAssetRepository } from '@/lib/server/repositories/digital-twin.repository';
import { DigitalTwinOverviewDto } from '@/lib/server/domain/digital-twin/digital-twin.domain';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const assets = await memoryInfrastructureAssetRepository.listByCityId(cityId);

    const operational = assets.filter((a) => a.operationalStatus === 'OPERATIONAL').length;
    const degraded = assets.filter((a) => a.operationalStatus === 'DEGRADED').length;
    const critical = assets.filter((a) => a.operationalStatus === 'CRITICAL').length;
    const avgScore = assets.length > 0
      ? Number((assets.reduce((sum, a) => sum + a.conditionScore, 0) / assets.length).toFixed(1))
      : 100;

    const overview: DigitalTwinOverviewDto = {
      twinId: `dt-${cityId}`,
      cityName: 'Vijayawada Municipal Sector',
      totalAssetsCount: assets.length,
      operationalAssetsCount: operational,
      degradedAssetsCount: degraded,
      criticalAssetsCount: critical,
      averageConditionScore: avgScore,
      activeSensorsCount: 14,
      linkedIncidentsCount: 3,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ data: overview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
