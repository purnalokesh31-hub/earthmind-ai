// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.2 Digital Twin Simulation Domain
// ──────────────────────────────────────────────────────────────

export type SimulationScenarioStatus =
  | 'DRAFT'
  | 'CONFIGURED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type SimulationScenarioType =
  | 'FLOOD_SIMULATION'
  | 'FIRE_SIMULATION'
  | 'POWER_FAILURE'
  | 'WATER_NETWORK_FAILURE'
  | 'ROAD_CLOSURE'
  | 'TRAFFIC_DISRUPTION'
  | 'GARBAGE_OVERLOAD'
  | 'INFRASTRUCTURE_FAILURE'
  | 'EXTREME_WEATHER'
  | 'RESOURCE_REALLOCATION'
  | 'MAINTENANCE_INTERVENTION'
  | 'CUSTOM_SCENARIO';

export interface SimulationInputDto {
  inputId: string;
  scenarioId: string;
  assetId?: string;
  zoneId?: string;
  inputType: 'ASSET_FAILURE' | 'ASSET_DEGRADATION' | 'ROAD_CLOSURE' | 'PUMP_FAILURE' | 'RESOURCE_RELOCATION' | 'HYDRO_SURGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  magnitude: number; // 0 - 100
  durationHours: number;
  assumptions: string[];
}

export interface SimulationImpactDto {
  impactId: string;
  targetAssetId: string;
  targetAssetName: string;
  impactType: 'DIRECT' | 'PROPAGATED';
  baselineStatus: string;
  simulatedStatus: string;
  baselineConditionScore: number;
  simulatedConditionScore: number;
  propagationPath: string[];
  explanation: string;
}

export interface SimulationComparisonDto {
  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskDelta: number;
  baselineCriticalAssetsCount: number;
  simulatedCriticalAssetsCount: number;
  estimatedIncidentsGenerated: number;
  estimatedResponseTimeDeltaMs: number;
  overallHealthStatus: 'IMPROVED' | 'UNCHANGED' | 'DEGRADED' | 'CRITICAL';
}

export interface SimulationRecommendationDto {
  recommendationId: string;
  title: string;
  description: string;
  recommendedAction: 'PREPOSITION_RESOURCE' | 'REASSIGN_DISPATCH' | 'ISSUE_WARNING' | 'INSPECT_INFRASTRUCTURE';
  confidenceScore: number;
  requiresHumanApproval: boolean; // Always true
}

export interface SimulationResultDto {
  resultId: string;
  scenarioId: string;
  executedAt: string;
  executionDurationMs: number;
  impacts: SimulationImpactDto[];
  comparison: SimulationComparisonDto;
  recommendation: SimulationRecommendationDto;
}

export interface SimulationScenarioEntity {
  scenarioId: string;
  title: string;
  description: string;
  type: SimulationScenarioType;
  cityId: string;
  zoneId?: string;
  status: SimulationScenarioStatus;
  createdBy: string;
  inputs: SimulationInputDto[];
  result?: SimulationResultDto;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}
