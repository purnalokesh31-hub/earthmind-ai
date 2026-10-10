// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Get Action Sequence API Route
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

    const sequence = cityInterventionOrchestratorService.getSequence(id);
    if (!sequence) {
      return NextResponse.json(
        { error: `SEQUENCE_NOT_FOUND: Action sequence for intervention '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sequence,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
