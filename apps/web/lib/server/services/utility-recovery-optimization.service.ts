// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Utility Recovery Optimization Service
// ──────────────────────────────────────────────────────────────

import { UtilityOptimizationScenarioEntity, UtilityOptimizationRecommendationDto } from '../domain/digital-twin/utility-optimization.domain';
import { memoryUtilityOptimizationRepository } from '../repositories/utility-optimization.repository';

export class UtilityRecoveryOptimizationService {
  async getScenariosByCity(cityId: string): Promise<UtilityOptimizationScenarioEntity[]> {
    return memoryUtilityOptimizationRepository.listScenariosByCityId(cityId);
  }

  async getScenarioById(scenarioId: string): Promise<UtilityOptimizationScenarioEntity | null> {
    return memoryUtilityOptimizationRepository.findScenarioById(scenarioId);
  }

  async runOptimization(scenarioId: string): Promise<UtilityOptimizationScenarioEntity> {
    const scenario = await memoryUtilityOptimizationRepository.findScenarioById(scenarioId);
    if (!scenario) throw new Error(`Optimization scenario ${scenarioId} not found`);

    scenario.status = 'OPTIMIZED';
    await memoryUtilityOptimizationRepository.saveScenario(scenario);
    return scenario;
  }

  async approveRecommendation(scenarioId: string, userId: string): Promise<UtilityOptimizationRecommendationDto> {
    const scenario = await memoryUtilityOptimizationRepository.findScenarioById(scenarioId);
    if (!scenario || !scenario.recommendation) {
      throw new Error(`Optimization scenario ${scenarioId} recommendation not found`);
    }

    scenario.recommendation.approvalStatus = 'APPROVED';
    scenario.recommendation.approvedBy = userId;
    scenario.recommendation.approvedAt = new Date().toISOString();
    scenario.status = 'APPROVED';

    await memoryUtilityOptimizationRepository.saveScenario(scenario);
    return scenario.recommendation;
  }
}

export const utilityRecoveryOptimizationService = new UtilityRecoveryOptimizationService();
