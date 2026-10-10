import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResilienceReadinessRepository } from '@/lib/server/repositories/city-resilience-readiness.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await commanderOnly(req);

    const { id } = await params;
    const body = await req.json();

    const decision = body.decision || 'APPROVED';
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT: decision must be APPROVED or REJECTED.' }, { status: 400 });
    }

    const repo = memoryCityResilienceReadinessRepository;
    const entity = repo.getReadiness(id);
    if (!entity) {
      return NextResponse.json({ success: false, error: `Resilience readiness assessment '${id}' not found.` }, { status: 404 });
    }

    const now = new Date().toISOString();
    const approval = repo.saveApproval({
      approvalId: `appr-res-${Date.now()}`,
      readinessId: id,
      recommendationId: entity.recommendation?.recommendationId || `rec-${id}`,
      userId: auth.userId,
      userRole: auth.role,
      decision,
      operatorNotes: body.operatorNotes,
      timestamp: now,
      requiresHumanApproval: true,
    });

    const targetStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    repo.updateStatus(id, targetStatus, auth.userId, body.operatorNotes);

    return NextResponse.json({
      success: true,
      data: approval,
      case: entity,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      authorizationStatus: decision === 'APPROVED' ? 'APPROVED_BY_HUMAN_OPERATOR' : 'REJECTED_BY_HUMAN_OPERATOR',
      provenance: 'RESILIENCE_PREPAREDNESS',
    });
  } catch (err: any) {
    const isConflict = err.message?.includes('RESILIENCE_DECISION_ALREADY_DECIDED');
    const status = isConflict ? 409 : err.statusCode || 400;
    return NextResponse.json({ success: false, error: err.message || 'APPROVAL_FAILED' }, { status });
  }
}
