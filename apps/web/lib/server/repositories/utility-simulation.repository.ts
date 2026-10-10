// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.3 Utility Simulation Repository
// ──────────────────────────────────────────────────────────────

import { UtilitySimulationScenarioEntity } from '../domain/digital-twin/utility-simulation.domain';

export interface IUtilitySimulationRepository {
  listScenariosByCityId(cityId: string): Promise<UtilitySimulationScenarioEntity[]>;
  findScenarioById(scenarioId: string): Promise<UtilitySimulationScenarioEntity | null>;
  saveScenario(scenario: UtilitySimulationScenarioEntity): Promise<UtilitySimulationScenarioEntity>;
}

export class MemoryUtilitySimulationRepository implements IUtilitySimulationRepository {
  private scenarios: UtilitySimulationScenarioEntity[] = [
    {
      scenarioId: 'sim-utl-101',
      input: {
        title: 'Ward 12 Distribution Transformer Thermal Runaway Failure Scenario',
        scenarioType: 'TRANSFORMER_FAILURE',
        cityId: 'city-vja',
        utilityType: 'ELECTRICITY',
        targetAssetId: 'ast-pow-tx-102',
        severityMultiplier: 2.5,
        durationHours: 12,
      },
      status: 'RECOMMENDATION_READY',
      propagation: {
        directAffectedAssetIds: ['ast-pow-tx-102'],
        secondaryAffectedAssetIds: ['ast-pow-feeder-12A', 'ast-pow-feeder-12B'],
        affectedZoneIds: ['zone-w12'],
        affectedCriticalFacilityNames: ['Ward 12 Primary Health Clinic', 'Benz Circle Traffic Signal Grid'],
        propagationDepth: 3,
        cascadingRiskScore: 84.5,
      },
      serviceImpact: {
        affectedPopulation: 14200,
        affectedCustomersCount: 3850,
        estimatedOutageDurationHours: 6.5,
        criticalServicesDisruptedCount: 2,
        economicServiceImpactScore: 78.0,
        dataSource: 'SIMULATION',
      },
      resilience: {
        resilienceScore: 48.5,
        classification: 'VULNERABLE',
        weakestNetworkPoints: ['TX-4 Single Distribution Feeder Link'],
        singlePointsOfFailure: ['ast-pow-tx-102'],
        criticalDependencies: ['Hospital Feed Line 12B'],
      },
      comparison: {
        baselineHealthScore: 68.5,
        simulatedHealthScore: 32.0,
        baselineOutageHours: 0.5,
        simulatedOutageHours: 6.5,
        populationImpactDelta: 14200,
        resilienceDelta: -36.0,
      },
      recoveryPlans: [
        {
          planName: 'PLAN_A',
          title: 'Immediate 30% Load Reroute to TX-5 Reserve + Forced Radiator Fan Override',
          normalizedResilienceScore: 88.5,
          estimatedCostUsd: 1200,
          recoveryTimeImprovementHours: 4.5,
          protectedPopulation: 14200,
          protectedCriticalFacilitiesCount: 2,
          feasibilityScore: 94.0,
          strategies: [
            {
              strategyId: 'strat-101',
              title: 'Activate TX-5 Inter-tie Breaker',
              description: 'Closes inter-tie breaker to transfer 450 kW load to reserve transformer.',
              estimatedRecoveryTimeHours: 1.5,
              estimatedServiceRestorationPercent: 100,
              resourceRequirements: ['Grid Operations Crew', 'Scada Inter-tie Signal'],
              riskLevel: 'LOW',
              requiresHumanApproval: true,
            },
          ],
        },
      ],
      recommendation: {
        recommendationId: 'rec-sim-101',
        recommendedPlanName: 'PLAN_A',
        summary: 'Execute PLAN_A: Inter-tie Breaker Load Transfer & Radiator Fan Override',
        whySelected: 'PLAN_A restores 100% service to Ward 12 Health Clinic in 1.5 hrs at minimal cost.',
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async listScenariosByCityId(cityId: string): Promise<UtilitySimulationScenarioEntity[]> {
    return this.scenarios.filter((s) => s.input.cityId === cityId);
  }

  async findScenarioById(scenarioId: string): Promise<UtilitySimulationScenarioEntity | null> {
    return this.scenarios.find((s) => s.scenarioId === scenarioId) || null;
  }

  async saveScenario(scenario: UtilitySimulationScenarioEntity): Promise<UtilitySimulationScenarioEntity> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === scenario.scenarioId);
    if (idx >= 0) this.scenarios[idx] = scenario;
    else this.scenarios.push(scenario);
    return scenario;
  }
}

export const memoryUtilitySimulationRepository = new MemoryUtilitySimulationRepository();
