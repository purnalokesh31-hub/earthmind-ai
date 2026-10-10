// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/utilities/optimizations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { utilityRecoveryOptimizationService } from '@/lib/server/services/utility-recovery-optimization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Approving a utility optimization strategy is a high-risk action — requires COMMANDER or above.
    const authResult = await commanderOnly(req);
    const { id } = await params;

    const approved = await utilityRecoveryOptimizationService.approveRecommendation(id, authResult.userId);
    return NextResponse.json({
      data: approved,
      message: 'Utility recovery & resilience optimization strategy approved by authorized human operator',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
