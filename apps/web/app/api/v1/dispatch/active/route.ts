// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/dispatch/active
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const active = await dispatchService.getActiveDispatches();
    return NextResponse.json({ data: active, total: active.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 401 });
  }
}
