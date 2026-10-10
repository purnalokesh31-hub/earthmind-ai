// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Utility Simulation Service
// ──────────────────────────────────────────────────────────────

import { UtilitySimulationScenarioEntity, UtilitySimulationRecommendationDto } from '../domain/digital-twin/utility-simulation.domain';
import { memoryUtilitySimulationRepository } from '../repositories/utility-simulation.repository';

export class MasterUtilitySimulationService {
  async getScenariosByCity(cityId: string): Promise<UtilitySimulationScenarioEntity[]> {
    return memoryUtilitySimulationRepository.listScenariosByCityId(cityId);
  }

  async getScenarioById(scenarioId: string): Promise<UtilitySimulationScenarioEntity | null> {
    return memoryUtilitySimulationRepository.findScenarioById(scenarioId);
  }

  async runScenario(scenarioId: string): Promise<UtilitySimulationScenarioEntity> {
    const scenario = await memoryUtilitySimulationRepository.findScenarioById(scenarioId);
    if (!scenario) throw new Error(`Simulation scenario ${scenarioId} not found`);

    scenario.status = 'COMPLETED';
    await memoryUtilitySimulationRepository.saveScenario(scenario);
    return scenario;
  }

  async approveSimulationPlan(scenarioId: string): Promise<UtilitySimulationRecommendationDto> {
    const scenario = await memoryUtilitySimulationRepository.findScenarioById(scenarioId);
    if (!scenario || !scenario.recommendation) throw new Error(`Simulation scenario ${scenarioId} recommendation not found`);

    scenario.recommendation.approvalStatus = 'APPROVED';
    scenario.status = 'APPROVED';
    await memoryUtilitySimulationRepository.saveScenario(scenario);
    return scenario.recommendation;
  }
}

export const masterUtilitySimulationService = new MasterUtilitySimulationService();
