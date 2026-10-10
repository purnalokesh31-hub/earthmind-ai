// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Readiness Comparison Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityPreparednessComparisonDto,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { logger } from '../logger';

export class CityResilienceReadinessComparisonService {
  private repo = memoryCityResilienceReadinessRepository;

  public comparePreparednessOptions(readinessId: string): CityPreparednessComparisonDto {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${readinessId}' not found.`);
    }

    const options = entity.options || [];
    if (options.length === 0) {
      throw new Error(`No preparedness options generated for assessment '${readinessId}'.`);
    }

    const comparisonMatrix = options.map((opt) => ({
      optionId: opt.optionId,
      strategy: opt.strategy,
      riskReductionLabel: `${opt.expectedRiskReduction >= 80 ? 'Very High' : opt.expectedRiskReduction >= 60 ? 'High' : 'Medium'} (${opt.expectedRiskReduction}%)`,
      costLabel: `${opt.estimatedCostUsd >= 40000 ? 'High' : opt.estimatedCostUsd >= 15000 ? 'Medium' : 'Low'} ($${opt.estimatedCostUsd.toLocaleString()})`,
      preparationTimeLabel: `${opt.estimatedPreparationTimeMinutes <= 60 ? 'Low' : opt.estimatedPreparationTimeMinutes <= 120 ? 'Medium' : 'High'} (${opt.estimatedPreparationTimeMinutes}m)`,
      populationProtectionLabel: `${opt.expectedPopulationProtection >= 85 ? 'Very High' : opt.expectedPopulationProtection >= 70 ? 'High' : 'Moderate'} (${opt.expectedPopulationProtection}%)`,
    }));

    // Find recommended option (highest risk reduction to cost efficiency ratio)
    const recommended = options.reduce((best, cur) => {
      const curRatio = cur.expectedRiskReduction / (cur.estimatedCostUsd / 1000);
      const bestRatio = best.expectedRiskReduction / (best.estimatedCostUsd / 1000);
      return curRatio > bestRatio ? cur : best;
    }, options[0]);

    const comparison: CityPreparednessComparisonDto = {
      readinessId,
      options,
      recommendedOptionId: recommended.optionId,
      comparisonMatrix,
    };

    entity.comparison = comparison;
    logger.info(`[CityResilienceReadinessComparisonService] Generated comparison matrix for '${readinessId}'. Recommended: ${recommended.optionId}`);
    return comparison;
  }
}

export const cityResilienceReadinessComparisonService = new CityResilienceReadinessComparisonService();
