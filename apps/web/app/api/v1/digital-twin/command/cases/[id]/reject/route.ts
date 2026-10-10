import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { cityCommandDecisionService } from '@/lib/server/services/city-command-decision.service';
import { cityGovernanceAuthorizationService } from '@/lib/server/services/city-governance-authorization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rejecting a command case is a high-risk governance action — requires COMMANDER or above.
    const auth = await commanderOnly(req);

    const { id } = await params;
    const body = await req.json();

    if (!body.reason) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT: Mandatory reason required for REJECT decision.' }, { status: 400 });
    }

    const operatorRole = auth.role;

    const result = cityCommandDecisionService.processOperatorDecision(
      {
        userId: auth.userId,
        userName: auth.userId,
        role: operatorRole,
        authorizationLevel: cityGovernanceAuthorizationService.mapRoleToAuthorizationLevel(operatorRole),
      },
      {
        caseId: id,
        decision: 'REJECT',
        reason: body.reason,
        operatorNotes: body.operatorNotes,
      }
    );

    return NextResponse.json({
      success: true,
      data: result.decision,
      case: result.caseEntity,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      authorizationStatus: 'REJECTED_BY_HUMAN_OPERATOR',
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    if (err.statusCode) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const isConflict = err.message?.includes('COMMAND_CASE_ALREADY_DECIDED');
    const isForbidden = err.message?.includes('AUTHORIZATION_LEVEL_INSUFFICIENT');
    const status = isConflict ? 409 : isForbidden ? 403 : 400;

    return NextResponse.json({ success: false, error: err.message || 'REJECTION_FAILED' }, { status });
  }
}
