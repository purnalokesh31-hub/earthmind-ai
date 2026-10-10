// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Simulation Engine
// Isolated In-Memory Simulation Execution (Production State Protected)
// ──────────────────────────────────────────────────────────────

import { memoryDigitalTwinSimulationRepository } from '../repositories/digital-twin-simulation.repository';
import { digitalTwinImpactPropagationService } from './digital-twin-impact-propagation.service';
import { digitalTwinComparisonService } from './digital-twin-comparison.service';
import { SimulationScenarioEntity, SimulationResultDto } from '../domain/digital-twin/simulation.domain';

export class DigitalTwinSimulationService {
  async createScenario(
    title: string,
    description: string,
    type: SimulationScenarioEntity['type'],
    cityId: string,
    createdBy: string,
    inputs: SimulationScenarioEntity['inputs'] = []
  ): Promise<SimulationScenarioEntity> {
    const scenario: SimulationScenarioEntity = {
      scenarioId: `scn-sim-${Date.now()}`,
      title,
      description,
      type,
      cityId,
      status: 'CONFIGURED',
      createdBy,
      inputs,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return memoryDigitalTwinSimulationRepository.save(scenario);
  }

  async runSimulation(scenarioId: string): Promise<SimulationResultDto> {
    const scenario = await memoryDigitalTwinSimulationRepository.findById(scenarioId);
    if (!scenario) throw new Error(`Simulation scenario ${scenarioId} not found`);

    scenario.status = 'RUNNING';

    const start = Date.now();
    const impacts = await digitalTwinImpactPropagationService.calculateImpacts(scenario.inputs, scenario.cityId);
    const comparison = digitalTwinComparisonService.compareScenarios(impacts);

    const result: SimulationResultDto = {
      resultId: `res-sim-${Date.now()}`,
      scenarioId: scenario.scenarioId,
      executedAt: new Date().toISOString(),
      executionDurationMs: Date.now() - start,
      impacts,
      comparison,
      recommendation: {
        recommendationId: `rec-sim-${Date.now()}`,
        title: `Pre-position 2 Heavy Hydraulic Pumps at Target Sector`,
        description: `Advisory recommendation to mitigate simulated risk delta (+${comparison.riskDelta} pts).`,
        recommendedAction: 'PREPOSITION_RESOURCE',
        confidenceScore: 92.0,
        requiresHumanApproval: true,
      },
    };

    scenario.result = result;
    scenario.status = 'COMPLETED';
    scenario.updatedAt = new Date();
    await memoryDigitalTwinSimulationRepository.save(scenario);

    return result;
  }
}

export const digitalTwinSimulationService = new DigitalTwinSimulationService();
