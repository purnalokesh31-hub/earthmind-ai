// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Preparedness Option Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityPreparednessOptionDto,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { logger } from '../logger';

export class CityPreparednessOptionService {
  private repo = memoryCityResilienceReadinessRepository;

  public generatePreparednessOptions(readinessId: string): CityPreparednessOptionDto[] {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${readinessId}' not found.`);
    }

    const options: CityPreparednessOptionDto[] = [
      {
        optionId: `opt-${readinessId}-bal`,
        strategy: 'BALANCED_READINESS',
        title: 'Balanced Operational Preparedness Plan',
        description: 'Allocates 2 standby engineering crews, pre-positions mobile pumps, and verifies power generators.',
        estimatedCostUsd: 18500,
        estimatedPreparationTimeMinutes: 90,
        expectedRiskReduction: 68,
        expectedPopulationProtection: 78,
        serviceContinuityScore: 82,
        resourceRequirements: ['2x Engineering Crew', '2x Mobile Generator', '1x Traffic Control Unit'],
        constraints: [],
        confidence: 88,
        dataSource: 'RESILIENCE_PREPAREDNESS',
        requiresHumanApproval: true,
      },
      {
        optionId: `opt-${readinessId}-max-resp`,
        strategy: 'MAXIMIZE_RESPONSE_CAPABILITY',
        title: 'Maximum Response Capability Strategy',
        description: 'Deploys 4 standby crews, establishes dual redundant power backups, and activates full emergency staging.',
        estimatedCostUsd: 42000,
        estimatedPreparationTimeMinutes: 150,
        expectedRiskReduction: 88,
        expectedPopulationProtection: 92,
        serviceContinuityScore: 95,
        resourceRequirements: ['4x Engineering Crew', '4x Mobile Generator', '2x Water Tanker', '3x Traffic Unit'],
        constraints: [],
        confidence: 92,
        dataSource: 'RESILIENCE_PREPAREDNESS',
        requiresHumanApproval: true,
      },
      {
        optionId: `opt-${readinessId}-min-cost`,
        strategy: 'MINIMIZE_PREPAREDNESS_COST',
        title: 'Cost-Optimized Target Preparedness',
        description: 'Focuses strictly on critical Substation 4B pump pre-positioning with existing on-duty staff.',
        estimatedCostUsd: 8500,
        estimatedPreparationTimeMinutes: 45,
        expectedRiskReduction: 45,
        expectedPopulationProtection: 60,
        serviceContinuityScore: 68,
        resourceRequirements: ['1x Engineering Crew', '1x Mobile Generator'],
        constraints: [],
        confidence: 80,
        dataSource: 'RESILIENCE_PREPAREDNESS',
        requiresHumanApproval: true,
      },
    ];

    entity.options = options;
    entity.status = 'OPTIONS_GENERATED';
    entity.updatedAt = new Date().toISOString();

    logger.info(`[CityPreparednessOptionService] Generated ${options.length} advisory options for assessment '${readinessId}'`);
    return options;
  }
}

export const cityPreparednessOptionService = new CityPreparednessOptionService();
