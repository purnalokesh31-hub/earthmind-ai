// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// City Command Case Escalation Workflow Service
// ──────────────────────────────────────────────────────────────

import {
  CityCommandEscalationDto,
  CityCommandCaseEntity,
} from '../domain/digital-twin/city-command.domain';
import { GovernanceAuthorizationLevel } from '../domain/digital-twin/city-governance.domain';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { logger } from '../logger';

export interface EscalateCaseInput {
  caseId: string;
  requestedBy: string;
  targetAuthorizationLevel: GovernanceAuthorizationLevel;
  reason: string;
  triggeringPolicies?: string[];
}

export class CityCommandEscalationService {
  private repo = memoryCityCommandRepository;

  public escalateCase(input: EscalateCaseInput): { caseEntity: CityCommandCaseEntity; escalation: CityCommandEscalationDto } {
    const caseEntity = this.repo.getCase(input.caseId);
    if (!caseEntity) {
      throw new Error(`Command case '${input.caseId}' not found.`);
    }

    const escalationId = `esc-cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const escalation: CityCommandEscalationDto = {
      escalationId,
      caseId: input.caseId,
      fromAuthorizationLevel: caseEntity.requiredAuthorizationLevel,
      toAuthorizationLevel: input.targetAuthorizationLevel,
      reason: input.reason,
      triggeringPolicies: input.triggeringPolicies || ['pol-gov-risk-tiering'],
      requestedBy: input.requestedBy,
      timestamp: now,
      status: 'PENDING',
      requiresHumanApproval: true,
    };

    caseEntity.requiredAuthorizationLevel = input.targetAuthorizationLevel;
    this.repo.recordEscalation(escalation);
    this.repo.updateCaseStatus(input.caseId, 'ESCALATED', input.requestedBy, input.reason);

    logger.info(`[CityCommandEscalationService] Escalated case '${input.caseId}' to ${input.targetAuthorizationLevel}`);
    return { caseEntity, escalation };
  }
}

export const cityCommandEscalationService = new CityCommandEscalationService();
