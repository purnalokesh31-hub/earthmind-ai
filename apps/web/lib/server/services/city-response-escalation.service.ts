// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Escalation Intelligence Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessEntity,
  CityResponseEscalationDto,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseEscalationService {
  private repo = memoryCityResponseReadinessRepository;

  public evaluateEscalation(readinessId: string): CityResponseEscalationDto {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response execution readiness assessment '${readinessId}' not found.`);
    }

    const dev = entity.deviation;
    let escalationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let reason = 'Readiness and outcome telemetry within acceptable thresholds.';
    let recommendedAction = 'Continue routine human-governed monitoring.';

    if (dev) {
      if (dev.severity === 'CRITICAL' || dev.severity === 'MAJOR') {
        escalationLevel = 'CRITICAL';
        reason = `Major deviation detected: Risk reduction shortfall of ${Math.abs(dev.riskReductionDelta)} points and recovery delay of ${dev.serviceRecoveryDeltaMinutes}m.`;
        recommendedAction = 'Immediate operator review required: Authorize secondary auxiliary response or protocol revision.';
      } else if (dev.severity === 'MODERATE') {
        escalationLevel = 'HIGH';
        reason = `Moderate outcome deviation detected: Service recovery delayed by ${dev.serviceRecoveryDeltaMinutes} minutes.`;
        recommendedAction = 'Operator review required for auxiliary pump deployment.';
      } else if (dev.severity === 'MINOR') {
        escalationLevel = 'MEDIUM';
        reason = 'Minor outcome variation observed across utility metrics.';
        recommendedAction = 'Operator advisory log recorded.';
      }
    } else if (entity.blockingReasons.length > 0) {
      escalationLevel = 'HIGH';
      reason = `Execution readiness blocked by ${entity.blockingReasons.join(', ')}.`;
      recommendedAction = 'Human operator intervention required to resolve telemetry or resource blockages.';
    }

    const escalation: CityResponseEscalationDto = {
      escalationId: `esc-${readinessId}`,
      readinessId,
      escalationLevel,
      reason,
      recommendedAction,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      timestamp: new Date().toISOString(),
    };

    entity.escalation = escalation;
    if (escalationLevel === 'HIGH' || escalationLevel === 'CRITICAL') {
      entity.status = 'ESCALATION_RECOMMENDED';
    }
    entity.updatedAt = new Date().toISOString();

    logger.info(`[CityResponseEscalationService] Evaluated escalation for assessment '${readinessId}': Level ${escalationLevel}`);
    return escalation;
  }
}

export const cityResponseEscalationService = new CityResponseEscalationService();
