// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Optimization Constraint Validation Service
// ──────────────────────────────────────────────────────────────

import { OptimizationConstraintDto, OptimizationCandidatePlanDto } from '../domain/digital-twin/optimization.domain';

export class OptimizationConstraintService {
  validatePlanConstraints(
    plan: OptimizationCandidatePlanDto,
    constraints: OptimizationConstraintDto[]
  ): { isFeasible: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const c of constraints) {
      if (c.type === 'MAX_BUDGET' && plan.estimatedCostInr > c.limitValue) {
        violations.push(`Estimated cost (₹${plan.estimatedCostInr.toLocaleString()}) exceeds budget limit (₹${c.limitValue.toLocaleString()})`);
      }
      if (c.type === 'MAX_RESPONSE_TIME' && plan.estimatedResponseTimeMinutes > c.limitValue) {
        violations.push(`Response time (${plan.estimatedResponseTimeMinutes} mins) exceeds maximum SLA limit (${c.limitValue} mins)`);
      }
    }

    return {
      isFeasible: violations.length === 0,
      violations,
    };
  }
}

export const optimizationConstraintService = new OptimizationConstraintService();
