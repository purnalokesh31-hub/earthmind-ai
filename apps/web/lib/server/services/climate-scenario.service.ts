// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Climate Scenario Engine
// ──────────────────────────────────────────────────────────────

import { memoryClimateResilienceRepository } from '../repositories/climate-resilience.repository';
import { ClimateHazardScenario, ClimateHazardType, ClimateScenarioHorizon } from '../domain/digital-twin/climate-resilience.domain';

export class ClimateScenarioService {
  async createScenario(
    title: string,
    description: string,
    cityId: string,
    hazardType: ClimateHazardType,
    intensityLevel: ClimateHazardScenario['intensityLevel'],
    horizon: ClimateScenarioHorizon,
    createdBy: string,
    assumptions: string[] = []
  ): Promise<ClimateHazardScenario> {
    const scenario: ClimateHazardScenario = {
      scenarioId: `clm-scn-${Date.now()}`,
      title,
      description,
      cityId,
      hazardType,
      intensityLevel,
      horizon,
      status: 'READY',
      assumptions,
      dataSource: 'SIMULATION',
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return memoryClimateResilienceRepository.saveScenario(scenario);
  }
}

export const climateScenarioService = new ClimateScenarioService();
