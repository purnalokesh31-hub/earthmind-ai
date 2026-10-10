// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/regional/resources
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { regionalResourceService } from '@/lib/server/services/regional-resource.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const workloads = await regionalResourceService.getCityWorkloads();
    const recommendations = await regionalResourceService.generateCrossCityDispatchRecommendations();

    return NextResponse.json({
      data: {
        cityWorkloads: workloads,
        crossCityRecommendations: recommendations,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
