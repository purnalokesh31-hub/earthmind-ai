import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityCommandEscalationService } from '@/lib/server/services/city-command-escalation.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.targetAuthorizationLevel || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT: targetAuthorizationLevel and reason are required.' },
        { status: 400 }
      );
    }

    const result = cityCommandEscalationService.escalateCase({
      caseId: id,
      requestedBy: auth.userId,
      targetAuthorizationLevel: body.targetAuthorizationLevel,
      reason: body.reason,
      triggeringPolicies: body.triggeringPolicies,
    });

    return NextResponse.json({
      success: true,
      data: result.escalation,
      case: result.caseEntity,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'ESCALATION_FAILED' }, { status: 400 });
  }
}
