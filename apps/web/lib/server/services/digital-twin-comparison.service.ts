// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Baseline vs Scenario Comparison Engine
// ──────────────────────────────────────────────────────────────

import { SimulationComparisonDto, SimulationImpactDto } from '../domain/digital-twin/simulation.domain';

export class DigitalTwinComparisonService {
  compareScenarios(impacts: SimulationImpactDto[]): SimulationComparisonDto {
    const baselineRisk = 78.5;
    const directCount = impacts.filter((i) => i.impactType === 'DIRECT').length;
    const propCount = impacts.filter((i) => i.impactType === 'PROPAGATED').length;

    const riskDelta = Number((directCount * 8.5 + propCount * 4.2).toFixed(1));
    const simulatedRisk = Math.min(100, Number((baselineRisk + riskDelta).toFixed(1)));

    return {
      baselineRiskScore: baselineRisk,
      simulatedRiskScore: simulatedRisk,
      riskDelta,
      baselineCriticalAssetsCount: 1,
      simulatedCriticalAssetsCount: 1 + directCount,
      estimatedIncidentsGenerated: directCount + propCount,
      estimatedResponseTimeDeltaMs: (directCount + propCount) * 300000, // +5 min per impact
      overallHealthStatus: riskDelta > 10 ? 'DEGRADED' : 'UNCHANGED',
    };
  }
}

export const digitalTwinComparisonService = new DigitalTwinComparisonService();
