// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/command-center/stream
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { realTimeEventBusService } from '@/lib/server/events/realtime-event-bus.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const events = realTimeEventBusService.getRecentEvents(25);
    const connectionState = realTimeEventBusService.getConnectionState();

    return NextResponse.json({
      connectionState,
      data: events,
      total: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
