// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/transit/multimodal-routes
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Benz Circle Terminal';
    const destination = searchParams.get('destination') || 'Government Hospital';

    const route = {
      routeId: `mm-route-${Date.now()}`,
      origin,
      destination,
      modesUsed: ['BUS', 'PEDESTRIAN'],
      estimatedTimeMinutes: 18,
      timeSavedMinutes: 12,
      confidenceScore: 92.0,
    };

    return NextResponse.json({ data: route });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
