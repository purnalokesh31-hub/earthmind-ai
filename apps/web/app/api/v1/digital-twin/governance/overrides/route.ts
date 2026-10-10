import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { memoryCityGovernanceRepository } from '@/lib/server/repositories/city-governance.repository';
import { cityGovernanceAuthorizationService } from '@/lib/server/services/city-governance-authorization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Recording a policy override is a high-risk action — requires COMMANDER or above.
    const auth = await commanderOnly(req);

    const body = await req.json();
    if (!body.policyId || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT: policyId and operational reason are required.' },
        { status: 400 }
      );
    }

    const overrideId = `ovr-gov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();

    const override = memoryCityGovernanceRepository.recordOverride({
      overrideId,
      policyId: body.policyId,
      evaluationId: body.evaluationId || 'eval-default-1',
      operatorUserId: auth.userId,
      // Derived from the authenticated operator's real role — never trust a client-supplied
      // authorizationLevel for an audit field that records who authorized the override.
      authorizationLevel: cityGovernanceAuthorizationService.mapRoleToAuthorizationLevel(auth.role),
      reason: body.reason,
      timestamp: now.toISOString(),
      expiresAt,
      auditReference: `audit-ovr-${Date.now()}`,
      requiresHumanApproval: true,
    });

    return NextResponse.json({
      success: true,
      data: override,
      requiresHumanApproval: true,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
