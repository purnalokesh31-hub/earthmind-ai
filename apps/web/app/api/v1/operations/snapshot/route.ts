// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/operations/snapshot
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { situationAwarenessService } from '@/lib/server/services/situation-awareness.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const scopeLevel = searchParams.get('scopeLevel') || 'CITY';
    const scopeId = searchParams.get('scopeId') || 'city-vja';

    const snapshot = await situationAwarenessService.getSnapshot(scopeLevel, scopeId);
    return NextResponse.json({ data: snapshot });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
