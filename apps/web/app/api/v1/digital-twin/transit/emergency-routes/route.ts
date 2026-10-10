// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/transit/emergency-routes
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { multimodalEmergencyRouteService } from '@/lib/server/services/multimodal-emergency-route.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Benz Circle Depot';
    const destination = searchParams.get('destination') || 'Ward 12 Culvert Site';
    const cityId = searchParams.get('cityId') || 'city-vja';

    const route = await multimodalEmergencyRouteService.calculateEmergencyRoute(origin, destination, cityId);
    return NextResponse.json({ data: route });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
