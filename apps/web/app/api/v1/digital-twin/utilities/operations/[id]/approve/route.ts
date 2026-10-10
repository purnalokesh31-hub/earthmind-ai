// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/utilities/operations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityOperationsOrchestratorService } from '@/lib/server/services/utility-operations-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticate(req);
    const { id } = await params;

    const res = await utilityOperationsOrchestratorService.approveRecommendation(id, authResult.userId);
    return NextResponse.json({
      data: res,
      message: 'Closed-loop operational recommendation approved and authorized work order created',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
