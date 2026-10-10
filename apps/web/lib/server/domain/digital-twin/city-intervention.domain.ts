// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Citywide Intervention Planning, Coordinated Response & Multi-Domain Action Intelligence Domain
// ──────────────────────────────────────────────────────────────

import { ResilienceDomainType } from './resilience-orchestration.domain';

export type UrbanDomain = ResilienceDomainType;
export type CityInterventionOptionDto = any;
export type ConstraintType =
  | 'MAX_BUDGET'
  | 'MAX_DOWNTIME'
  | 'MAX_RESPONSE_TIME'
  | 'MAX_EXPOSURE'
  | 'MAX_POPULATION_EXPOSURE'
  | 'MAX_CREW_REQUIREMENT'
  | 'MAX_RESOURCE_REQUIREMENT';
export type ConstraintEvaluationStatus = 'PASS' | 'WARNING' | 'VIOLATION';
export type CityInterventionScenarioEntity = any;

export type CityInterventionStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'GENERATED'
  | 'VALIDATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type CityInterventionDataSource =
  | 'PREDICTION'
  | 'SIMULATION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'OPTIMIZATION'
  | 'LIVE'
  | 'HISTORICAL'
  | 'DERIVED';

export type CityInterventionOptimizationObjective =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_RESPONSE_TIME'
  | 'MINIMIZE_COST'
  | 'MINIMIZE_SERVICE_DISRUPTION'
  | 'MAXIMIZE_POPULATION_PROTECTION'
  | 'BALANCED';

export type CityInterventionValidationStatus =
  | 'VALID'
  | 'INVALID'
  | 'CONSTRAINED'
  | 'REQUIRES_REVIEW';

export type CityInterventionDependencyType =
  | 'TEMPORAL'
  | 'SPATIAL'
  | 'OPERATIONAL'
  | 'RESOURCE'
  | 'SERVICE';

export interface CityInterventionDomainDto {
  domain: ResilienceDomainType;
  primaryRiskScore: number;
  vulnerabilityIndex: number;
  impactedAssetsCount: number;
  status: string;
}

export interface CityInterventionInputDto {
  cityId: string;
  scenarioId?: string;
  predictionId?: string;
  decisionId?: string;
  title?: string;
  description?: string;
  requestedBy?: string;
  targetDomains?: ResilienceDomainType[];
  selectedDomains?: string[];
  sourcePredictionId?: string;
  sourceSimulationId?: string;
  planningHorizon?: string;
  targetZones?: string[];
  optimizationObjective?: CityInterventionOptimizationObjective;
  budgetConstraintUsd?: number;
  maxDowntimeHours?: number;
  operationalConstraints?: any[];
}

