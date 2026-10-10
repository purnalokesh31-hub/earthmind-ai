// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Optimization Constraint Service
// ──────────────────────────────────────────────────────────────

import { UtilityOptimizationConstraintDto, FeasibilityStatus } from '../domain/digital-twin/utility-optimization.domain';

export class UtilityOptimizationConstraintService {
  evaluateFeasibility(
    costUsd: number,
    downtimeHours: number,
    populationImpact: number,
    crewCount: number,
    equipmentCount: number,
    constraints: UtilityOptimizationConstraintDto
  ): { feasibility: FeasibilityStatus; notes: string[] } {
    const notes: string[] = [];
    let isFeasible = true;

    if (costUsd > constraints.maxBudgetUsd) {
      isFeasible = false;
      notes.push(`Cost $${costUsd} exceeds max budget limit $${constraints.maxBudgetUsd}`);
    }
    if (downtimeHours > constraints.maxDowntimeHours) {
      isFeasible = false;
      notes.push(`Downtime ${downtimeHours}h exceeds max downtime limit ${constraints.maxDowntimeHours}h`);
    }
    if (populationImpact > constraints.maxPopulationImpact) {
      isFeasible = false;
      notes.push(`Population impact ${populationImpact} exceeds max limit ${constraints.maxPopulationImpact}`);
    }
    if (crewCount > constraints.maxCrewUsageCount) {
      isFeasible = false;
      notes.push(`Crew count ${crewCount} exceeds max crew limit ${constraints.maxCrewUsageCount}`);
    }

    if (isFeasible) {
      notes.push('All hard operational constraints satisfied.');
    }

    return {
      feasibility: isFeasible ? 'FEASIBLE' : 'INFEASIBLE',
      notes,
    };
  }
}

export const utilityOptimizationConstraintService = new UtilityOptimizationConstraintService();
