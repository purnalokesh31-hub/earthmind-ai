// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.5 Utility Closed-Loop Operations Domain
// ──────────────────────────────────────────────────────────────

import { UtilityType, UtilityAssetType } from './utility.domain';

export type OperationsLifecycleState =
  | 'OBSERVING'
  | 'ANOMALY_DETECTED'
  | 'PREDICTING'
  | 'IMPACT_ANALYSIS'
  | 'RESILIENCE_ANALYSIS'
  | 'OPTIMIZING'
  | 'RECOMMENDATION_READY'
  | 'AWAITING_HUMAN_APPROVAL'
  | 'APPROVED'
  | 'EXECUTION_PENDING'
  | 'EXECUTING'
  | 'OUTCOME_VALIDATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WorkOrderStatus = 'DRAFT' | 'AUTHORIZED' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OutcomeValidationStatus = 'OUTCOME_MATCH' | 'PARTIAL_MATCH' | 'OUTCOME_MISMATCH' | 'INCONCLUSIVE';

export interface UtilityOperationsSignalDto {
  signalId: string;
  assetId: string;
  assetName: string;
  anomalyType: 'THERMAL' | 'PRESSURE' | 'VOLTAGE' | 'LOAD' | 'FLOW' | 'DEGRADATION';
  severity: AnomalySeverity;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100
}

export interface UtilityOperationsDecisionDto {
  decisionId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  confidence: number;
  expectedBenefit: string;
  expectedRisk: string;
  expectedCostUsd: number;
  expectedDowntimeHours: number;
  affectedPopulation: number;
}

export interface UtilityOperationsRecommendationDto {
  recommendationId: string;
  decision: UtilityOperationsDecisionDto;
  summary: string;
  rationale: string;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface UtilityOperationsApprovalDto {
  approvalId: string;
  recommendationId: string;
  decision: 'APPROVED' | 'REJECTED';
  approvedByUserId: string;
  approvedByRole: string;
  timestamp: string;
  auditNotes: string;
}

export interface UtilityWorkOrderDto {
  workOrderId: string;
  approvedRecommendationId: string;
  utilityAssetId: string;
  actionType: string;
  priority: string;
  assignedTeam: string;
  requiredEquipment: string[];
  estimatedDurationHours: number;
  estimatedCostUsd: number;
  authorizationUser: string;
  authorizationTimestamp: string;
  status: WorkOrderStatus;
}

export interface UtilityOperationsExecutionDto {
  executionId: string;
  workOrderId: string;
  startedAt: string;
  completedAt?: string;
  progressPercent: number;
  actualCostUsd?: number;
  actualDowntimeHours?: number;
  exceptionsEncountered: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'FAILED';
}

export interface UtilityOperationsOutcomeDto {
  outcomeId: string;
  cycleId: string;
  expectedDowntimeHours: number;
  actualDowntimeHours: number;
  expectedCostUsd: number;
  actualCostUsd: number;
  expectedRestorationPercent: number;
  actualRestorationPercent: number;
  baselineResilienceScore: number;
  observedResilienceScore: number;
  validationStatus: OutcomeValidationStatus;
  notes: string;
}

export interface UtilityOperationsFeedbackDto {
  feedbackId: string;
  cycleId: string;
  predictionAccuracyPercent: number;
  downtimePredictionErrorHours: number;
  costEstimationErrorUsd: number;
  resilienceImprovementAccuracyPercent: number;
  recommendationAccepted: boolean;
  modelTrainingCandidate: boolean;
  createdAt: string;
}

export interface UtilityOperationsKpiDto {
  meanTimeToDetectMinutes: number; // MTTE
  meanTimeToAuthorizeMinutes: number; // MTTA
  meanTimeToRecoverHours: number; // MTTR
  meanTimeToValidateMinutes: number; // MTTV
  predictionAccuracyPercent: number;
  averageDowntimeReductionHours: number;
  averagePopulationImpactReduction: number;
  averageRecoveryCostUsd: number;
  resilienceImprovementDelta: number;
  recommendationAcceptanceRatePercent: number;
  executionSuccessRatePercent: number;
}

export interface UtilityOperationsTimelineDto {
  eventId: string;
  eventType: string; // TELEMETRY_RECEIVED, ANOMALY_DETECTED, PREDICTION_GENERATED, etc.
  description: string;
  actor: string;
  timestamp: string;
}

export interface UtilityOperationsInputDto {
  title: string;
  cityId: string;
  utilityType: UtilityType;
  primaryTargetAssetId: string;
}

export interface UtilityOperationsStageDto {
  stageName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  completedAt?: string;
}

export interface UtilityOperationsCycleEntity {
  cycleId: string;
  input: UtilityOperationsInputDto;
  status: OperationsLifecycleState;
  signals?: UtilityOperationsSignalDto[];
  decision?: UtilityOperationsDecisionDto;
  recommendation?: UtilityOperationsRecommendationDto;
  approval?: UtilityOperationsApprovalDto;
  workOrder?: UtilityWorkOrderDto;
  execution?: UtilityOperationsExecutionDto;
  outcome?: UtilityOperationsOutcomeDto;
  feedback?: UtilityOperationsFeedbackDto;
  timeline?: UtilityOperationsTimelineDto[];
  createdAt: Date;
  updatedAt: Date;
}
