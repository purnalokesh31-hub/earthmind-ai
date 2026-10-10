// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 POST Approve/Reject Decision API Route
// Mandatory Human Authorization Endpoint
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';

export const dynamic = 'force-dynamic';

const SUPPORTED_DECISIONS = new Set(['APPROVED', 'REJECTED', 'REQUEST_REVIEW', 'REQUESTED_REVIEW']);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Approving/rejecting a decision is a high-risk action — requires COMMANDER or above.
    const authContext = await commanderOnly(req);
    const resolvedParams = await params;
    const id = resolvedParams.id;

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const rawDecision = String(body.decisionStatus || body.decision || '').toUpperCase().trim();
    if (!SUPPORTED_DECISIONS.has(rawDecision)) {
      return NextResponse.json(
        {
          error: `INVALID_DECISION: decision must be one of APPROVED, REJECTED, REQUESTED_REVIEW. Received '${body.decisionStatus || body.decision || ''}'.`,
        },
        { status: 400 }
      );
    }
    const decision: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW' =
      rawDecision === 'REQUEST_REVIEW' || rawDecision === 'REQUESTED_REVIEW'
        ? 'REQUESTED_REVIEW'
        : (rawDecision as 'APPROVED' | 'REJECTED');

    // Operator identity/role always come from the authenticated session, never the request body.
    const operatorName = authContext.email || 'Municipal Operations Officer';
    const operatorRole = authContext.role;
    const reason = body.justification || body.reason || body.notes || `Authorized action '${decision}' through Command Center UI`;
    const strategyId = body.strategyId;
    const candidateId = body.candidateId || body.selectedOptionId;

    const result = await cityDecisionOrchestratorService.approveDecision(
      id,
      decision,
      operatorName,
      operatorRole,
      reason,
      authContext.userId
    );

    const auditRecord = {
      auditId: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      decisionId: id,
      strategyId,
      candidateId,
      action: decision,
      operatorIdentity: {
        userId: authContext.userId,
        email: authContext.email,
        role: authContext.role,
      },
      reason,
      timestamp: new Date().toISOString(),
      auditEvent: `HUMAN_AUTHORIZATION_${decision}`,
    };

    const responseData = {
      ...(result?.decisionContext || result || {}),
      pipelineExecutionId: id,
      approvalStatus: decision,
      status: decision,
      strategyId: strategyId || result?.strategyId,
      candidateId: candidateId || result?.selectedCandidateId,
      requiresHumanApproval: true,
      operatorName,
      justification: reason,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      auditRecord,
      message: `Decision scenario '${id}' successfully recorded as ${decision} by authorized human operator.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to authorize decision recommendation' },
      { status: err.statusCode || 400 }
    );
  }
}
