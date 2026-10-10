// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/climate/exposure
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { climateExposureService } from '@/lib/server/services/climate-exposure.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';
    const scenarioId = searchParams.get('scenarioId') || 'clm-scn-101';

    const exposure = await climateExposureService.calculateExposedAssets(scenarioId, cityId);
    return NextResponse.json({ data: exposure, total: exposure.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
