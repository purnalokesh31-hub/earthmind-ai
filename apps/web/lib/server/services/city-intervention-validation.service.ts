// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// City Intervention Constraint & Feasibility Validation Service
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionPlanEntity,
  CityInterventionValidationStatus,
  CityInterventionConstraintDto,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export interface ValidationReportResult {
  validationStatus: CityInterventionValidationStatus;
  validationReasons: string[];
  constraints: CityInterventionConstraintDto[];
}

export class CityInterventionValidationService {
  public validatePlan(plan: CityInterventionPlanEntity): ValidationReportResult {
    const constraints: CityInterventionConstraintDto[] = [];
    const validationReasons: string[] = [];
    let isViolatedAny = false;

    const totalCostUsd = plan.actions.reduce((acc, a) => acc + a.estimatedCostUsd, 0);
    const budgetLimit = plan.budgetConstraintUsd || 15000;
    const isBudgetViolated = totalCostUsd > budgetLimit;

    constraints.push({
      constraintId: 'con-budget-1',
      type: 'MAX_BUDGET',
      limitValue: budgetLimit,
      currentValue: totalCostUsd,
      isViolated: isBudgetViolated,
      severity: isBudgetViolated ? 'CRITICAL' : 'MODERATE',
      affectedActionIds: plan.actions.map((a) => a.actionId),
      remediationSuggestion: isBudgetViolated
        ? `Reduce action scope or request budget increase ($${totalCostUsd.toLocaleString()} exceeds $${budgetLimit.toLocaleString()}).`
        : `Total action cost ($${totalCostUsd.toLocaleString()}) is within $${budgetLimit.toLocaleString()} budget limit.`,
    });

    if (isBudgetViolated) {
      isViolatedAny = true;
      validationReasons.push(`BUDGET_CONSTRAINT: Total cost $${totalCostUsd.toLocaleString()} exceeds limit $${budgetLimit.toLocaleString()}`);
    }

    const totalDuration = plan.sequence?.totalDurationHours || plan.actions.reduce((acc, a) => acc + a.estimatedDurationHours, 0);
    const maxDowntime = plan.maxDowntimeHours || 4.0;
    const isDowntimeViolated = totalDuration > maxDowntime;

    constraints.push({
      constraintId: 'con-downtime-1',
      type: 'MAX_DOWNTIME',
      limitValue: maxDowntime,
      currentValue: totalDuration,
      isViolated: isDowntimeViolated,
      severity: isDowntimeViolated ? 'CRITICAL' : 'MODERATE',
      affectedActionIds: plan.actions.map((a) => a.actionId),
      remediationSuggestion: isDowntimeViolated
        ? `Parallelize step execution to bring total duration (${totalDuration}h) below ${maxDowntime}h limit.`
        : `Total sequence duration (${totalDuration}h) is within ${maxDowntime}h downtime threshold.`,
    });

    if (isDowntimeViolated) {
      isViolatedAny = true;
      validationReasons.push(`TIME_CONSTRAINT: Total sequence duration ${totalDuration}h exceeds ${maxDowntime}h max downtime limit`);
    }

    // Dependency check
    const unresolvedDeps = plan.dependencies.filter((d) => d.status === 'CONFLICT');
    if (unresolvedDeps.length > 0) {
      isViolatedAny = true;
      validationReasons.push(`DEPENDENCY_CONFLICT: ${unresolvedDeps.length} unresolved action dependency conflict(s) detected.`);
    }

    const status: CityInterventionValidationStatus = isViolatedAny
      ? 'INVALID'
      : plan.actions.length > 0
      ? 'VALID'
      : 'REQUIRES_REVIEW';

    if (!isViolatedAny) {
      validationReasons.push(`Plan passed constraint validation checks cleanly (${plan.actions.length} actions verified).`);
    }

    logger.info(`[CityInterventionValidationService] Validated intervention plan '${plan.interventionId}': status=${status}, reasons=${validationReasons.length}`);

    return {
      validationStatus: status,
      validationReasons,
      constraints,
    };
  }
}

export const cityInterventionValidationService = new CityInterventionValidationService();
