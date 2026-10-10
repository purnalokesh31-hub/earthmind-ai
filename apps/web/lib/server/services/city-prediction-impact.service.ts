// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Impact Engine Service
// ──────────────────────────────────────────────────────────────

import { DomainType } from '../domain/digital-twin/cross-domain.domain';
import { PredictionScenarioVariableDto } from '../domain/digital-twin/city-prediction-simulation.domain';
import { ScenarioCascadeHopDto } from './city-prediction-cascade.service';

export interface DetailedScenarioImpactDto {
  affectedPopulation: number;
  serviceDisruptionPercent: number; // 0 - 100
  transportDisruptionPercent: number;
  utilityImpactPercent: number;
  emergencyResponseImpactPercent: number;
  estimatedDowntimeHours: number;
  affectedZones: string[];
  criticalInfrastructureExposure: Array<{
    assetId: string;
    assetName: string;
    domain: DomainType;
    exposureLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  financialImpactUsd: number;
  dataSource: 'SIMULATION';
}

export class CityPredictionImpactService {
  calculateImpact(
    variables: PredictionScenarioVariableDto[],
    cascadeHops: ScenarioCascadeHopDto[]
  ): DetailedScenarioImpactDto {
    const totalAdditionalPop = cascadeHops.reduce((sum, hop) => sum + hop.additionalAffectedPopulation, 0);
    const maxCascadeDepth = Math.max(...cascadeHops.map((h) => h.propagationDepth), 1);

    const isHighImpact = maxCascadeDepth >= 3 || totalAdditionalPop > 25000;

    return {
      affectedPopulation: Math.max(totalAdditionalPop, 15000),
      serviceDisruptionPercent: isHighImpact ? 68.5 : 32.0,
      transportDisruptionPercent: isHighImpact ? 65.0 : 25.0,
      utilityImpactPercent: isHighImpact ? 54.0 : 18.0,
      emergencyResponseImpactPercent: isHighImpact ? 72.0 : 22.0,
      estimatedDowntimeHours: isHighImpact ? 3.5 : 1.2,
      affectedZones: ['Zone 1 (Benz Circle)', 'Zone 3 (Ward 12)', 'Zone 5 (Eluru Canal Corridor)'],
      criticalInfrastructureExposure: [
        { assetId: 'ast-pow-tx-102', assetName: 'Ward 12 Substation TX-4', domain: 'UTILITY', exposureLevel: isHighImpact ? 'CRITICAL' : 'HIGH' },
        { assetId: 'ast-mob-rd-01', assetName: 'MG Road Arterial Flyover', domain: 'MOBILITY', exposureLevel: isHighImpact ? 'HIGH' : 'MEDIUM' },
        { assetId: 'ast-emg-hsp-03', assetName: 'Vijayawada Central Emergency Clinic', domain: 'EMERGENCY_RESPONSE', exposureLevel: isHighImpact ? 'HIGH' : 'LOW' },
      ],
      financialImpactUsd: isHighImpact ? 185000 : 45000,
      dataSource: 'SIMULATION',
    };
  }
}

export const cityPredictionImpactService = new CityPredictionImpactService();
