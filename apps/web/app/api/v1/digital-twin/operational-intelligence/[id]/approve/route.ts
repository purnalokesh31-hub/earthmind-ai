import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResponseReadinessRepository } from '@/lib/server/repositories/city-response-readiness.repository';

export const dynamic = 'force-dynamic';

const decisionTracker = new Map<string, string>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (decisionTracker.has(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'OPERATIONAL_DECISION_ALREADY_DECIDED',
          message: `Decision for operational intelligence '${id}' has already been recorded.`,
        },
        { status: 409 }
      );
    }

    decisionTracker.set(id, 'APPROVED');

    const approval = memoryCityResponseReadinessRepository.saveApproval({
      approvalId: `appr-op-${Date.now()}`,
      readinessId: id,
      interventionId: id,
      userId: auth.userId,
      userRole: auth.role,
      decision: 'APPROVED',
      operatorNotes: body.operatorNotes || 'Approved by human operator via Command Center',
      timestamp: new Date().toISOString(),
      requiresHumanApproval: true,
    });

    return NextResponse.json({
      success: true,
      data: approval,
      message: `Operational intelligence '${id}' APPROVED by human operator '${auth.userId}'.`,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'OPERATOR_INPUT',
    });
  } catch (err: any) {
    if (err.message?.includes('RESILIENCE_DECISION_ALREADY_DECIDED') || err.message?.includes('OPERATIONAL_DECISION_ALREADY_DECIDED')) {
      return NextResponse.json({ success: false, error: 'OPERATIONAL_DECISION_ALREADY_DECIDED' }, { status: 409 });
    }
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
