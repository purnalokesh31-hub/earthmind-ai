// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.2 Digital Twin Simulation Repository
// ──────────────────────────────────────────────────────────────

import { SimulationScenarioEntity } from '../domain/digital-twin/simulation.domain';

export interface IDigitalTwinSimulationRepository {
  findById(id: string): Promise<SimulationScenarioEntity | null>;
  listByCityId(cityId: string): Promise<SimulationScenarioEntity[]>;
  save(scenario: SimulationScenarioEntity): Promise<SimulationScenarioEntity>;
}

export class MemoryDigitalTwinSimulationRepository implements IDigitalTwinSimulationRepository {
  private scenarios: SimulationScenarioEntity[] = [
    {
      scenarioId: 'scn-sim-101',
      title: 'Monsoon Flood & Drainage Pump Failure Scenario',
      description: 'Hypothetical 4-hour failure of Ward 12 Culvert Drainage Pump during heavy monsoon runoff.',
      type: 'FLOOD_SIMULATION',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      status: 'COMPLETED',
      createdBy: 'dutycommander@earthmind.gov',
      inputs: [
        {
          inputId: 'inp-1',
          scenarioId: 'scn-sim-101',
          assetId: 'ast-drn-102',
          inputType: 'PUMP_FAILURE',
          severity: 'CRITICAL',
          magnitude: 100,
          durationHours: 4,
          assumptions: ['42mm/h rainfall rate', 'Benz Circle traffic congestion at peak'],
        },
      ],
      result: {
        resultId: 'res-101',
        scenarioId: 'scn-sim-101',
        executedAt: new Date().toISOString(),
        executionDurationMs: 420,
        impacts: [
          {
            impactId: 'imp-1',
            targetAssetId: 'ast-drn-102',
            targetAssetName: 'Ward 12 Underground Drainage Culvert',
            impactType: 'DIRECT',
            baselineStatus: 'CRITICAL',
            simulatedStatus: 'OFFLINE',
            baselineConditionScore: 42.0,
            simulatedConditionScore: 0.0,
            propagationPath: ['Ward 12 Culvert Pump'],
            explanation: 'Direct pump hardware shutdown causes 100% loss of drainage outflow capacity.',
          },
          {
            impactId: 'imp-2',
            targetAssetId: 'ast-rd-101',
            targetAssetName: 'Benz Circle School Arterial Segment',
            impactType: 'PROPAGATED',
            baselineStatus: 'DEGRADED',
            simulatedStatus: 'CRITICAL',
            baselineConditionScore: 68.5,
            simulatedConditionScore: 24.0,
            propagationPath: ['Ward 12 Culvert Pump', 'Main Drainage Overflow', 'Benz Circle Road Surface'],
            explanation: 'Unchecked water accumulation inundates road surface, increasing pothole subsidence risk.',
          },
        ],
        comparison: {
          baselineRiskScore: 78.5,
          simulatedRiskScore: 94.2,
          riskDelta: 15.7,
          baselineCriticalAssetsCount: 1,
          simulatedCriticalAssetsCount: 2,
          estimatedIncidentsGenerated: 3,
          estimatedResponseTimeDeltaMs: 900000, // +15 mins
          overallHealthStatus: 'DEGRADED',
        },
        recommendation: {
          recommendationId: 'rec-sim-101',
          title: 'Pre-position 2 Heavy Hydraulic Pumps at Ward 12 Station',
          description: 'Deploy backup mobile pumps from Guntur transit corridor before simulation window.',
          recommendedAction: 'PREPOSITION_RESOURCE',
          confidenceScore: 92.0,
          requiresHumanApproval: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<SimulationScenarioEntity | null> {
    return this.scenarios.find((s) => s.scenarioId === id) || null;
  }

  async listByCityId(cityId: string): Promise<SimulationScenarioEntity[]> {
    return this.scenarios.filter((s) => s.cityId === cityId);
  }

  async save(scenario: SimulationScenarioEntity): Promise<SimulationScenarioEntity> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === scenario.scenarioId);
    if (idx >= 0) this.scenarios[idx] = scenario;
    else this.scenarios.push(scenario);
    return scenario;
  }
}

export const memoryDigitalTwinSimulationRepository = new MemoryDigitalTwinSimulationRepository();
