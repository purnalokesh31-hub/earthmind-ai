// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/command-center/kpis
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { commandCenterService } from '@/lib/server/services/command-center.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const kpis = await commandCenterService.getOperationalKpis();
    return NextResponse.json({ data: kpis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
