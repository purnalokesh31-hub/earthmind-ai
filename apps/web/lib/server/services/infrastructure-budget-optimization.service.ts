// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Infrastructure Budget Optimization Service
// ──────────────────────────────────────────────────────────────

import { OptimizationCandidatePlanDto } from '../domain/digital-twin/optimization.domain';

export class InfrastructureBudgetOptimizationService {
  generateBudgetPlans(totalBudgetInr: number): OptimizationCandidatePlanDto[] {
    return [
      {
        planId: 'plan-a-min-cost',
        title: 'Plan A — Low Cost Local Mitigation',
        strategyName: 'MINIMUM_COST',
        normalizedScore: 72.0,
        riskReductionPercent: 61.0,
        estimatedCostInr: Math.min(350000, totalBudgetInr),
        estimatedResponseTimeMinutes: 18,
        resourceUtilizationPercent: 52.0,
        feasibilityStatus: 'FEASIBLE',
        advantages: ['Lowest expenditure', 'Preserves 75% of emergency budget reserve'],
        disadvantages: ['Lower risk reduction benefit (61%)'],
        maintenancePlans: [],
        resourceAllocations: [],
      },
      {
        planId: 'plan-b-balanced',
        title: 'Plan B — Balanced Multi-Objective Risk Reduction',
        strategyName: 'BALANCED_RISK_REDUCTION',
        normalizedScore: 84.0,
        riskReductionPercent: 79.0,
        estimatedCostInr: Math.min(850000, totalBudgetInr),
        estimatedResponseTimeMinutes: 12,
        resourceUtilizationPercent: 78.0,
        feasibilityStatus: 'FEASIBLE',
        advantages: ['Highest composite score (84)', '79% risk reduction', 'Response latency < 15m'],
        disadvantages: ['Requires cross-city team coordination'],
        maintenancePlans: [],
        resourceAllocations: [],
      },
      {
        planId: 'plan-c-max-risk-red',
        title: 'Plan C — Maximum Risk Suppression',
        strategyName: 'MAXIMUM_RISK_SUPPRESSION',
        normalizedScore: 77.0,
        riskReductionPercent: 91.0,
        estimatedCostInr: Math.min(1450000, totalBudgetInr),
        estimatedResponseTimeMinutes: 9,
        resourceUtilizationPercent: 94.0,
        feasibilityStatus: totalBudgetInr >= 1450000 ? 'FEASIBLE' : 'INFEASIBLE',
        advantages: ['Near-complete risk elimination (91%)'],
        disadvantages: ['High capital cost', 'Consumes 94% of responder capacity'],
        maintenancePlans: [],
        resourceAllocations: [],
      },
    ];
  }
}

export const infrastructureBudgetOptimizationService = new InfrastructureBudgetOptimizationService();
