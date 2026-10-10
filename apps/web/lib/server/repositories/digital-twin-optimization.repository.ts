// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.3 Digital Twin Optimization Repository
// ──────────────────────────────────────────────────────────────

import { OptimizationScenarioEntity } from '../domain/digital-twin/optimization.domain';

export interface IDigitalTwinOptimizationRepository {
  findById(id: string): Promise<OptimizationScenarioEntity | null>;
  listByCityId(cityId: string): Promise<OptimizationScenarioEntity[]>;
  save(scenario: OptimizationScenarioEntity): Promise<OptimizationScenarioEntity>;
}

export class MemoryDigitalTwinOptimizationRepository implements IDigitalTwinOptimizationRepository {
  private scenarios: OptimizationScenarioEntity[] = [
    {
      scenarioId: 'opt-sc-101',
      title: 'Vijayawada Central Monsoon Resource & Maintenance Plan',
      description: 'Multi-objective optimization prioritizing Ward 12 drainage pump maintenance & Guntur response team pre-positioning.',
      cityId: 'city-vja',
      simulationScenarioId: 'scn-sim-101',
      status: 'AWAITING_APPROVAL',
      totalBudgetInr: 1500000,
      objectives: {
        type: 'BALANCED_MULTI_OBJECTIVE',
        riskWeight: 0.4,
        costWeight: 0.2,
        responseTimeWeight: 0.2,
        availabilityWeight: 0.2,
      },
      constraints: [
        {
          constraintId: 'c-1',
          type: 'MAX_BUDGET',
          limitValue: 1500000,
          unit: 'INR',
          isHardConstraint: true,
        },
      ],
      recommendation: {
        recommendationId: 'rec-opt-101',
        scenarioId: 'opt-sc-101',
        type: 'PREVENTIVE_MAINTENANCE',
        title: 'Pre-position 2 Heavy Hydraulic Pumps & Expedite Ward 12 Culvert Maintenance',
        description: 'Optimal plan yields 79% risk reduction while staying within budget and SLA parameters.',
        targetJurisdiction: 'city-vja',
        selectedPlan: {
          planId: 'plan-b-balanced',
          title: 'Plan B — Balanced High Risk Reduction Strategy',
          strategyName: 'BALANCED_HIGH_RISK_REDUCTION',
          normalizedScore: 84.0,
          riskReductionPercent: 79.0,
          estimatedCostInr: 850000,
          estimatedResponseTimeMinutes: 12,
          resourceUtilizationPercent: 78.0,
          feasibilityStatus: 'FEASIBLE',
          advantages: ['79% risk reduction', 'Response time under 15 mins', 'Under budget ceiling'],
          disadvantages: ['Consumes 78% of available mobile pump reserve'],
          maintenancePlans: [
            {
              planId: 'mp-101',
              targetAssetId: 'ast-drn-102',
              targetAssetName: 'Ward 12 Underground Drainage Culvert',
              assetConditionScore: 42.0,
              predictiveRiskScore: 88.0,
              maintenancePriorityScore: 92.5,
              priorityLevel: 'CRITICAL',
              recommendedAction: 'Expedite Culvert De-silting & Pump Overhaul',
              estimatedDurationHours: 6,
              estimatedCostInr: 450000,
            },
          ],
          resourceAllocations: [
            {
              allocationId: 'alloc-1',
              resourceId: 'res-tm-102',
              resourceName: 'Guntur Mobile Hydro Response Team #2',
              resourceType: 'RESPONSE_TEAM',
              assignedAssetId: 'ast-drn-102',
              assignedZoneId: 'zone-w12',
              currentLocation: 'Guntur Base',
              targetLocation: 'Vijayawada Ward 12 Station',
              estimatedArrivalMinutes: 25,
              workloadScore: 65,
              status: 'OPTIMAL',
            },
          ],
        },
        alternativePlans: [
          {
            planId: 'plan-a-cost',
            title: 'Plan A — Minimum Cost Strategy',
            strategyName: 'MINIMUM_COST',
            normalizedScore: 72.0,
            riskReductionPercent: 61.0,
            estimatedCostInr: 350000,
            estimatedResponseTimeMinutes: 18,
            resourceUtilizationPercent: 52.0,
            feasibilityStatus: 'FEASIBLE',
            advantages: ['Lowest cost'],
            disadvantages: ['Lower risk reduction (61%)'],
            maintenancePlans: [],
            resourceAllocations: [],
          },
        ],
        scoringFactors: {
          riskReduction: 82,
          slaImprovement: 71,
          costEfficiency: 64,
          resourceEfficiency: 78,
          finalScore: 84,
        },
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdBy: 'dutycommander@earthmind.gov',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<OptimizationScenarioEntity | null> {
    return this.scenarios.find((s) => s.scenarioId === id) || null;
  }

  async listByCityId(cityId: string): Promise<OptimizationScenarioEntity[]> {
    return this.scenarios.filter((s) => s.cityId === cityId);
  }

  async save(scenario: OptimizationScenarioEntity): Promise<OptimizationScenarioEntity> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === scenario.scenarioId);
    if (idx >= 0) this.scenarios[idx] = scenario;
    else this.scenarios.push(scenario);
    return scenario;
  }
}

export const memoryDigitalTwinOptimizationRepository = new MemoryDigitalTwinOptimizationRepository();
