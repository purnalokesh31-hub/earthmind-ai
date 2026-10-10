// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Service Boundaries & Interfaces Foundation
// Clean service contracts for optimization, constraints, impact, comparison, recommendation, and orchestration
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionScenarioEntity,
  CityInterventionInputDto,
  CityInterventionOptionDto,
  CityInterventionConstraintDto,
  CityInterventionImpactDto,
  CityInterventionComparisonDto,
  CityInterventionRecommendationDto,
  CityInterventionApprovalDto,
} from '../domain/digital-twin/city-intervention.domain';
import { cityInterventionRepository } from '../repositories/city-intervention.repository';
import { cityInterventionConstraintService, CityInterventionConstraintService } from './city-intervention-constraint.service';
import { cityInterventionOptimizationService, CityInterventionOptimizationService, OptimizationResultPayload } from './city-intervention-optimization.service';
import { logger } from '../logger';

export {
  CityInterventionConstraintService,
  cityInterventionConstraintService,
  CityInterventionOptimizationService,
  cityInterventionOptimizationService,
};
export type { OptimizationResultPayload };

export class CityInterventionImpactService {
  calculateImpact(
    baselineRisk: number,
    candidate: CityInterventionOptionDto
  ): CityInterventionImpactDto {
    const projectedRisk = Math.max(0, baselineRisk - candidate.expectedRiskReduction);
    return {
      domain: (candidate.domain || 'CLIMATE') as any,
      baselineImpactScore: baselineRisk,
      postInterventionImpactScore: projectedRisk,
      netImprovementPercent: Math.round(((baselineRisk - projectedRisk) / Math.max(1, baselineRisk)) * 1000) / 10,
      populationProtectedCount: candidate.populationProtected || 10000,
      serviceDisruptionReducedHours: candidate.downtimeAvoided || 2.0,
      baselineRisk,
      projectedRisk,
      riskReduction: candidate.expectedRiskReduction,
      populationProtected: candidate.populationProtected,
      serviceAvailabilityImprovement: 85.0,
      infrastructureDowntimeAvoided: candidate.downtimeAvoided,
      emergencyResponseImprovement: 40.0,
      estimatedFinancialImpact: candidate.estimatedCost,
      estimatedImplementationTime: candidate.estimatedResponseTime,
      resourceUtilization: candidate.resourceRequirement,
      dataSource: 'SIMULATION',
    };
  }
}

export class CityInterventionComparisonService {
  compareInterventions(
    baselineRisk: number,
    candidates: CityInterventionOptionDto[]
  ): CityInterventionComparisonDto {
    return {
      baseline: { baselineRisk },
      candidates,
      riskReductionComparison: candidates.map((c) => ({ candidateId: c.candidateId, riskReduction: c.expectedRiskReduction })),
      costComparison: candidates.map((c) => ({ candidateId: c.candidateId, cost: c.estimatedCost })),
      timeComparison: candidates.map((c) => ({ candidateId: c.candidateId, responseTime: c.estimatedResponseTime })),
      populationProtectionComparison: candidates.map((c) => ({ candidateId: c.candidateId, populationProtected: c.populationProtected })),
      resourceComparison: candidates.map((c) => ({ candidateId: c.candidateId, resourceRequirement: c.resourceRequirement })),
      feasibilityComparison: candidates.map((c) => ({ candidateId: c.candidateId, feasibility: c.feasibility })),
      ranking: candidates.map((c) => ({ candidateId: c.candidateId, rank: c.rank, score: c.score })),
      dataSource: 'OPTIMIZATION',
    };
  }
}

export class CityInterventionRecommendationService {
  generateRecommendation(
    scenarioId: string,
    topCandidate: CityInterventionOptionDto,
    alternatives: CityInterventionOptionDto[]
  ): CityInterventionRecommendationDto {
    return {
      recommendationId: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scenarioId,
      selectedCandidateId: topCandidate.candidateId,
      reasoning: `Selected '${topCandidate.title}' based on optimal risk reduction (${topCandidate.expectedRiskReduction} pts) and feasibility (${topCandidate.feasibility}%).`,
      expectedRiskReduction: topCandidate.expectedRiskReduction,
      expectedPopulationBenefit: topCandidate.populationProtected,
      estimatedCost: topCandidate.estimatedCost,
      estimatedResponseTime: topCandidate.estimatedResponseTime,
      confidence: topCandidate.feasibility,
      alternatives: alternatives.map((a) => a.candidateId),
      createdAt: new Date(),
      requiresHumanApproval: true, // Mandatory Governance Safeguard
    };
  }
}

export class CityInterventionService {
  private repo = cityInterventionRepository;
  private optimizer = cityInterventionOptimizationService;
  private recommender = new CityInterventionRecommendationService();

  async createScenario(input: CityInterventionInputDto): Promise<CityInterventionScenarioEntity> {
    const domainList = input.selectedDomains || input.targetDomains || ['CLIMATE', 'UTILITY'];
    const entity: CityInterventionScenarioEntity = {
      scenarioId: `scen-int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cityId: input.cityId,
      title: `Intervention Scenario for ${input.cityId}`,
      description: `Optimizing interventions for ${domainList.join(', ')} under ${input.optimizationObjective} objective`,
      sourcePredictionId: input.sourcePredictionId,
      sourceSimulationId: input.sourceSimulationId,
      status: 'READY',
      objective: input.optimizationObjective,
      constraints: input.operationalConstraints || [],
      options: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.repo.create(entity);
  }

  async runScenarioOptimization(scenarioId: string): Promise<{ scenario: CityInterventionScenarioEntity; optimization: OptimizationResultPayload }> {
    const existing = await this.repo.getById(scenarioId);
    if (!existing) {
      throw new Error(`Scenario '${scenarioId}' not found`);
    }

    // Input construction
    const input: CityInterventionInputDto = {
      cityId: existing.cityId,
      selectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY'],
      planningHorizon: '6h',
      optimizationObjective: existing.objective,
      operationalConstraints: existing.constraints,
    };

    const result = this.optimizer.optimize(scenarioId, input);

    let updatedRecommendation: CityInterventionRecommendationDto | undefined = undefined;
    if (result.feasibleCandidates.length > 0) {
      const topCandidate = result.feasibleCandidates[0];
      const alternatives = result.feasibleCandidates.slice(1);
      updatedRecommendation = this.recommender.generateRecommendation(scenarioId, topCandidate, alternatives);
    }

    const updated = await this.repo.update(scenarioId, {
      status: result.status === 'OPTIMAL' ? 'EVALUATED' : 'READY',
      options: result.candidates,
      recommendation: updatedRecommendation,
    });

    return {
      scenario: updated,
      optimization: result,
    };
  }

  async getScenario(id: string): Promise<CityInterventionScenarioEntity | null> {
    return this.repo.getById(id);
  }

  async listScenarios(cityId?: string): Promise<CityInterventionScenarioEntity[]> {
    return this.repo.list(cityId);
  }

  async approveScenario(scenarioId: string, approval: CityInterventionApprovalDto): Promise<CityInterventionScenarioEntity> {
    return this.repo.saveApproval(scenarioId, approval);
  }
}

export const cityInterventionImpactService = new CityInterventionImpactService();
export const cityInterventionComparisonService = new CityInterventionComparisonService();
export const cityInterventionRecommendationService = new CityInterventionRecommendationService();
export const cityInterventionService = new CityInterventionService();
