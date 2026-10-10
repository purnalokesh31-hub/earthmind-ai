// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Predictive Simulation Repository
// ──────────────────────────────────────────────────────────────

import { CityPredictionScenarioEntity } from '../domain/digital-twin/city-prediction-simulation.domain';

export interface ICityPredictionSimulationRepository {
  findScenarioById(id: string): Promise<CityPredictionScenarioEntity | null>;
  findScenariosByCity(cityId: string): Promise<CityPredictionScenarioEntity[]>;
  saveScenario(entity: CityPredictionScenarioEntity): Promise<CityPredictionScenarioEntity>;
}

export class MemoryCityPredictionSimulationRepository implements ICityPredictionSimulationRepository {
  private scenarios: CityPredictionScenarioEntity[] = [
    {
      scenarioId: 'sim-scen-501',
      input: {
        title: 'Severe Cyclone & Grid Substation Cascade What-If',
        description: 'Simulates 45% rainfall escalation over 6h horizon with Ward 12 substation thermal overload.',
        cityId: 'city-vja',
        scenarioType: 'MULTI_DOMAIN_CASCADE',
        severityLevel: 'CRITICAL',
        horizon: '6h',
        variables: [
          { variableId: 'v1', variableName: 'Precipitation Intensity Escalation', domain: 'CLIMATE', baseValue: 100, simulatedValue: 145, unit: 'mm/hr', changePercentage: 45 },
          { variableId: 'v2', variableName: 'Substation Transformer Load', domain: 'UTILITY', baseValue: 75, simulatedValue: 98, unit: 'pct', changePercentage: 30.6 },
        ],
        constraints: [
          { constraintId: 'c1', name: 'Max Allowable Emergency Response Delay', domain: 'EMERGENCY_RESPONSE', maxAllowableThreshold: 20, unit: 'mins', isViolated: true },
        ],
      },
      status: 'COMPLETED',
      result: {
        resultId: 'res-sim-501',
        scenarioId: 'sim-scen-501',
        horizon: '6h',
        risk: {
          baselineRiskScore: 52.0,
          simulatedRiskScore: 88.5,
          riskDelta: 36.5,
          classification: 'CRITICAL',
          highestRiskDomain: 'CLIMATE',
          highestRiskAsset: 'Benz Circle Inundation Zone',
        },
        impact: {
          affectedPopulation: 34200,
          directFinancialImpactUsd: 185000,
          criticalInfrastructureDowntimeHours: 3.5,
          transitServiceDisruptionPercent: 65,
          emergencyResponseDelayMinutes: 28,
          environmentalRiskScore: 82,
        },
        cascadeSteps: [
          { stepIndex: 1, sourceDomain: 'CLIMATE', targetDomain: 'MOBILITY', triggerEvent: 'Benz Circle Inundation (145mm/hr)', cascadingImpactDescription: 'MG Road corridor closed due to 0.8m standing water', timeDelayMinutes: 15, additionalAffectedPopulation: 12000 },
          { stepIndex: 2, sourceDomain: 'MOBILITY', targetDomain: 'TRANSIT', triggerEvent: 'Corridor Blockage', cascadingImpactDescription: 'BRT Route 12 suspended; secondary routes delayed >45 mins', timeDelayMinutes: 30, additionalAffectedPopulation: 8500 },
          { stepIndex: 3, sourceDomain: 'UTILITY', targetDomain: 'EMERGENCY_RESPONSE', triggerEvent: 'Substation TX-4 Thermal Trip', cascadingImpactDescription: 'Ward 12 Clinic switches to backup generator; dispatch rerouted', timeDelayMinutes: 60, additionalAffectedPopulation: 13700 },
        ],
        violatedConstraints: [
          { constraintId: 'c1', name: 'Max Allowable Emergency Response Delay', domain: 'EMERGENCY_RESPONSE', maxAllowableThreshold: 20, unit: 'mins', isViolated: true },
        ],
        confidencePercent: 94.5,
        executedAt: new Date().toISOString(),
      },
      recommendation: {
        recommendationId: 'rec-sim-501',
        scenarioId: 'sim-scen-501',
        title: 'Pre-emptive Traffic Diversion & Mobile Substation Deployment',
        summary: 'Deploy mobile generator to Ward 12 substation and initiate MG Road traffic diversion 2 hours prior to peak storm landfall.',
        rationale: 'Reduces peak risk score from 88.5 to 58.0 and limits emergency response delay below 15 mins.',
        mitigationSteps: [
          'Pre-position 500kW mobile generator at Ward 12 Clinic feeder inter-tie',
          'Reroute BRT Route 12 via Eluru Canal bypass road',
          'Notify emergency dispatch units to utilize North-South Flyover corridor',
        ],
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findScenarioById(id: string): Promise<CityPredictionScenarioEntity | null> {
    return this.scenarios.find((s) => s.scenarioId === id) || null;
  }

  async findScenariosByCity(cityId: string): Promise<CityPredictionScenarioEntity[]> {
    return this.scenarios.filter((s) => s.input.cityId === cityId);
  }

  async saveScenario(entity: CityPredictionScenarioEntity): Promise<CityPredictionScenarioEntity> {
    const idx = this.scenarios.findIndex((s) => s.scenarioId === entity.scenarioId);
    if (idx >= 0) this.scenarios[idx] = entity;
    else this.scenarios.push(entity);
    return entity;
  }
}

export const memoryCityPredictionSimulationRepository = new MemoryCityPredictionSimulationRepository();
