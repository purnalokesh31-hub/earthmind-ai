// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/operations/recommendations/[id]/reject
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { decisionSupportService } from '@/lib/server/services/decision-support.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rejecting an operations recommendation is a high-risk action — requires COMMANDER or above.
    const user = await commanderOnly(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const rec = await decisionSupportService.rejectRecommendation(id, user.email || 'Duty Commander', body.reason);
    return NextResponse.json({ data: rec, message: `Recommendation ${id} rejected` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
