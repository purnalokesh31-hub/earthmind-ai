// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Get Strategy Comparison Matrix API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticate(req);
    const { id } = await params;

    const comparison = cityInterventionOrchestratorService.getComparison(id);
    if (!comparison) {
      return NextResponse.json(
        { error: `COMPARISON_NOT_FOUND: Strategy comparison for intervention '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
