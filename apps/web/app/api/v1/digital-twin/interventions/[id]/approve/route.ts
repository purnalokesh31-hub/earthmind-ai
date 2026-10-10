// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Approve/Reject Human Authorization API Route
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
    const session = await authenticate(req);
    const { id } = await params;
    const body = await req.json();

    const { decision, operatorNotes } = body;

    if (!decision || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
      return NextResponse.json(
        { error: 'INVALID_DECISION: Field "decision" must be either "APPROVED" or "REJECTED".' },
        { status: 400 }
      );
    }

    if (!operatorNotes || typeof operatorNotes !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_INPUT: Field "operatorNotes" is required for audit trail recording.' },
        { status: 400 }
      );
    }

    const approval = cityInterventionOrchestratorService.approveIntervention(
      id,
      session.userId || 'operator-user',
      decision,
      operatorNotes
    );

    return NextResponse.json({
      success: true,
      message: `Intervention plan '${id}' successfully ${decision} by operator.`,
      data: approval,
    });
  } catch (err: any) {
    const isNotFound = err.message?.includes('INTERVENTION_NOT_FOUND');
    const isConflict = err.message?.includes('INTERVENTION_ALREADY_DECIDED');

    const status = isNotFound ? 404 : isConflict ? 409 : 400;
    return NextResponse.json(
      { error: err.message || 'Failed to record intervention approval decision' },
      { status: err.statusCode || status }
    );
  }
}
