// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.4 Climate Resilience & Adaptation Domain
// ──────────────────────────────────────────────────────────────

export type ClimateHazardType =
  | 'FLOOD'
  | 'EXTREME_HEAT'
  | 'CYCLONE'
  | 'HEAVY_RAINFALL'
  | 'DROUGHT'
  | 'STORM_SURGE'
  | 'LANDSLIDE'
  | 'MULTI_HAZARD';

export type ClimateScenarioHorizon =
  | 'NEXT_24_HOURS'
  | 'NEXT_7_DAYS'
  | 'NEXT_30_DAYS'
  | 'NEXT_1_YEAR'
  | 'NEXT_5_YEARS'
  | 'NEXT_10_YEARS';

export type ClimateScenarioStatus =
  | 'DRAFT'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type VulnerabilityClass = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ResilienceCategory =
  | 'RESILIENT'
  | 'MODERATE'
  | 'VULNERABLE'
  | 'HIGHLY_VULNERABLE'
  | 'CRITICAL_RESILIENCE_GAP';

export interface ClimateHazardScenario {
  scenarioId: string;
  title: string;
  description: string;
  cityId: string;
  hazardType: ClimateHazardType;
  intensityLevel: 'MODERATE' | 'SEVERE' | 'EXTREME' | 'HISTORIC_MAX';
  horizon: ClimateScenarioHorizon;
  status: ClimateScenarioStatus;
  assumptions: string[];
  dataSource: 'SIMULATION' | 'OBSERVED_PROXICAL' | 'CLIMATE_MODEL_IPCC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClimateExposureDto {
  exposureId: string;
  scenarioId: string;
  targetAssetId: string;
  targetAssetName: string;
  assetCategory: string;
  exposureLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  hazardProximityKm: number;
  criticalityScore: number; // 0 - 100
  affectedPopulationEst: number;
}

export interface InfrastructureVulnerabilityDto {
  vulnerabilityId: string;
  targetAssetId: string;
  targetAssetName: string;
  vulnerabilityScore: number; // 0 - 100
  vulnerabilityClass: VulnerabilityClass;
  contributingFactors: string[];
  assetConditionScore: number;
  predictiveRiskScore: number;
}

export interface ClimateImpactDto {
  impactId: string;
  sourceHazard: ClimateHazardType;
  targetAssetId: string;
  targetAssetName: string;
  impactType: 'DIRECT' | 'PROPAGATED';
  propagationChain: string[];
  explanation: string;
  estimatedDamageInr: number;
}

export interface ResilienceScoreDto {
  cityId: string;
  overallResilienceScore: number; // 0 - 100
  resilienceCategory: ResilienceCategory;
  weakestCategory: string;
  highestRiskZone: string;
  contributingFactors: string[];
  dataFreshness: string;
}

export interface AdaptationOptionDto {
  optionId: string;
  title: string;
  description: string;
  targetAssetId: string;
  targetAssetName: string;
  adaptationType: 'DRAINAGE_UPGRADE' | 'FLOOD_BARRIER' | 'HEAT_SHIELD' | 'PUMP_CAPACITY' | 'BACKUP_POWER';
  estimatedRiskReductionPercent: number;
  estimatedCostInr: number;
  implementationPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ClimateInvestmentPriorityDto {
  planId: string;
  planName: string;
  strategyType: 'MINIMUM_COST' | 'BALANCED_RESILIENCE' | 'MAXIMUM_CLIMATE_SHIELD';
  totalBudgetInr: number;
  expectedResilienceScore: number;
  feasibilityStatus: 'FEASIBLE' | 'INFEASIBLE';
  optionsIncluded: AdaptationOptionDto[];
}

export interface ClimateResilienceOverviewDto {
  cityId: string;
  resilienceScore: ResilienceScoreDto;
  exposedAssetsCount: number;
  criticalVulnerabilitiesCount: number;
  activeScenariosCount: number;
  recommendedAdaptations: AdaptationOptionDto[];
}
