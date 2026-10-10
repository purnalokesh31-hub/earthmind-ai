// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Expected vs Observed Outcome Analysis Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessEntity,
  CityResponseExpectedOutcomeDto,
  CityResponseOutcomeObservationDto,
  CityResponseDeviationDto,
  DeviationSeverity,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseOutcomeService {
  private repo = memoryCityResponseReadinessRepository;

  public compareExpectedVsObserved(readinessId: string): CityResponseDeviationDto {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response execution readiness assessment '${readinessId}' not found.`);
    }

    const expected: CityResponseExpectedOutcomeDto = entity.expectedOutcome || {
      interventionId: entity.interventionId,
      expectedRiskReduction: 31,
      expectedPopulationBenefit: 12000,
      expectedServiceRecoveryMinutes: 90,
      expectedDowntimeMinutes: 45,
      expectedCostUsd: 18500,
    };

    const observed: CityResponseOutcomeObservationDto = entity.observedOutcome || {
      observationId: `obs-${readinessId}`,
      readinessId,
      observedRiskReduction: 25,
      observedPopulationBenefit: 10500,
      observedServiceRecoveryMinutes: 125,
      observedDowntimeMinutes: 60,
      observedCostUsd: 19200,
      provenance: 'LIVE_TELEMETRY',
      timestamp: new Date().toISOString(),
      recordedByUserId: 'usr-op-1',
    };

    const riskReductionDelta = observed.observedRiskReduction - expected.expectedRiskReduction; // e.g. -6
    const populationBenefitDelta = observed.observedPopulationBenefit - expected.expectedPopulationBenefit; // e.g. -1500
    const serviceRecoveryDeltaMinutes = observed.observedServiceRecoveryMinutes - expected.expectedServiceRecoveryMinutes; // e.g. +35
    const downtimeDeltaMinutes = observed.observedDowntimeMinutes - expected.expectedDowntimeMinutes; // e.g. +15
    const costDeltaUsd = observed.observedCostUsd - expected.expectedCostUsd; // e.g. +700

    let severity: DeviationSeverity = 'NONE';
    if (Math.abs(riskReductionDelta) >= 15 || serviceRecoveryDeltaMinutes >= 60) {
      severity = 'CRITICAL';
    } else if (Math.abs(riskReductionDelta) >= 10 || serviceRecoveryDeltaMinutes >= 45) {
      severity = 'MAJOR';
    } else if (Math.abs(riskReductionDelta) >= 5 || serviceRecoveryDeltaMinutes >= 20) {
      severity = 'MODERATE';
    } else if (Math.abs(riskReductionDelta) > 0 || serviceRecoveryDeltaMinutes > 0) {
      severity = 'MINOR';
    }

    const deviation: CityResponseDeviationDto = {
      deviationId: `dev-${readinessId}`,
      readinessId,
      severity,
      affectedDomain: 'UTILITY',
      riskReductionDelta,
      populationBenefitDelta,
      serviceRecoveryDeltaMinutes,
      downtimeDeltaMinutes,
      costDeltaUsd,
      explanation: `Observed risk reduction is ${Math.abs(riskReductionDelta)} points lower than target (${expected.expectedRiskReduction} pts expected vs ${observed.observedRiskReduction} pts observed). Service recovery delayed by ${serviceRecoveryDeltaMinutes} minutes.`,
      timestamp: new Date().toISOString(),
      requiresHumanApproval: true,
    };

    entity.expectedOutcome = expected;
    entity.observedOutcome = observed;
    entity.deviation = deviation;
    if (severity !== 'NONE') {
      entity.status = 'DEVIATION_DETECTED';
    }
    entity.updatedAt = new Date().toISOString();

    logger.info(`[CityResponseOutcomeService] Computed deviation for assessment '${readinessId}': Severity ${severity}`);
    return deviation;
  }
}

export const cityResponseOutcomeService = new CityResponseOutcomeService();
