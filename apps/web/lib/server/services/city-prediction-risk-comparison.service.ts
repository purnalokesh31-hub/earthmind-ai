// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Risk Comparison Engine Service
// ──────────────────────────────────────────────────────────────

import { DetailedScenarioImpactDto } from './city-prediction-impact.service';
import { ScenarioCascadeHopDto } from './city-prediction-cascade.service';

export interface BaselineVsScenarioComparisonDto {
  baseline: {
    riskScore: number;
    affectedPopulation: number;
    serviceDisruptionPercent: number;
    cascadeDepth: number;
    criticalAssetExposureCount: number;
    emergencyResponseDelayMinutes: number;
  };
  scenario: {
    riskScore: number;
    affectedPopulation: number;
    serviceDisruptionPercent: number;
    cascadeDepth: number;
    criticalAssetExposureCount: number;
    emergencyResponseDelayMinutes: number;
  };
  deltas: {
    riskScoreDelta: number;
    populationImpactDelta: number;
    serviceDisruptionDeltaPercent: number;
    cascadeDepthDelta: number;
    criticalAssetExposureDelta: number;
    responseDelayDeltaMinutes: number;
  };
  dataSource: 'SIMULATION';
  summaryMessage: string;
}

export class CityPredictionRiskComparisonService {
  compareBaselineVsScenario(
    simulatedRiskScore: number,
    impact: DetailedScenarioImpactDto,
    cascadeHops: ScenarioCascadeHopDto[]
  ): BaselineVsScenarioComparisonDto {
    const baselineRiskScore = 52.0;
    const baselinePop = 12000;
    const baselineServiceDisruption = 20.0;
    const baselineDepth = 1;
    const baselineCriticalAssets = 1;
    const baselineDelay = 8;

    const scenarioDepth = Math.max(...cascadeHops.map((h) => h.propagationDepth), 1);
    const scenarioCriticalAssets = impact.criticalInfrastructureExposure.filter((a) => a.exposureLevel === 'HIGH' || a.exposureLevel === 'CRITICAL').length;
    const scenarioDelay = 28;

    const riskScoreDelta = Number((simulatedRiskScore - baselineRiskScore).toFixed(1));
    const populationImpactDelta = impact.affectedPopulation - baselinePop;
    const serviceDisruptionDeltaPercent = Number((impact.serviceDisruptionPercent - baselineServiceDisruption).toFixed(1));
    const cascadeDepthDelta = scenarioDepth - baselineDepth;
    const criticalAssetExposureDelta = scenarioCriticalAssets - baselineCriticalAssets;
    const responseDelayDeltaMinutes = scenarioDelay - baselineDelay;

    return {
      baseline: {
        riskScore: baselineRiskScore,
        affectedPopulation: baselinePop,
        serviceDisruptionPercent: baselineServiceDisruption,
        cascadeDepth: baselineDepth,
        criticalAssetExposureCount: baselineCriticalAssets,
        emergencyResponseDelayMinutes: baselineDelay,
      },
      scenario: {
        riskScore: simulatedRiskScore,
        affectedPopulation: impact.affectedPopulation,
        serviceDisruptionPercent: impact.serviceDisruptionPercent,
        cascadeDepth: scenarioDepth,
        criticalAssetExposureCount: scenarioCriticalAssets,
        emergencyResponseDelayMinutes: scenarioDelay,
      },
      deltas: {
        riskScoreDelta,
        populationImpactDelta,
        serviceDisruptionDeltaPercent,
        cascadeDepthDelta,
        criticalAssetExposureDelta,
        responseDelayDeltaMinutes,
      },
      dataSource: 'SIMULATION',
      summaryMessage: `Simulation indicates an increase of +${riskScoreDelta} risk points, affecting +${populationImpactDelta.toLocaleString()} additional citizens and adding +${responseDelayDeltaMinutes} mins emergency response delay.`,
    };
  }
}

export const cityPredictionRiskComparisonService = new CityPredictionRiskComparisonService();
