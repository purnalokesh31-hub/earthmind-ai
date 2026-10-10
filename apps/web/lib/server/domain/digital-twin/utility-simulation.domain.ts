// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.3 Utility Network Simulation Domain
// ──────────────────────────────────────────────────────────────

import { UtilityType, UtilityAssetType } from './utility.domain';

export type UtilitySimulationScenarioType =
  | 'TRANSFORMER_FAILURE'
  | 'SUBSTATION_FAILURE'
  | 'WATER_PUMP_FAILURE'
  | 'PIPELINE_FAILURE'
  | 'MULTI_ASSET_FAILURE'
  | 'EXTREME_LOAD'
  | 'EXTREME_DEMAND'
  | 'CASCADING_FAILURE'
  | 'CUSTOM_UTILITY_FAILURE';

export type SimulationLifecycle =
  | 'CREATED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'ANALYZED'
  | 'RECOMMENDATION_READY'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type ResilienceClassification = 'RESILIENT' | 'MODERATELY_RESILIENT' | 'VULNERABLE' | 'CRITICAL';

export interface UtilitySimulationInputDto {
  title: string;
  scenarioType: UtilitySimulationScenarioType;
  cityId: string;
  utilityType: UtilityType;
  targetAssetId: string;
  severityMultiplier: number; // 1.0 - 5.0
  durationHours: number;
}

export interface UtilityPropagationImpactDto {
  directAffectedAssetIds: string[];
  secondaryAffectedAssetIds: string[];
  affectedZoneIds: string[];
  affectedCriticalFacilityNames: string[];
  propagationDepth: number;
  cascadingRiskScore: number; // 0 - 100
}

export interface UtilityServiceImpactDto {
  affectedPopulation: number;
  affectedCustomersCount: number;
  estimatedOutageDurationHours: number;
  criticalServicesDisruptedCount: number;
  economicServiceImpactScore: number; // 0 - 100
  dataSource: 'SIMULATION';
}

export interface UtilityResilienceScoreDto {
  resilienceScore: number; // 0 - 100
  classification: ResilienceClassification;
  weakestNetworkPoints: string[];
  singlePointsOfFailure: string[];
  criticalDependencies: string[];
}

export interface UtilityRecoveryOptionDto {
  strategyId: string;
  title: string;
  description: string;
  estimatedRecoveryTimeHours: number;
  estimatedServiceRestorationPercent: number;
  resourceRequirements: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresHumanApproval: boolean; // Always true
}

export interface UtilityRecoveryPlanDto {
  planName: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  title: string;
  normalizedResilienceScore: number;
  estimatedCostUsd: number;
  recoveryTimeImprovementHours: number;
  protectedPopulation: number;
  protectedCriticalFacilitiesCount: number;
  feasibilityScore: number;
  strategies: UtilityRecoveryOptionDto[];
}

export interface UtilitySimulationComparisonDto {
  baselineHealthScore: number;
  simulatedHealthScore: number;
  baselineOutageHours: number;
  simulatedOutageHours: number;
  populationImpactDelta: number;
  resilienceDelta: number;
}

export interface UtilitySimulationRecommendationDto {
  recommendationId: string;
  recommendedPlanName: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  summary: string;
  whySelected: string;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UtilitySimulationScenarioEntity {
  scenarioId: string;
  input: UtilitySimulationInputDto;
  status: SimulationLifecycle;
  propagation?: UtilityPropagationImpactDto;
  serviceImpact?: UtilityServiceImpactDto;
  resilience?: UtilityResilienceScoreDto;
  comparison?: UtilitySimulationComparisonDto;
  recoveryPlans?: UtilityRecoveryPlanDto[];
  recommendation?: UtilitySimulationRecommendationDto;
  createdAt: Date;
  updatedAt: Date;
}
