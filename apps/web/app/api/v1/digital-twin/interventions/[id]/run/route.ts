// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Run Intervention Analysis API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticate(req);
    const { id } = await params;

    const analyzedPlan = cityInterventionOrchestratorService.runInterventionAnalysis(id);

    return NextResponse.json({
      success: true,
      message: `Intervention planning analysis completed for '${id}'. Plan transitioned to AWAITING_APPROVAL.`,
      data: analyzedPlan,
    });
  } catch (err: any) {
    const status = err.message?.includes('INTERVENTION_NOT_FOUND') ? 404 : 400;
    return NextResponse.json(
      { error: err.message || 'Failed to run intervention analysis pipeline' },
      { status: err.statusCode || status }
    );
  }
}
