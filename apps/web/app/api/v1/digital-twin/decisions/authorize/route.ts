// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Decision Human Authorization API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';
import { logger } from '@/lib/server/logger';

const SUPPORTED_DECISIONS = new Set(['APPROVED', 'REJECTED', 'REQUEST_REVIEW', 'REQUESTED_REVIEW']);

export async function POST(req: NextRequest) {
  try {
    // Recording a human authorization decision is a high-risk action — requires COMMANDER or above.
    const userContext = await commanderOnly(req);

    const body = await req.json();
    const { pipelineExecutionId, decision, reason, strategyId, candidateId } = body;

    if (!pipelineExecutionId || !decision) {
      return NextResponse.json(
        { error: 'Missing required parameters: pipelineExecutionId and decision are mandatory.' },
        { status: 400 }
      );
    }

    const rawDecision = String(decision).toUpperCase().trim();
    if (!SUPPORTED_DECISIONS.has(rawDecision)) {
      return NextResponse.json(
        { error: `INVALID_DECISION: decision must be one of APPROVED, REJECTED, REQUESTED_REVIEW. Received '${decision}'.` },
        { status: 400 }
      );
    }

    const normalizedDecision: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW' =
      rawDecision === 'REQUEST_REVIEW' || rawDecision === 'REQUESTED_REVIEW'
        ? 'REQUESTED_REVIEW'
        : (rawDecision as 'APPROVED' | 'REJECTED');

    const result = await cityDecisionOrchestratorService.approveDecision(
      pipelineExecutionId,
      normalizedDecision,
      userContext.email,
      userContext.role,
      reason || `Human operator recorded action '${normalizedDecision}'`,
      userContext.userId
    );

    const auditEvent = {
      auditId: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      decisionId: pipelineExecutionId,
      strategyId: strategyId || undefined,
      candidateId: candidateId || undefined,
      decision: normalizedDecision,
      operatorIdentity: {
        userId: userContext.userId,
        email: userContext.email,
        role: userContext.role,
      },
      reason: reason || `Human operator recorded action '${normalizedDecision}'`,
      auditEvent: `HUMAN_AUTHORIZATION_${normalizedDecision}`,
    };

    logger.info(`[HumanAuthorizationAPI] Registered decision '${normalizedDecision}' for pipeline '${pipelineExecutionId}' by '${userContext.userId}'.`);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        approvalStatus: normalizedDecision,
        status: normalizedDecision,
        strategyId: strategyId || result?.strategyId,
        candidateId: candidateId || result?.selectedCandidateId,
      },
      auditRecord: auditEvent,
      requiresHumanApproval: true,
      message: `Operational decision successfully recorded: ${normalizedDecision}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record human authorization decision' },
      { status: error.statusCode || 400 }
    );
  }
}
