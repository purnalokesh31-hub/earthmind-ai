// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.4 Smart Utility Autonomous Recovery Domain
// ──────────────────────────────────────────────────────────────

import { UtilityType, UtilityAssetType } from './utility.domain';

export type OptimizationObjective =
  | 'MINIMIZE_COST'
  | 'MINIMIZE_DOWNTIME'
  | 'MINIMIZE_POPULATION_IMPACT'
  | 'MAXIMIZE_RESILIENCE'
  | 'MAXIMIZE_SERVICE_CONTINUITY'
  | 'BALANCED';

export type ActionType =
  | 'INSPECT'
  | 'REPAIR'
  | 'REPLACE'
  | 'ISOLATE'
  | 'REROUTE'
  | 'ACTIVATE_BACKUP'
  | 'DEPLOY_GENERATOR'
  | 'DEPLOY_PUMP'
  | 'RECONFIGURE_NETWORK'
  | 'RESTORE_SERVICE';

export type FeasibilityStatus = 'FEASIBLE' | 'INFEASIBLE';

export type OptimizationStatus =
  | 'CREATED'
  | 'ANALYZING'
  | 'OPTIMIZED'
  | 'RECOMMENDED'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'EXECUTED';

export interface UtilityOptimizationConstraintDto {
  maxBudgetUsd: number;
  maxDowntimeHours: number;
  maxPopulationImpact: number;
  maxCrewUsageCount: number;
  maxEquipmentUsageCount: number;
}

export interface UtilityRecoveryStepDto {
  stepNumber: number;
  actionType: ActionType;
  targetAssetId: string;
  targetAssetName: string;
  assignedCrewDepartment: string;
  estimatedDurationMinutes: number;
  dependencies: number[]; // Step numbers required before this
  requiresHumanApproval: boolean;
}

export interface UtilityRecoverySequenceDto {
  scenarioId: string;
  totalDurationHours: number;
  orderedSteps: UtilityRecoveryStepDto[];
}

export interface UtilityResourceAllocationDto {
  engineeringTeamsCount: number;
  electricalCrewsCount: number;
  waterCrewsCount: number;
  generatorsDeployedCount: number;
  pumpsDeployedCount: number;
  equipmentUnitsUsed: number;
  replacementComponentsCount: number;
}

export interface UtilityResilienceImprovementDto {
  baselineResilienceScore: number;
  postRecoveryResilienceScore: number;
  resilienceImprovementDelta: number;
  serviceContinuityImprovementPercent: number;
  singlePointOfFailureReductionCount: number;
  expectedOutageReductionHours: number;
}

export interface UtilityCostImpactDto {
  totalCostUsd: number;
  equipmentCostUsd: number;
  crewCostUsd: number;
  replacementCostUsd: number;
  downtimeHours: number;
  affectedPopulation: number;
  restorationPercentage: number;
}

export interface UtilityOptimizationCandidateDto {
  candidateId: string;
  candidateName: string; // e.g. "CANDIDATE_A", "CANDIDATE_B"
  title: string;
  feasibility: FeasibilityStatus;
  feasibilityNotes: string[];
  costImpact: UtilityCostImpactDto;
  resourceAllocation: UtilityResourceAllocationDto;
  resilienceImprovement: UtilityResilienceImprovementDto;
  recoverySequence: UtilityRecoverySequenceDto;
  normalizedScore: number; // 0 - 100
}

export interface UtilityOptimizationComparisonDto {
  baselineCostUsd: number;
  baselineDowntimeHours: number;
  baselinePopulationImpact: number;
  candidates: UtilityOptimizationCandidateDto[];
}

export interface UtilityOptimizationRecommendationDto {
  recommendationId: string;
  recommendedCandidateId: string;
  recommendedCandidateName: string;
  title: string;
  summary: string;
  rationale: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  expectedFailureProbabilityReductionPercent: number;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface UtilityOptimizationInputDto {
  title: string;
  cityId: string;
  utilityType: UtilityType;
  primaryTargetAssetId: string;
  objective: OptimizationObjective;
  constraints: UtilityOptimizationConstraintDto;
}

export interface UtilityOptimizationScenarioEntity {
  scenarioId: string;
  input: UtilityOptimizationInputDto;
  status: OptimizationStatus;
  candidates?: UtilityOptimizationCandidateDto[];
  comparison?: UtilityOptimizationComparisonDto;
  recommendation?: UtilityOptimizationRecommendationDto;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────
// Phase 7.7.3 Compatibility Layer
// ──────────────────────────────────────────────────────────────

export type OptimizationLifecycle = OptimizationStatus;

export interface UtilityGridLoadBalanceDto {
  sourceAssetId: string;
  sourceAssetName: string;
  targetAssetId: string;
  targetAssetName: string;
  loadTransferredKw: number;
  percentageTransfer: number;
  expectedTempReductionCelsius: number;
  gridStabilityImpactScore: number;
}

export interface TransformerCoolingOptionDto {
  assetId: string;
  assetName: string;
  fanSpeedOverridePercent: number;
  auxiliaryPumpStatus: 'ACTIVE' | 'STANDBY';
  expectedCoolingRateCelsiusPerHour: number;
}

export interface WaterPressureRegulationDto {
  pipelineAssetId: string;
  pipelineName: string;
  pumpSpeedAdjustmentPercent: number;
  valvePositionAngleDegrees: number;
  targetPressureBar: number;
  expectedBurstRiskReductionPercent: number;
}

export interface EmergencyLoadSheddingDto {
  cityId: string;
  sheddingZoneId: string;
  sheddingZoneName: string;
  affectedFeeders: string[];
  powerSavedMw: number;
  criticalFacilityProtectionStatus: 'PROTECTED' | 'AT_RISK';
}

export interface UtilityOptimizationPlanEntity {
  planId: string;
  title: string;
  cityId: string;
  status: OptimizationLifecycle;
  loadBalance?: UtilityGridLoadBalanceDto;
  coolingOption?: TransformerCoolingOptionDto;
  pressureRegulation?: WaterPressureRegulationDto;
  loadShedding?: EmergencyLoadSheddingDto;
  recommendation: UtilityOptimizationRecommendationDto;
  createdAt: Date;
  updatedAt: Date;
}
