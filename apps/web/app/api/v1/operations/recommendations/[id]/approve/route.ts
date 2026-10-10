// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/operations/recommendations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { decisionSupportService } from '@/lib/server/services/decision-support.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Approving an operations recommendation is a high-risk action — requires COMMANDER or above.
    const user = await commanderOnly(req);
    const { id } = await params;

    const rec = await decisionSupportService.approveRecommendation(id, user.email || 'Duty Commander');
    return NextResponse.json({ data: rec, message: `Recommendation ${id} approved successfully` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