export interface CityInterventionObjectiveDto {
  objectiveId: string;
  name: string;
  type: CityInterventionOptimizationObjective;
  targetValue: number;
  currentValue: number;
  unit: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CityInterventionActionDto {
  actionId: string;
  domain: ResilienceDomainType;
  priority: number;
  title: string;
  description: string;
  affectedZones: string[];
  estimatedDurationHours: number;
  requiredResources: string[];
  dependencies: string[];
  expectedImpactScore: number;
  riskReductionPoints: number;
  populationBenefitCount: number;
  estimatedCostUsd: number;
  requiresHumanApproval: true;
  dataSource: CityInterventionDataSource;
}

export interface CityInterventionSequenceStepDto {
  sequenceNumber: number;
  actionId: string;
  actionTitle: string;
  domain: ResilienceDomainType;
  prerequisites: string[];
  estimatedDurationHours: number;
  parallelGroupId: string;
  dependencyStatus: 'SATISFIED' | 'WAITING' | 'BLOCKED';
  resourceRequirement: string[];
  operationalRationale: string;
}

export interface CityInterventionSequenceDto {
  sequenceId: string;
  interventionId: string;
  totalDurationHours: number;
  parallelGroupCount: number;
  steps: CityInterventionSequenceStepDto[];
  requiresHumanApproval: true;
  dataSource: CityInterventionDataSource;
}

export interface CityInterventionDependencyDto {
  dependencyId: string;
  actionId: string;
  dependsOnActionId: string;
  dependencyType: CityInterventionDependencyType;
  status: 'RESOLVED' | 'PENDING' | 'CONFLICT';
  explanation: string;
}

export interface CityInterventionConstraintDto {
  constraintId: string;
  type: string;
  constraintType?: ConstraintType;
  name?: string;
  limitValue: number;
  currentValue: number;
  actualValue?: number;
  unit?: string;
  isViolated: boolean;
  status?: ConstraintEvaluationStatus;
  severity: 'MINOR' | 'MODERATE' | 'CRITICAL';
  affectedActionIds: string[];
  remediationSuggestion: string;
}

export interface CityInterventionResourceDto {
  resourceType: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  assignedActionId: string;
  crewCategory: string;
  constraintStatus: 'AVAILABLE' | 'CONSTRAINED' | 'SHORTAGE';
  estimatedCostUsd: number;
}

export interface CityInterventionImpactDto {
  domain: ResilienceDomainType;
  baselineImpactScore: number;
  postInterventionImpactScore: number;
  netImprovementPercent: number;
  populationProtectedCount: number;
  serviceDisruptionReducedHours: number;
  baselineRisk?: number;
  projectedRisk?: number;
  riskReduction?: number;
  populationProtected?: number;
  serviceAvailabilityImprovement?: number;
  infrastructureDowntimeAvoided?: number;
  emergencyResponseImprovement?: number;
  estimatedFinancialImpact?: number;
  estimatedImplementationTime?: number;
  resourceUtilization?: any;
  dataSource?: CityInterventionDataSource;
}

export interface CityInterventionRiskReductionDto {
  domain: ResilienceDomainType;
  initialRiskScore: number;
  residualRiskScore: number;
  riskPointsReduced: number;
  confidencePercent: number;
}

export interface CityInterventionRecommendationDto {
  recommendationId: string;
  interventionId?: string;
  scenarioId?: string;
  winningCandidateId?: string;
  selectedCandidateId?: string;
  candidateTitle?: string;
  score?: number;
  strategy?: CityInterventionOptimizationObjective;
  rationale?: string;
  reasoning?: string;
  expectedRiskReductionPoints?: number;
  expectedRiskReduction?: number;
  expectedPopulationProtected?: number;
  expectedPopulationBenefit?: number;
  estimatedCostUsd?: number;
  estimatedCost?: number;
  estimatedDurationHours?: number;
  estimatedResponseTime?: number;
  confidence?: number;
  violatedConstraintCount?: number;
  alternatives?: any;
  createdAt?: any;
  requiresHumanApproval: true;
  dataSource?: CityInterventionDataSource;
}

export interface CityInterventionApprovalDto {
  approvalId: string;
  interventionId: string;
  recommendationId: string;
  userId: string;
  decision: 'APPROVED' | 'REJECTED';
  timestamp: string;
  operatorNotes: string;
  previousStatus: CityInterventionStatus;
  newStatus: CityInterventionStatus;
  auditEventId: string;
}

export interface CityInterventionExecutionDto {
  executionId: string;
  interventionId: string;
  approvalId: string;
  workflowTriggered: string;
  executionMode: 'ADVISORY_APPROVED_WORKFLOW';
  initiatedByUserId: string;
  startedAt: string;
  completedAt?: string;
  status: 'PENDING_WORKFLOW_DISPATCH' | 'DISPATCHED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  notes: string;
  requiresHumanApproval: true;
}

export interface CityInterventionOutcomeDto {
  outcomeId: string;
  interventionId: string;
  actualRiskReductionPoints: number;
  actualPopulationBenefited: number;
  actualCostUsd: number;
  actualDurationHours: number;
  targetAchievedPercent: number;
  validationStatus: 'SUCCESS' | 'PARTIAL' | 'UNSUCCESSFUL';
  validatedAt: string;
  validatorUserId: string;
}

export interface CityInterventionAuditDto {
  auditId: string;
  interventionId: string;
  eventType: string;
  userId?: string;
  timestamp: string;
  previousStatus: CityInterventionStatus;
  newStatus: CityInterventionStatus;
  summary: string;
  metadata?: Record<string, unknown>;
  dataSource: CityInterventionDataSource;
}

export interface CityInterventionComparisonCandidateDto {
  candidateId: string;
  title: string;
  rank: number;
  overallScore: number;
  riskReductionPoints: number;
  responseTimeHours: number;
  costUsd: number;
  serviceDisruptionPercent: number;
  populationProtectionCount: number;
  feasibilityStatus: 'FEASIBLE' | 'CONSTRAINED' | 'INFEASIBLE';
  violatedConstraintsCount: number;
}

export interface CityInterventionComparisonDto {
  interventionId?: string;
  comparedAt?: string;
  baseline?: any;
  candidates: any[];
  riskReductionComparison?: any;
  costComparison?: any;
  timeComparison?: any;
  populationProtectionComparison?: any;
  resourceComparison?: any;
  feasibilityComparison?: any;
  ranking?: any;
  bestForRiskReductionCandidateId?: string;
  bestForCostCandidateId?: string;
  bestForSpeedCandidateId?: string;
  requiresHumanApproval?: true;
  dataSource: CityInterventionDataSource;
}

export interface CityInterventionSummaryDto {
  interventionId: string;
  cityId: string;
  title: string;
  status: CityInterventionStatus;
  createdAt: string;
  updatedAt: string;
  actionCount: number;
  totalCostUsd: number;
  totalDurationHours: number;
  expectedRiskReductionPoints: number;
  populationBenefitCount: number;
  requiresHumanApproval: true;
  dataSource: CityInterventionDataSource;
}

export interface CityInterventionPlanEntity {
  interventionId: string;
  cityId: string;
  scenarioId?: string;
  predictionId?: string;
  decisionId?: string;
  title: string;
  description: string;
  status: CityInterventionStatus;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  optimizationObjective: CityInterventionOptimizationObjective;
  budgetConstraintUsd: number;
  maxDowntimeHours: number;
  domains: CityInterventionDomainDto[];
  objectives: CityInterventionObjectiveDto[];
  actions: CityInterventionActionDto[];
  sequence?: CityInterventionSequenceDto;
  dependencies: CityInterventionDependencyDto[];
  constraints: CityInterventionConstraintDto[];
  resources: CityInterventionResourceDto[];
  impacts: CityInterventionImpactDto[];
  riskReductions: CityInterventionRiskReductionDto[];
  recommendation?: CityInterventionRecommendationDto;
  comparison?: CityInterventionComparisonDto;
  approval?: CityInterventionApprovalDto;
  execution?: CityInterventionExecutionDto;
  outcome?: CityInterventionOutcomeDto;
  auditTrail: CityInterventionAuditDto[];
  validationStatus: CityInterventionValidationStatus;
  validationReasons: string[];
  requiresHumanApproval: true;
  dataSource: CityInterventionDataSource;
}
