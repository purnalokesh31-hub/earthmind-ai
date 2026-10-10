// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryUtilityRepository } from '@/lib/server/repositories/utility.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const assets = await memoryUtilityRepository.listAssetsByCityId(cityId);
    const zones = await memoryUtilityRepository.listZonesByCityId(cityId);

    const electricityAssets = assets.filter((a) => a.utilityType === 'ELECTRICITY');
    const waterAssets = assets.filter((a) => a.utilityType === 'WATER');

    const electricityHealth = Math.round(
      electricityAssets.reduce((acc, a) => acc + a.conditionScore, 0) / (electricityAssets.length || 1)
    );
    const waterHealth = Math.round(
      waterAssets.reduce((acc, a) => acc + a.conditionScore, 0) / (waterAssets.length || 1)
    );

    return NextResponse.json({
      data: {
        cityId,
        electricityHealthScore: electricityHealth,
        waterHealthScore: waterHealth,
        totalUtilityAssets: assets.length,
        criticalAssetsCount: assets.filter((a) => a.state === 'CRITICAL').length,
        offlineAssetsCount: assets.filter((a) => a.state === 'OFFLINE').length,
        activeZoneSummaries: zones,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
