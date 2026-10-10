// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 In-Memory Decision Optimization Repository
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionScenarioEntity,
  CityDecisionInputDto,
  CityInterventionOptionDto,
  CityDecisionScoreDto,
  CityDecisionRecommendationDto,
  CityDecisionApprovalDto,
} from '../domain/digital-twin/city-decision-optimization.domain';

export interface ICityDecisionOptimizationRepository {
  createScenario(input: CityDecisionInputDto): Promise<CityDecisionScenarioEntity>;
  getScenario(scenarioId: string): Promise<CityDecisionScenarioEntity | null>;
  listScenarios(cityId: string): Promise<CityDecisionScenarioEntity[]>;
  updateScenario(scenario: CityDecisionScenarioEntity): Promise<CityDecisionScenarioEntity>;
  deleteScenario(scenarioId: string): Promise<boolean>;
}

export class MemoryCityDecisionOptimizationRepository implements ICityDecisionOptimizationRepository {
  private scenarios: Map<string, CityDecisionScenarioEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultScenario: CityDecisionScenarioEntity = {
      scenarioId: 'dec-scen-101',
      cityId: 'city-vja',
      status: 'EVALUATED',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(),
      input: {
        cityId: 'city-vja',
        scenarioTitle: 'Monsoon Cyclone & Substation Surge Mitigation',
        description: 'Multi-objective intervention selection for extreme precipitation and power grid load',
        horizon: '6h',
        severityLevel: 'CRITICAL',
        targetDomains: ['CLIMATE', 'UTILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
        baseRiskScore: 52.0,
        simulatedPeakRiskScore: 88.5,
        objectives: [
          { objectiveId: 'o1', name: 'Risk Score Reduction', domain: 'CLIMATE', weight: 0.35, targetValue: 30, unit: 'pts', priority: 'CRITICAL' },
          { objectiveId: 'o2', name: 'Population Protection', domain: 'EMERGENCY_RESPONSE', weight: 0.25, targetValue: 30000, unit: 'citizens', priority: 'HIGH' },
          { objectiveId: 'o3', name: 'Cost Containment', domain: 'UTILITY', weight: 0.20, targetValue: 200000, unit: 'usd', priority: 'MEDIUM' },
          { objectiveId: 'o4', name: 'Downtime Minimization', domain: 'TRANSIT', weight: 0.20, targetValue: 4.0, unit: 'hours', priority: 'HIGH' },
        ],
        constraints: [
          { constraintId: 'c1', name: 'Max Available Mobile Generators', domain: 'UTILITY', limitValue: 15, unit: 'units', isHardConstraint: true, isViolated: false },
          { constraintId: 'c2', name: 'Emergency Vehicle Transit Delay', domain: 'EMERGENCY_RESPONSE', limitValue: 30, unit: 'minutes', isHardConstraint: true, isViolated: false },
        ],
      },
      options: [
        {
          optionId: 'opt-alpha-1',
          title: 'Option Alpha: Micro-Grid Islanding & Mobile Flood Barriers',
          description: 'Isolate Sector-4 substation onto micro-grid power while deploying mobile hydra-barriers along canal bunds.',
          primaryDomain: 'UTILITY',
          affectedDomains: ['UTILITY', 'CLIMATE', 'EMERGENCY_RESPONSE'],
          objective: 'Maximize utility continuity and contain flood inundation',
          expectedRiskReduction: 32.5,
          populationImpact: 28500,
          infrastructureImpact: 78,
          estimatedCostUsd: 145000,
          estimatedDowntimeHours: 2.5,
          resourceRequirementCount: 12,
          confidencePercent: 94.5,
          operationalFeasibilityScore: 91.0,
          constraintsSatisfied: ['c1', 'c2'],
          constraintsViolated: [],
          decisionScore: 89.2,
          requiresHumanApproval: true,
        },
        {
          optionId: 'opt-beta-2',
          title: 'Option Beta: Pre-Emptive BRT Transit Rerouting & Pumping Station Boost',
          description: 'Reroute 4 BRT corridors to elevated bypass roads and ramp auxiliary water pumps to 120% capacity.',
          primaryDomain: 'TRANSIT',
          affectedDomains: ['TRANSIT', 'CLIMATE', 'MOBILITY'],
          objective: 'Maintain public transport mobility and drain storm overflow',
          expectedRiskReduction: 24.0,
          populationImpact: 21000,
          infrastructureImpact: 62,
          estimatedCostUsd: 92000,
          estimatedDowntimeHours: 1.8,
          resourceRequirementCount: 8,
          confidencePercent: 91.0,
          operationalFeasibilityScore: 86.5,
          constraintsSatisfied: ['c1', 'c2'],
          constraintsViolated: [],
          decisionScore: 81.5,
          requiresHumanApproval: true,
        },
        {
          optionId: 'opt-gamma-3',
          title: 'Option Gamma: Full District Load Shedding & Controlled Inundation',
          description: 'Controlled power shutdown to Sector-4 industrial feeder and emergency spillway opening.',
          primaryDomain: 'CLIMATE',
          affectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY'],
          objective: 'Prevent catastrophic transformer blowout at cost of local power downtime',
          expectedRiskReduction: 36.0,
          populationImpact: 34000,
          infrastructureImpact: 90,
          estimatedCostUsd: 280000,
          estimatedDowntimeHours: 6.5,
          resourceRequirementCount: 22,
          confidencePercent: 88.0,
          operationalFeasibilityScore: 72.0,
          constraintsSatisfied: ['c1'],
          constraintsViolated: ['c2'],
          decisionScore: 74.8,
          requiresHumanApproval: true,
        },
      ],
      scores: [
        {
          optionId: 'opt-alpha-1',
          optionTitle: 'Option Alpha: Micro-Grid Islanding & Mobile Flood Barriers',
          finalScore: 89.2,
          rank: 1,
          breakdown: {
            riskReductionScore: 32.5,
            populationSafetyScore: 28.5,
            costEfficiencyScore: 18.0,
            downtimeMinimizationScore: 17.5,
            operationalFeasibilityScore: 18.2,
            constraintCompliancePenalty: 0.0,
            finalAggregatedScore: 89.2,
          },
        },
        {
          optionId: 'opt-beta-2',
          optionTitle: 'Option Beta: Pre-Emptive BRT Transit Rerouting & Pumping Station Boost',
          finalScore: 81.5,
          rank: 2,
          breakdown: {
            riskReductionScore: 24.0,
            populationSafetyScore: 21.0,
            costEfficiencyScore: 19.5,
            downtimeMinimizationScore: 19.0,
            operationalFeasibilityScore: 17.3,
            constraintCompliancePenalty: 0.0,
            finalAggregatedScore: 81.5,
          },
        },
        {
          optionId: 'opt-gamma-3',
          optionTitle: 'Option Gamma: Full District Load Shedding & Controlled Inundation',
          finalScore: 74.8,
          rank: 3,
          breakdown: {
            riskReductionScore: 36.0,
            populationSafetyScore: 34.0,
            costEfficiencyScore: 10.0,
            downtimeMinimizationScore: 8.0,
            operationalFeasibilityScore: 14.4,
            constraintCompliancePenalty: 15.0,
            finalAggregatedScore: 74.8,
          },
        },
      ],
      recommendation: {
        recommendationId: 'rec-dec-101',
        scenarioId: 'dec-scen-101',
        selectedOptionId: 'opt-alpha-1',
        title: 'Authorize Option Alpha: Micro-Grid Islanding & Mobile Flood Barriers',
        summary: 'Option Alpha achieves optimal balance with 32.5 pts risk reduction, 28,500 citizens protected, and 2.5 hrs downtime while fully complying with all hard constraints.',
        rationale: 'Highest aggregated multi-objective score (89.2/100). Satisfies all hard operational constraints without triggering emergency response transit delays.',
        expectedRiskReduction: 32.5,
        confidencePercent: 94.5,
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
        generatedAt: new Date(),
      },
    };

    this.scenarios.set(defaultScenario.scenarioId, defaultScenario);
  }

  async createScenario(input: CityDecisionInputDto): Promise<CityDecisionScenarioEntity> {
    const scenarioId = `dec-scen-${Date.now()}`;
    const scenario: CityDecisionScenarioEntity = {
      scenarioId,
      cityId: input.cityId,
      input,
      status: 'DRAFT',
      options: [],
      scores: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.scenarios.set(scenarioId, scenario);
    return scenario;
  }

  async getScenario(scenarioId: string): Promise<CityDecisionScenarioEntity | null> {
    return this.scenarios.get(scenarioId) || null;
  }

  async listScenarios(cityId: string): Promise<CityDecisionScenarioEntity[]> {
    return Array.from(this.scenarios.values()).filter((s) => s.cityId === cityId);
  }

  async updateScenario(scenario: CityDecisionScenarioEntity): Promise<CityDecisionScenarioEntity> {
    scenario.updatedAt = new Date();
    this.scenarios.set(scenario.scenarioId, scenario);
    return scenario;
  }

  async deleteScenario(scenarioId: string): Promise<boolean> {
    return this.scenarios.delete(scenarioId);
  }
}

export const cityDecisionOptimizationRepository = new MemoryCityDecisionOptimizationRepository();
