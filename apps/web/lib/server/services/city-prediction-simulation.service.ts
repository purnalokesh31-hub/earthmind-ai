// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Predictive Simulation Service
// ──────────────────────────────────────────────────────────────

import {
  CityPredictionScenarioEntity,
  CityPredictionScenarioInputDto,
  PredictionScenarioComparisonDto,
} from '../domain/digital-twin/city-prediction-simulation.domain';
import { memoryCityPredictionSimulationRepository } from '../repositories/city-prediction-simulation.repository';

export class CityPredictionSimulationService {
  async getScenariosByCity(cityId: string): Promise<CityPredictionScenarioEntity[]> {
    return memoryCityPredictionSimulationRepository.findScenariosByCity(cityId);
  }

  async getScenarioById(scenarioId: string): Promise<CityPredictionScenarioEntity | null> {
    return memoryCityPredictionSimulationRepository.findScenarioById(scenarioId);
  }

  async createScenario(input: CityPredictionScenarioInputDto): Promise<CityPredictionScenarioEntity> {
    const entity: CityPredictionScenarioEntity = {
      scenarioId: `sim-scen-${Date.now()}`,
      input,
      status: 'READY',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return memoryCityPredictionSimulationRepository.saveScenario(entity);
  }

  async runScenario(scenarioId: string): Promise<CityPredictionScenarioEntity> {
    const scenario = await memoryCityPredictionSimulationRepository.findScenarioById(scenarioId);
    if (!scenario) throw new Error(`Predictive simulation scenario ${scenarioId} not found`);

    scenario.status = 'RUNNING';
    await memoryCityPredictionSimulationRepository.saveScenario(scenario);

    // Simulate cross-domain cascade impact & risk
    const isCritical = scenario.input.severityLevel === 'CRITICAL';
    const isHigh = scenario.input.severityLevel === 'HIGH';

    const baselineRiskScore = 52.0;
    const simulatedRiskScore = isCritical ? 88.5 : isHigh ? 74.0 : 62.0;
    const riskDelta = simulatedRiskScore - baselineRiskScore;

    scenario.result = {
      resultId: `res-sim-${Date.now()}`,
      scenarioId: scenario.scenarioId,
      horizon: scenario.input.horizon,
      risk: {
        baselineRiskScore,
        simulatedRiskScore,
        riskDelta,
        classification: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'ELEVATED',
        highestRiskDomain: scenario.input.variables?.[0]?.domain || 'CLIMATE',
        highestRiskAsset: 'Benz Circle Inundation Zone',
      },
      impact: {
        affectedPopulation: isCritical ? 34200 : 18500,
        directFinancialImpactUsd: isCritical ? 185000 : 95000,
        criticalInfrastructureDowntimeHours: isCritical ? 3.5 : 1.8,
        transitServiceDisruptionPercent: isCritical ? 65 : 35,
        emergencyResponseDelayMinutes: isCritical ? 28 : 14,
        environmentalRiskScore: isCritical ? 82 : 65,
      },
      cascadeSteps: [
        {
          stepIndex: 1,
          sourceDomain: 'CLIMATE',
          targetDomain: 'MOBILITY',
          triggerEvent: 'Precipitation Intensity Surge',
          cascadingImpactDescription: 'Arterial road inundated causing corridor closure',
          timeDelayMinutes: 15,
          additionalAffectedPopulation: 12000,
        },
        {
          stepIndex: 2,
          sourceDomain: 'MOBILITY',
          targetDomain: 'TRANSIT',
          triggerEvent: 'Corridor Blockage',
          cascadingImpactDescription: 'Multimodal bus fleet delayed >30 mins',
          timeDelayMinutes: 30,
          additionalAffectedPopulation: 8500,
        },
      ],
      violatedConstraints: scenario.input.constraints || [],
      confidencePercent: 94.5,
      executedAt: new Date().toISOString(),
    };

    scenario.recommendation = {
      recommendationId: `rec-sim-${Date.now()}`,
      scenarioId: scenario.scenarioId,
      title: `Advisory Mitigation Plan for ${scenario.input.title}`,
      summary: `Pre-position emergency mobile generators and reroute arterial traffic corridors to limit peak simulated risk.`,
      rationale: `Reduces simulated risk score from ${simulatedRiskScore} to 54.0 and maintains critical response delays under threshold.`,
      mitigationSteps: [
        'Pre-position 500kW mobile generator at critical feeder inter-tie',
        'Reroute multimodal transit via secondary canal bypass road',
        'Notify emergency dispatch units to utilize North-South Flyover corridor',
      ],
      requiresHumanApproval: true, // Always true
      approvalStatus: 'PENDING',
    };

    scenario.status = 'COMPLETED';
    scenario.updatedAt = new Date();

    return memoryCityPredictionSimulationRepository.saveScenario(scenario);
  }

  async compareScenarios(scenarioIdA: string, scenarioIdB: string): Promise<PredictionScenarioComparisonDto> {
    const scA = await memoryCityPredictionSimulationRepository.findScenarioById(scenarioIdA);
    const scB = await memoryCityPredictionSimulationRepository.findScenarioById(scenarioIdB);

    const scoreA = scA?.result?.risk.simulatedRiskScore || 88.5;
    const scoreB = scB?.result?.risk.simulatedRiskScore || 62.0;

    return {
      scenarioIdA,
      scenarioIdB,
      riskScoreDelta: scoreA - scoreB,
      downtimeDeltaHours: (scA?.result?.impact.criticalInfrastructureDowntimeHours || 3.5) - (scB?.result?.impact.criticalInfrastructureDowntimeHours || 1.8),
      costDeltaUsd: (scA?.result?.impact.directFinancialImpactUsd || 185000) - (scB?.result?.impact.directFinancialImpactUsd || 95000),
      populationImpactDelta: (scA?.result?.impact.affectedPopulation || 34200) - (scB?.result?.impact.affectedPopulation || 18500),
      recommendedOption: scoreA < scoreB ? 'SCENARIO_A' : 'SCENARIO_B',
    };
  }

  async approveRecommendation(scenarioId: string, userId: string, notes?: string): Promise<CityPredictionScenarioEntity> {
    const scenario = await memoryCityPredictionSimulationRepository.findScenarioById(scenarioId);
    if (!scenario || !scenario.recommendation) {
      throw new Error(`Scenario or recommendation not found for ID ${scenarioId}`);
    }

    scenario.recommendation.approvalStatus = 'APPROVED';
    scenario.recommendation.approvedBy = userId;
    scenario.recommendation.approvedAt = new Date().toISOString();

    scenario.approvalAudit = {
      approvalId: `appr-sim-${Date.now()}`,
      scenarioId,
      recommendationId: scenario.recommendation.recommendationId,
      userId,
      userRole: 'CITY_COMMAND_DIRECTOR',
      status: 'APPROVED',
      notes: notes || 'Authorized by city command director.',
      timestamp: new Date().toISOString(),
    };

    scenario.updatedAt = new Date();
    return memoryCityPredictionSimulationRepository.saveScenario(scenario);
  }
}

export const cityPredictionSimulationService = new CityPredictionSimulationService();
