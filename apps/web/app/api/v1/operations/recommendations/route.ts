// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/operations/recommendations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { decisionSupportService } from '@/lib/server/services/decision-support.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const recs = await decisionSupportService.listPendingRecommendations();
    return NextResponse.json({ data: recs, total: recs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
