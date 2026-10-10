// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/dispatch/queue
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const active = await dispatchService.getActiveDispatches();
    const queue = active.filter((d) => d.status === 'QUEUED' || d.status === 'PENDING');
    return NextResponse.json({ data: queue, total: queue.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 401 });
  }
}
