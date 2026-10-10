// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/events
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { digitalTwinEventService } from '@/lib/server/services/digital-twin-event.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId') || undefined;

    const events = await digitalTwinEventService.listEvents(assetId);
    return NextResponse.json({ data: events, total: events.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
