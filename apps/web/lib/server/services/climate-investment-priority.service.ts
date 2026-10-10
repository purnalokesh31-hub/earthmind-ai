// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Climate Investment Prioritization Service
// ──────────────────────────────────────────────────────────────

import { ClimateInvestmentPriorityDto } from '../domain/digital-twin/climate-resilience.domain';
import { memoryClimateResilienceRepository } from '../repositories/climate-resilience.repository';

export class ClimateInvestmentPriorityService {
  async calculateInvestmentPriorities(cityId: string): Promise<ClimateInvestmentPriorityDto[]> {
    const options = await memoryClimateResilienceRepository.listAdaptationsByCityId(cityId);

    return [
      {
        planId: 'plan-a-balanced',
        planName: 'Plan A — Balanced Climate Adaptation Strategy',
        strategyType: 'BALANCED_RESILIENCE',
        totalBudgetInr: 1500000,
        expectedResilienceScore: 84.5,
        feasibilityStatus: 'FEASIBLE',
        optionsIncluded: options,
      },
      {
        planId: 'plan-b-max-shield',
        planName: 'Plan B — Maximum Climate Shield',
        strategyType: 'MAXIMUM_CLIMATE_SHIELD',
        totalBudgetInr: 3200000,
        expectedResilienceScore: 94.0,
        feasibilityStatus: 'FEASIBLE',
        optionsIncluded: options,
      },
    ];
  }
}

export const climateInvestmentPriorityService = new ClimateInvestmentPriorityService();
