import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { cityCommandDecisionService } from '@/lib/server/services/city-command-decision.service';
import { cityGovernanceAuthorizationService } from '@/lib/server/services/city-governance-authorization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Approving a command case is a high-risk governance action — requires COMMANDER or above,
    // not merely any authenticated account.
    const auth = await commanderOnly(req);

    const { id } = await params;
    const body = await req.json();

    const operatorRole = auth.role;
    const operatorLevel = cityGovernanceAuthorizationService.mapRoleToAuthorizationLevel(operatorRole);

    const result = cityCommandDecisionService.processOperatorDecision(
      {
        userId: auth.userId,
        userName: auth.userId,
        role: operatorRole,
        authorizationLevel: operatorLevel,
      },
      {
        caseId: id,
        decision: 'APPROVE',
        reason: body.reason || 'Human operator approved decision plan.',
        operatorNotes: body.operatorNotes,
        evidenceReferences: body.evidenceReferences,
        confirmationToken: body.confirmationToken,
      }
    );

    return NextResponse.json({
      success: true,
      data: result.decision,
      case: result.caseEntity,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      authorizationStatus: 'APPROVED_BY_HUMAN_OPERATOR',
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    if (err.statusCode) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const isConflict = err.message?.includes('COMMAND_CASE_ALREADY_DECIDED');
    const isForbidden = err.message?.includes('AUTHORIZATION_LEVEL_INSUFFICIENT');
    const status = isConflict ? 409 : isForbidden ? 403 : 400;

    return NextResponse.json({ success: false, error: err.message || 'APPROVAL_FAILED' }, { status });
  }
}
