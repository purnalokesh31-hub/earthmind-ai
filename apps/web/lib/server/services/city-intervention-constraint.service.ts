// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Citywide Intervention Constraint Service
// Hard operational constraint evaluation engine (budget, response time, exposure, crews, resources)
// Safety Guarantee: Read-only decision support; never mutates live city state or executes actions
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionOptionDto,
  CityInterventionConstraintDto,
  ConstraintType,
  ConstraintEvaluationStatus,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export interface EvaluatedConstraintResult {
  constraint: CityInterventionConstraintDto;
  actualValue: number;
  status: ConstraintEvaluationStatus;
}

export class CityInterventionConstraintService {
  /**
   * Evaluates hard operational constraints against intervention candidate options.
   *
   * Threshold rules:
   *  - < 80% of limitValue => PASS
   *  - 80% to 100% of limitValue => WARNING
   *  - > 100% of limitValue => VIOLATION
   */
  evaluateConstraints(
    options: CityInterventionOptionDto[],
    constraints: CityInterventionConstraintDto[]
  ): {
    evaluatedOptions: CityInterventionOptionDto[];
    evaluatedConstraints: CityInterventionConstraintDto[];
  } {
    if (!constraints || constraints.length === 0) {
      logger.info('[CityInterventionConstraintService] No constraints configured; marking all candidates PASS');
      return {
        evaluatedOptions: options.map((opt) => ({
          ...opt,
          constraintStatus: 'PASS',
          feasibility: Math.max(opt.feasibility, 90.0),
        })),
        evaluatedConstraints: [],
      };
    }

    const updatedConstraints: CityInterventionConstraintDto[] = [...constraints];

    const evaluatedOptions = options.map((option) => {
      let optionWorstStatus: ConstraintEvaluationStatus = 'PASS';

      for (const constraint of constraints) {
        const constraintType = constraint.constraintType || (constraint.type as ConstraintType) || 'MAX_BUDGET';
        const actual = this.extractActualValue(option, constraintType);
        const status = this.determineConstraintStatus(actual, constraint.limitValue);

        // Update constraint object actual value
        constraint.actualValue = actual;
        constraint.status = status;

        if (status === 'VIOLATION') {
          optionWorstStatus = 'VIOLATION';
        } else if (status === 'WARNING' && optionWorstStatus !== 'VIOLATION') {
          optionWorstStatus = 'WARNING';
        }
      }

      // Compute feasibility score: if VIOLATION, feasibility is 0 (INFEASIBLE), else retain or compute feasibility score
      const isFeasible = optionWorstStatus !== 'VIOLATION';
      const calculatedFeasibility = isFeasible
        ? optionWorstStatus === 'WARNING'
          ? Math.min(option.feasibility, 75.0)
          : Math.max(option.feasibility, 90.0)
        : 0.0;

      return {
        ...option,
        constraintStatus: optionWorstStatus,
        feasibility: calculatedFeasibility,
      };
    });

    logger.info(
      `[CityInterventionConstraintService] Evaluated ${constraints.length} constraints across ${options.length} candidates. Feasible count: ${evaluatedOptions.filter((o) => o.constraintStatus !== 'VIOLATION').length}`
    );

    return {
      evaluatedOptions,
      evaluatedConstraints: updatedConstraints,
    };
  }

  private extractActualValue(candidate: CityInterventionOptionDto, constraintType: ConstraintType): number {
    switch (constraintType) {
      case 'MAX_BUDGET':
        return candidate.estimatedCost;
      case 'MAX_RESPONSE_TIME':
        return candidate.estimatedResponseTime;
      case 'MAX_POPULATION_EXPOSURE':
        // Exposed population remaining: e.g. 50000 baseline - populationProtected
        return Math.max(0, 50000 - candidate.populationProtected);
      case 'MAX_CREW_REQUIREMENT':
      case 'MAX_RESOURCE_REQUIREMENT':
        return candidate.resourceRequirement;
      default:
        return candidate.resourceRequirement;
    }
  }

  private determineConstraintStatus(actual: number, limit: number): ConstraintEvaluationStatus {
    if (limit <= 0) return 'PASS';
    const ratio = actual / limit;
    if (ratio > 1.0) {
      return 'VIOLATION';
    }
    if (ratio >= 0.8) {
      return 'WARNING';
    }
    return 'PASS';
  }
}

export const cityInterventionConstraintService = new CityInterventionConstraintService();
