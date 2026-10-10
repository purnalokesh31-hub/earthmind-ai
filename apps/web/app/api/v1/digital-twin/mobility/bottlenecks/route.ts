// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/mobility/bottlenecks
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { trafficBottleneckService } from '@/lib/server/services/traffic-bottleneck.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const bottlenecks = await trafficBottleneckService.identifyBottlenecks(cityId);
    return NextResponse.json({ data: bottlenecks, total: bottlenecks.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
