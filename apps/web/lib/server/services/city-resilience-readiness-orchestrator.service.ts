// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Master Resilience Readiness Orchestration Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityResilienceReadinessInputDto,
  CityResilienceRecommendationDto,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { cityResilienceReadinessService } from './city-resilience-readiness.service';
import { cityResilienceResourceReadinessService } from './city-resilience-resource-readiness.service';
import { cityResilienceGapService } from './city-resilience-gap.service';
import { cityPreparednessOptionService } from './city-preparedness-option.service';
import { cityResilienceReadinessComparisonService } from './city-resilience-readiness-comparison.service';
import { logger } from '../logger';

export class CityResilienceReadinessOrchestratorService {
  private repo = memoryCityResilienceReadinessRepository;

  public runMasterReadinessOrchestration(input: CityResilienceReadinessInputDto): CityResilienceReadinessEntity {
    // 1. Create Assessment Entity
    const entity = this.repo.createReadiness(input);
    const readinessId = entity.id;

    // 2. Step 1: Readiness Assessment
    cityResilienceReadinessService.evaluateCityPreparedness(readinessId);

    // 3. Step 2: Resource Readiness Evaluation
    cityResilienceResourceReadinessService.evaluateResourceReadiness(readinessId);

    // 4. Step 3: Capability Gap Detection
    cityResilienceGapService.detectCapabilityGaps(readinessId);

    // 5. Step 4: Preparedness Option Generation
    cityPreparednessOptionService.generatePreparednessOptions(readinessId);

    // 6. Step 5: Constraint Validation & Option Comparison
    const comparison = cityResilienceReadinessComparisonService.comparePreparednessOptions(readinessId);

    // 7. Step 6: Advisory Recommendation Generation
    const recommendedOption = entity.options.find((o) => o.optionId === comparison.recommendedOptionId) || entity.options[0];

    const recommendation: CityResilienceRecommendationDto = {
      recommendationId: `rec-res-${Date.now()}`,
      readinessId,
      recommendedOptionId: recommendedOption.optionId,
      title: `Adopt Strategy '${recommendedOption.strategy}' for ${input.title}`,
      summary: recommendedOption.description,
      rationale: `Strategy offers optimal risk reduction (${recommendedOption.expectedRiskReduction}%) while satisfying resource constraints.`,
      expectedBenefit: `${recommendedOption.expectedPopulationProtection}% population protection coverage with $${recommendedOption.estimatedCostUsd.toLocaleString()} estimated cost.`,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    };

    entity.recommendation = recommendation;
    entity.status = 'VALIDATED';
    entity.updatedAt = new Date().toISOString();

    this.repo.recordAudit({
      auditId: `aud-orch-${Date.now()}`,
      readinessId,
      eventType: 'ORCHESTRATION_COMPLETED',
      userId: 'SYSTEM_ORCHESTRATOR',
      summary: `Master orchestration completed for readiness assessment '${readinessId}'`,
      timestamp: entity.updatedAt,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });

    logger.info(`[CityResilienceReadinessOrchestratorService] Master readiness orchestration successfully executed for '${readinessId}'`);
    return entity;
  }
}

export const cityResilienceReadinessOrchestratorService = new CityResilienceReadinessOrchestratorService();
