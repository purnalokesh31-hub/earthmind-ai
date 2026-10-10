// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 3/6)
// City Response Accountability Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessStatus,
  CityResponseReadinessAccountabilityDto,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseAccountabilityService {
  private repo = memoryCityResponseReadinessRepository;

  private validTransitions: Partial<Record<CityResponseReadinessStatus, CityResponseReadinessStatus[]>> = {
    DRAFT: ['ANALYZING', 'READY_FOR_REVIEW', 'CANCELLED'],
    ANALYZING: ['READY_FOR_REVIEW', 'REJECTED', 'CANCELLED'],
    READY_FOR_REVIEW: ['AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'],
    AWAITING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['HANDOFF_READY', 'CANCELLED'],
    HANDOFF_READY: ['HANDED_OFF', 'PAUSED', 'CANCELLED'],
    HANDED_OFF: ['IN_PROGRESS', 'PAUSED', 'CANCELLED'],
    IN_PROGRESS: ['PAUSED', 'COMPLETED', 'OUTCOME_PENDING', 'CANCELLED'],
    PAUSED: ['IN_PROGRESS', 'CANCELLED'],
    COMPLETED: ['OUTCOME_PENDING', 'VALIDATED'],
    OUTCOME_PENDING: ['VALIDATED', 'ARCHIVED'],
    VALIDATED: ['ARCHIVED'],
    REJECTED: ['ARCHIVED'],
    CANCELLED: ['ARCHIVED'],
    ARCHIVED: [],
  };

  public validateStateTransition(
    readinessId: string,
    targetState: CityResponseReadinessStatus,
    userId: string,
    operatorNotes?: string
  ): CityResponseReadinessAccountabilityDto {
    if (!userId || userId.trim().length === 0) {
      throw new Error('MISSING_AUDIT_CONTEXT: User ID and operator context are required for state transitions.');
    }

    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response readiness assessment '${readinessId}' not found.`);
    }

    const currentState = entity.status;

    // Terminal state protection
    if (['COMPLETED', 'VALIDATED', 'REJECTED', 'CANCELLED', 'ARCHIVED'].includes(currentState) && ['APPROVED', 'REJECTED'].includes(targetState)) {
      throw new Error(`RESPONSE_READINESS_ALREADY_DECIDED: Readiness '${readinessId}' is in terminal state '${currentState}' and cannot be modified.`);
    }

    // Check valid transitions
    const allowed = this.validTransitions[currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new Error(`INVALID_READINESS_TRANSITION: Transition from '${currentState}' to '${targetState}' is not allowed for readiness '${readinessId}'.`);
    }

    // Duplicate handoff check
    if (currentState === 'HANDED_OFF' && targetState === 'HANDED_OFF') {
      throw new Error(`HANDOFF_ALREADY_COMPLETED: Operational handoff for readiness '${readinessId}' is already completed.`);
    }

    const updated = this.repo.updateStatus(readinessId, targetState, userId, operatorNotes);
    const history = this.repo.getHistory(readinessId);
    const lastEvent = history[history.length - 1];

    logger.info(`[CityResponseAccountabilityService] State transition validated: '${readinessId}' ${currentState} -> ${targetState} by '${userId}'`);
    return lastEvent;
  }
}

export const cityResponseAccountabilityService = new CityResponseAccountabilityService();
