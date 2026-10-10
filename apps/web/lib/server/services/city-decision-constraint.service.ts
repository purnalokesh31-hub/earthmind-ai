// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Decision Constraint Service
// Evaluates Hard & Soft Operational Constraints on Action Candidates
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionCandidateDto,
  CityDecisionConstraintDto,
  DecisionFeasibilityStatus,
} from '../domain/digital-twin/city-decision-fusion.domain';
import { logger } from '../logger';

export class CityDecisionConstraintService {
  evaluateConstraints(candidate: CityDecisionCandidateDto): {
    constraints: CityDecisionConstraintDto[];
    feasibilityStatus: DecisionFeasibilityStatus;
  } {
    const constraints: CityDecisionConstraintDto[] = [
      {
        constraintName: 'MAX_BUDGET',
        constraintType: 'HARD',
        limitValue: 15000,
        actualValue: candidate.estimatedCostUsd,
        unit: 'USD',
        isSatisfied: candidate.estimatedCostUsd <= 15000,
        severity: 'CRITICAL',
      },
      {
        constraintName: 'MAX_DOWNTIME',
        constraintType: 'HARD',
        limitValue: 4.0,
        actualValue: candidate.estimatedDurationHours,
        unit: 'hours',
        isSatisfied: candidate.estimatedDurationHours <= 4.0,
        severity: 'CRITICAL',
      },
      {
        constraintName: 'PREFERRED_CREW_LIMIT',
        constraintType: 'SOFT',
        limitValue: 4,
        actualValue: candidate.requiredResources.length,
        unit: 'crews',
        isSatisfied: candidate.requiredResources.length <= 4,
        severity: 'WARNING',
      },
    ];

    const hardViolations = constraints.filter((c) => c.constraintType === 'HARD' && !c.isSatisfied);
    const softViolations = constraints.filter((c) => c.constraintType === 'SOFT' && !c.isSatisfied);

    let feasibilityStatus: DecisionFeasibilityStatus = 'FEASIBLE';
    if (hardViolations.length > 0) {
      feasibilityStatus = 'INFEASIBLE';
    } else if (softViolations.length > 0) {
      feasibilityStatus = 'CONDITIONALLY_FEASIBLE';
    }

    logger.info(`[CityDecisionConstraintService] Candidate '${candidate.candidateId}' evaluated as ${feasibilityStatus}`);
    return { constraints, feasibilityStatus };
  }
}

export const cityDecisionConstraintService = new CityDecisionConstraintService();
