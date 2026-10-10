// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/transit
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryTransitRepository } from '@/lib/server/repositories/transit.repository';
import { transitDisruptionService } from '@/lib/server/services/transit-disruption.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const routes = await memoryTransitRepository.listRoutesByCityId(cityId);
    const stops = await memoryTransitRepository.listStopsByCityId(cityId);
    const disruptions = await transitDisruptionService.detectDisruptions(cityId);
    const recommendations = await memoryTransitRepository.listRecommendationsByCityId(cityId);

    return NextResponse.json({
      data: {
        cityId,
        totalRoutes: routes.length,
        totalStops: stops.length,
        activeDisruptionsCount: disruptions.length,
        activeRecommendationsCount: recommendations.length,
        routes,
        disruptions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
