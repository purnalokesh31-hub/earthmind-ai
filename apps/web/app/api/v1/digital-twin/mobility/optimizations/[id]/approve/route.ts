// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/mobility/optimizations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { trafficOptimizationService } from '@/lib/server/services/traffic-optimization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Approving a traffic optimization recommendation is a high-risk action — requires COMMANDER or above.
    const authResult = await commanderOnly(req);
    const { id } = await params;

    const approved = await trafficOptimizationService.approveRecommendation(id, authResult.userId);
    return NextResponse.json({ data: approved, message: 'Traffic optimization recommendation approved by human operator' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
