// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.4 Climate Resilience Repository
// ──────────────────────────────────────────────────────────────

import { ClimateHazardScenario, AdaptationOptionDto } from '../domain/digital-twin/climate-resilience.domain';

export interface IClimateResilienceRepository {
  findScenarioById(id: string): Promise<ClimateHazardScenario | null>;
  listScenariosByCityId(cityId: string): Promise<ClimateHazardScenario[]>;
  saveScenario(scenario: ClimateHazardScenario): Promise<ClimateHazardScenario>;
  listAdaptationsByCityId(cityId: string): Promise<AdaptationOptionDto[]>;
  saveAdaptation(adaptation: AdaptationOptionDto): Promise<AdaptationOptionDto>;
}

export class MemoryClimateResilienceRepository implements IClimateResilienceRepository {
  private scenarios: ClimateHazardScenario[] = [
    {
      scenarioId: 'clm-scn-101',
      title: 'Vijayawada 100-Year Historic Monsoon Flood Event',
      description: 'Simulated 120mm/hr intense monsoon cloudburst coupled with Krishna river surge.',
      cityId: 'city-vja',
      hazardType: 'FLOOD',
      intensityLevel: 'EXTREME',
      horizon: 'NEXT_30_DAYS',
      status: 'COMPLETED',
      assumptions: ['120mm/hr precipitation', 'Drainage outflow bottlenecked at Benz Circle'],
      dataSource: 'SIMULATION',
      createdBy: 'dutycommander@earthmind.gov',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private adaptations: AdaptationOptionDto[] = [
    {
      optionId: 'adp-101',
      title: 'Benz Circle Drainage Culvert Expansion & Pump Upgrade',
      description: 'Upgrade Ward 12 culvert outflow to 4500L/sec high-velocity submersible pumps.',
      targetAssetId: 'ast-drn-102',
      targetAssetName: 'Ward 12 Underground Drainage Culvert',
      adaptationType: 'DRAINAGE_UPGRADE',
      estimatedRiskReductionPercent: 82.0,
      estimatedCostInr: 1200000,
      implementationPriority: 'CRITICAL',
      requiresHumanApproval: true,
      approvalStatus: 'PENDING',
    },
  ];

  async findScenarioById(id: string): Promise<ClimateHazardScenario | null> {
    return this.scenarios.find((s) => s.scenarioId === id) || null;
  }

  async listScenariosByCityId(cityId: string): Promise<ClimateHazardScenario[]> {
    return this.scenarios.filter((s) => s.cityId === cityId);
  }

  async saveScenario(scenario: ClimateHazardScenario): Promise<ClimateHazardScenario> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === scenario.scenarioId);
    if (idx >= 0) this.scenarios[idx] = scenario;
    else this.scenarios.push(scenario);
    return scenario;
  }

  async listAdaptationsByCityId(cityId: string): Promise<AdaptationOptionDto[]> {
    return this.adaptations;
  }

  async saveAdaptation(adaptation: AdaptationOptionDto): Promise<AdaptationOptionDto> {
    const idx = this.adaptations.findIndex((a) => a.optionId === adaptation.optionId);
    if (idx >= 0) this.adaptations[idx] = adaptation;
    else this.adaptations.push(adaptation);
    return adaptation;
  }
}

export const memoryClimateResilienceRepository = new MemoryClimateResilienceRepository();
