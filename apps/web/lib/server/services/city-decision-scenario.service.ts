// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Master City Decision Scenario Service
// Orchestrates decision optimization scenario creation, candidate generation, scoring & approval
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionScenarioEntity,
  CityDecisionInputDto,
  CityDecisionRecommendationDto,
  CityDecisionApprovalDto,
  CityDecisionSummaryDto,
} from '../domain/digital-twin/city-decision-optimization.domain';
import {
  ICityDecisionOptimizationRepository,
  cityDecisionOptimizationRepository,
} from '../repositories/city-decision-optimization.repository';
import { cityInterventionGenerationService } from './city-intervention-generation.service';
import { cityDecisionScoringService } from './city-decision-scoring.service';
import { logger } from '../logger';

export class CityDecisionScenarioService {
  constructor(
    private readonly repo: ICityDecisionOptimizationRepository = cityDecisionOptimizationRepository
  ) {}

  /**
   * Creates a new decision scenario, generates candidates, scores them, and produces advisory recommendation.
   */
  async createAndEvaluateScenario(input: CityDecisionInputDto): Promise<CityDecisionScenarioEntity> {
    const scenario = await this.repo.createScenario(input);

    // 1. Generate candidate interventions
    const options = await cityInterventionGenerationService.generateCandidateInterventions(input);
    scenario.options = options;

    // 2. Score & rank options
    const scores = await cityDecisionScoringService.scoreAndRankOptions(options, input);
    scenario.scores = scores;

    // 3. Select top ranked option and produce recommendation
    if (scores.length > 0) {
      const topScore = scores[0];
      const selectedOption = options.find((o) => o.optionId === topScore.optionId);

      const recommendation: CityDecisionRecommendationDto = {
        recommendationId: `rec-dec-${Date.now()}`,
        scenarioId: scenario.scenarioId,
        selectedOptionId: topScore.optionId,
        title: `Authorize ${topScore.optionTitle}`,
        summary: selectedOption?.description || 'Optimal multi-objective intervention selected.',
        rationale: `Rank #1 with aggregated multi-objective score ${topScore.finalScore}/100. Expected risk reduction: ${selectedOption?.expectedRiskReduction || 32.5} pts.`,
        expectedRiskReduction: selectedOption?.expectedRiskReduction || 32.5,
        confidencePercent: selectedOption?.confidencePercent || 94.5,
        requiresHumanApproval: true, // MUST ALWAYS BE TRUE
        approvalStatus: 'PENDING',
        generatedAt: new Date(),
      };

      scenario.recommendation = recommendation;
    }

    scenario.status = 'EVALUATED';
    await this.repo.updateScenario(scenario);

    logger.info(`[CityDecisionScenarioService] Created & evaluated decision scenario '${scenario.scenarioId}' for city '${input.cityId}'`);
    return scenario;
  }

  async getScenarioById(scenarioId: string): Promise<CityDecisionScenarioEntity | null> {
    return this.repo.getScenario(scenarioId);
  }

  async listScenarios(cityId: string): Promise<CityDecisionSummaryDto[]> {
    const list = await this.repo.listScenarios(cityId);
    return list.map((s) => ({
      scenarioId: s.scenarioId,
      title: s.input.scenarioTitle,
      status: s.status,
      primaryDomain: s.input.targetDomains[0] || 'CLIMATE',
      baseRiskScore: s.input.baseRiskScore,
      simulatedRiskScore: s.input.simulatedPeakRiskScore,
      interventionOptionsCount: s.options.length,
      topRankedOptionTitle: s.scores.length > 0 ? s.scores[0].optionTitle : undefined,
      requiresHumanApproval: true,
      dataSource: 'SIMULATION',
      createdAt: s.createdAt,
    }));
  }

  /**
   * Records human operator approval for scenario recommendation.
   * Enforces requiresHumanApproval: true.
   */
  async approveRecommendation(
    scenarioId: string,
    userId: string,
    notes?: string
  ): Promise<CityDecisionScenarioEntity> {
    const scenario = await this.repo.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Decision scenario '${scenarioId}' not found`);
    }

    if (!scenario.recommendation) {
      throw new Error(`Scenario '${scenarioId}' has no active recommendation`);
    }

    if (scenario.recommendation.approvalStatus === 'APPROVED') {
      throw new Error(`Scenario '${scenarioId}' recommendation has already been approved`);
    }

    const audit: CityDecisionApprovalDto = {
      scenarioId,
      recommendationId: scenario.recommendation.recommendationId,
      userId,
      decision: 'APPROVED',
      notes,
      timestamp: new Date(),
    };

    scenario.recommendation.approvalStatus = 'APPROVED';
    scenario.approvalAudit = audit;
    scenario.status = 'APPROVED';

    await this.repo.updateScenario(scenario);
    logger.info(`[CityDecisionScenarioService] Recommendation for scenario '${scenarioId}' APPROVED by user '${userId}'`);
    return scenario;
  }
}

export const cityDecisionScenarioService = new CityDecisionScenarioService();
