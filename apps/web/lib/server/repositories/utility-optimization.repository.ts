// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.4 Utility Optimization Repository
// ──────────────────────────────────────────────────────────────

import { UtilityOptimizationScenarioEntity, UtilityOptimizationPlanEntity } from '../domain/digital-twin/utility-optimization.domain';

export interface IUtilityOptimizationRepository {
  listScenariosByCityId(cityId: string): Promise<UtilityOptimizationScenarioEntity[]>;
  findScenarioById(scenarioId: string): Promise<UtilityOptimizationScenarioEntity | null>;
  saveScenario(scenario: UtilityOptimizationScenarioEntity): Promise<UtilityOptimizationScenarioEntity>;

  // Phase 7.7.3 Compatibility
  listPlansByCityId(cityId: string): Promise<UtilityOptimizationPlanEntity[]>;
  findPlanById(planId: string): Promise<UtilityOptimizationPlanEntity | null>;
  savePlan(plan: UtilityOptimizationPlanEntity): Promise<UtilityOptimizationPlanEntity>;
}

export class MemoryUtilityOptimizationRepository implements IUtilityOptimizationRepository {
  private scenarios: UtilityOptimizationScenarioEntity[] = [
    {
      scenarioId: 'opt-utl-201',
      input: {
        title: 'Ward 12 Substation Failure Autonomous Recovery & Resilience Strategy',
        cityId: 'city-vja',
        utilityType: 'ELECTRICITY',
        primaryTargetAssetId: 'ast-pow-tx-102',
        objective: 'BALANCED',
        constraints: {
          maxBudgetUsd: 15000,
          maxDowntimeHours: 4.0,
          maxPopulationImpact: 20000,
          maxCrewUsageCount: 10,
          maxEquipmentUsageCount: 5,
        },
      },
      status: 'RECOMMENDED',
      candidates: [
        {
          candidateId: 'cand-A',
          candidateName: 'CANDIDATE_A',
          title: 'Immediate TX-5 Inter-tie Reroute + Mobile Radiator Cooling Unit',
          feasibility: 'FEASIBLE',
          feasibilityNotes: ['Budget within limit', 'Downtime under 2.0 hrs'],
          costImpact: {
            totalCostUsd: 3200,
            equipmentCostUsd: 1200,
            crewCostUsd: 800,
            replacementCostUsd: 1200,
            downtimeHours: 1.5,
            affectedPopulation: 0,
            restorationPercentage: 100,
          },
          resourceAllocation: {
            engineeringTeamsCount: 1,
            electricalCrewsCount: 2,
            waterCrewsCount: 0,
            generatorsDeployedCount: 1,
            pumpsDeployedCount: 0,
            equipmentUnitsUsed: 2,
            replacementComponentsCount: 1,
          },
          resilienceImprovement: {
            baselineResilienceScore: 48.5,
            postRecoveryResilienceScore: 88.5,
            resilienceImprovementDelta: 40.0,
            serviceContinuityImprovementPercent: 95.0,
            singlePointOfFailureReductionCount: 1,
            expectedOutageReductionHours: 5.0,
          },
          recoverySequence: {
            scenarioId: 'opt-utl-201',
            totalDurationHours: 1.5,
            orderedSteps: [
              {
                stepNumber: 1,
                actionType: 'ISOLATE',
                targetAssetId: 'ast-pow-tx-102',
                targetAssetName: 'Ward 12 Primary Transformer TX-4',
                assignedCrewDepartment: 'Electrical Grid Operations',
                estimatedDurationMinutes: 15,
                dependencies: [],
                requiresHumanApproval: true,
              },
              {
                stepNumber: 2,
                actionType: 'REROUTE',
                targetAssetId: 'ast-pow-tx-105',
                targetAssetName: 'Reserve Transformer TX-5 Inter-tie',
                assignedCrewDepartment: 'Electrical Grid Operations',
                estimatedDurationMinutes: 30,
                dependencies: [1],
                requiresHumanApproval: true,
              },
            ],
          },
          normalizedScore: 92.5,
        },
      ],
      recommendation: {
        recommendationId: 'rec-opt-201',
        recommendedCandidateId: 'cand-A',
        recommendedCandidateName: 'CANDIDATE_A',
        title: 'Execute CANDIDATE_A: Inter-tie Reroute & Mobile Radiator Cooling',
        summary: 'CANDIDATE_A restores 100% service in 1.5 hours at $3,200 total cost while protecting Ward 12 Health Clinic.',
        rationale: 'Provides highest resilience improvement (+40 points) with zero population impact and fast restoration.',
        urgency: 'HIGH',
        expectedFailureProbabilityReductionPercent: 88.4,
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private plans: UtilityOptimizationPlanEntity[] = [
    {
      planId: 'opt-utl-101',
      title: 'Ward 12 Substation Transformer Load Transfer & Thermal Override Plan',
      cityId: 'city-vja',
      status: 'RECOMMENDED',
      loadBalance: {
        sourceAssetId: 'ast-pow-tx-102',
        sourceAssetName: 'Ward 12 Substation Transformer TX-4',
        targetAssetId: 'ast-pow-tx-105',
        targetAssetName: 'Ward 12 Substation Reserve Transformer TX-5',
        loadTransferredKw: 450,
        percentageTransfer: 30,
        expectedTempReductionCelsius: 18.5,
        gridStabilityImpactScore: 92.0,
      },
      coolingOption: {
        assetId: 'ast-pow-tx-102',
        assetName: 'Ward 12 Substation Transformer TX-4',
        fanSpeedOverridePercent: 100,
        auxiliaryPumpStatus: 'ACTIVE',
        expectedCoolingRateCelsiusPerHour: 4.2,
      },
      recommendation: {
        recommendationId: 'rec-utl-101',
        recommendedCandidateId: 'cand-A',
        recommendedCandidateName: 'CANDIDATE_A',
        title: 'Authorize 30% Load Transfer to TX-5 & Forced Fan Cooling',
        summary: 'Transfer 450 kW load from TX-4 to TX-5 and force radiator cooling to prevent thermal runaway.',
        rationale: 'Reduces transformer temperature by 18.5 C within 4 hours.',
        urgency: 'HIGH',
        expectedFailureProbabilityReductionPercent: 78.5,
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async listScenariosByCityId(cityId: string): Promise<UtilityOptimizationScenarioEntity[]> {
    return this.scenarios.filter((s) => s.input.cityId === cityId);
  }

  async findScenarioById(scenarioId: string): Promise<UtilityOptimizationScenarioEntity | null> {
    return this.scenarios.find((s) => s.scenarioId === scenarioId) || null;
  }

  async saveScenario(scenario: UtilityOptimizationScenarioEntity): Promise<UtilityOptimizationScenarioEntity> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === scenario.scenarioId);
    if (idx >= 0) this.scenarios[idx] = scenario;
    else this.scenarios.push(scenario);
    return scenario;
  }

  async listPlansByCityId(cityId: string): Promise<UtilityOptimizationPlanEntity[]> {
    return this.plans.filter((p) => p.cityId === cityId);
  }

  async findPlanById(planId: string): Promise<UtilityOptimizationPlanEntity | null> {
    return this.plans.find((p) => p.planId === planId) || null;
  }

  async savePlan(plan: UtilityOptimizationPlanEntity): Promise<UtilityOptimizationPlanEntity> {
    const idx = this.plans.findIndex((p) => p.planId === plan.planId);
    if (idx >= 0) this.plans[idx] = plan;
    else this.plans.push(plan);
    return plan;
  }
}

export const memoryUtilityOptimizationRepository = new MemoryUtilityOptimizationRepository();
