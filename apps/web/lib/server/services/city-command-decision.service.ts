// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// Master Human Command Decision Engine Service
// Mandatory Human Governance & Operator Authorization Validation
// ──────────────────────────────────────────────────────────────

import {
  CityCommandApprovalRequestDto,
  CityCommandApprovalDecisionDto,
  CityCommandCaseEntity,
  CityCommandOperatorDto,
  CityCommandCaseStatus,
} from '../domain/digital-twin/city-command.domain';
import { GovernanceAuthorizationLevel } from '../domain/digital-twin/city-governance.domain';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { cityGovernanceAuthorizationService } from './city-governance-authorization.service';
import { logger } from '../logger';

export interface ProcessDecisionResult {
  caseEntity: CityCommandCaseEntity;
  decision: CityCommandApprovalDecisionDto;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}

export class CityCommandDecisionService {
  private repo = memoryCityCommandRepository;
  private authService = cityGovernanceAuthorizationService;
  private consumedTokens = new Set<string>();

  public resetConsumedTokens(): void {
    this.consumedTokens.clear();
  }

  public isTokenConsumed(token: string): boolean {
    return this.consumedTokens.has(token);
  }

  public processOperatorDecision(
    operator: CityCommandOperatorDto,
    request: CityCommandApprovalRequestDto
  ): ProcessDecisionResult {
    // 1. Retrieve Command Case
    const caseEntity = this.repo.getCase(request.caseId);
    if (!caseEntity) {
      throw new Error(`Command case '${request.caseId}' not found.`);
    }

    // 2. Duplicate Decision & Terminal State Protection
    const terminalStates: CityCommandCaseStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'ARCHIVED'];
    if (terminalStates.includes(caseEntity.status)) {
      throw new Error(
        `COMMAND_CASE_ALREADY_DECIDED: Case '${request.caseId}' is already in terminal decision state '${caseEntity.status}' and cannot be modified.`
      );
    }

    // 3. Operator Role & Authorization Level Verification
    const authCheck = this.authService.validateUserAuthorization(
      operator.role,
      caseEntity.requiredAuthorizationLevel
    );

    if (!authCheck.isAuthorized) {
      throw new Error(
        `AUTHORIZATION_LEVEL_INSUFFICIENT: Operator '${operator.userId}' (${operator.role}) lacks required authorization level '${caseEntity.requiredAuthorizationLevel}' for case '${request.caseId}'.`
      );
    }

    // 4. Strict Confirmation Token Validation for APPROVE Decision
    if (request.decision === 'APPROVE') {
      if (!request.confirmationToken || typeof request.confirmationToken !== 'string' || request.confirmationToken.trim().length === 0) {
        throw new Error(`MISSING_CONFIRMATION_TOKEN: Explicit confirmation token is required for APPROVE decision.`);
      }

      const trimmedToken = request.confirmationToken.trim();

      if (trimmedToken.length < 6 || trimmedToken.toLowerCase() === 'invalid' || trimmedToken.toLowerCase() === 'null') {
        throw new Error(`INVALID_CONFIRMATION_TOKEN: Confirmation token '${trimmedToken}' is invalid or malformed.`);
      }

      if (this.consumedTokens.has(trimmedToken)) {
        throw new Error(`CONFIRMATION_TOKEN_REUSED: Confirmation token '${trimmedToken}' has already been consumed and cannot be reused.`);
      }

      // Consume token to prevent replay/reuse attacks
      this.consumedTokens.add(trimmedToken);
    }

    // 5. Reason Requirement Validation
    if (!request.reason || request.reason.trim().length === 0) {
      throw new Error(`MISSING_DECISION_REASON: Mandatory operational reason is required for '${request.decision}'.`);
    }

    const now = new Date().toISOString();
    const decisionId = `dec-cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 6. Record Decision Entity
    const decisionDto: CityCommandApprovalDecisionDto = {
      decisionId,
      caseId: request.caseId,
      decision: request.decision,
      operator,
      reason: request.reason,
      operatorNotes: request.operatorNotes,
      evidenceReferences: request.evidenceReferences,
      confirmationToken: request.confirmationToken,
      decidedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    };

    // 7. Update Case Status Map
    let nextStatus: CityCommandCaseStatus = 'UNDER_REVIEW';
    if (request.decision === 'APPROVE') nextStatus = 'APPROVED';
    else if (request.decision === 'REJECT') nextStatus = 'REJECTED';
    else if (request.decision === 'REQUEST_MORE_EVIDENCE') nextStatus = 'EVIDENCE_REQUESTED';
    else if (request.decision === 'ESCALATE') nextStatus = 'ESCALATED';
    else if (request.decision === 'CANCEL') nextStatus = 'CANCELLED';

    this.repo.recordDecision(decisionDto);
    this.repo.updateCaseStatus(request.caseId, nextStatus, operator.userId, request.reason);

    logger.info(`[CityCommandDecisionService] Processed '${request.decision}' for case '${request.caseId}' by '${operator.userId}' (${operator.role}). Next status: ${nextStatus}.`);

    return {
      caseEntity,
      decision: decisionDto,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    };
  }
}

export const cityCommandDecisionService = new CityCommandDecisionService();
