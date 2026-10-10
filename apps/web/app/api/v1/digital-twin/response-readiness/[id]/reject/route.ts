import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResponseReadinessRepository } from '@/lib/server/repositories/city-response-readiness.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const repo = memoryCityResponseReadinessRepository;
    const entity = repo.getReadiness(id);

    if (!entity) {
      return NextResponse.json({ success: false, error: `Response execution readiness assessment '${id}' not found.` }, { status: 404 });
    }

    const now = new Date().toISOString();
    const approval = repo.saveApproval({
      approvalId: `appr-resp-${Date.now()}`,
      readinessId: id,
      interventionId: entity.interventionId,
      userId: auth.userId,
      userRole: auth.role,
      decision: 'REJECTED',
      operatorNotes: body.operatorNotes || 'Human operator rejected execution readiness plan.',
      timestamp: now,
      requiresHumanApproval: true,
    });

    repo.updateStatus(id, 'REJECTED', auth.userId, body.operatorNotes);

    return NextResponse.json({
      success: true,
      data: approval,
      case: entity,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      authorizationStatus: 'REJECTED_BY_HUMAN_OPERATOR',
      provenance: 'EXECUTION_READINESS',
    });
  } catch (err: any) {
    const isConflict = err.message?.includes('RESILIENCE_DECISION_ALREADY_DECIDED');
    const status = isConflict ? 409 : 400;
    return NextResponse.json({ success: false, error: err.message || 'REJECTION_FAILED' }, { status });
  }
}
