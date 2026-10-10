// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/mobility
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryMobilityRepository } from '@/lib/server/repositories/mobility.repository';
import { congestionDetectionService } from '@/lib/server/services/congestion-detection.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const segments = await memoryMobilityRepository.listSegmentsByCityId(cityId);
    const congestion = await congestionDetectionService.detectCongestionEvents(cityId);
    const recommendations = await memoryMobilityRepository.listRecommendationsByCityId(cityId);

    return NextResponse.json({
      data: {
        cityId,
        totalSegments: segments.length,
        severelyCongestedSegments: congestion.filter((c) => c.congestionLevel === 'SEVERELY_CONGESTED').length,
        activeRecommendationsCount: recommendations.length,
        segments,
        congestionEvents: congestion,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
