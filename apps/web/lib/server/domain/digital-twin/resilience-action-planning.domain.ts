// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Cross-Domain Resilience Action Planning Domain
// ──────────────────────────────────────────────────────────────

import { ResilienceDomainType, ResilienceDataSource } from './resilience-orchestration.domain';

export type ResilienceActionCategory =
  | 'CLIMATE_MITIGATION'
  | 'FLOOD_RESPONSE'
  | 'ROAD_CLOSURE'
  | 'TRAFFIC_CONTROL'
  | 'TRANSIT_REROUTING'
  | 'UTILITY_ISOLATION'
  | 'UTILITY_REROUTING'
  | 'GENERATOR_DEPLOYMENT'
  | 'WATER_SERVICE_PROTECTION'
  | 'EMERGENCY_RESOURCE_STAGING'
  | 'MEDICAL_RESOURCE_STAGING'
  | 'INFRASTRUCTURE_PROTECTION'
  | 'PUBLIC_ALERT'
  | 'CITIZEN_COMMUNICATION'
  | 'DEBRIS_CLEARANCE'
  | 'RECOVERY_CREW_DEPLOYMENT'
  | 'INSPECTION'
  | 'MONITORING';

export type PlanningObjectiveMode =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_DOWNTIME'
  | 'MINIMIZE_COST'
  | 'MINIMIZE_POPULATION_IMPACT'
  | 'MAXIMIZE_SERVICE_CONTINUITY'
  | 'MAXIMIZE_RECOVERY_SPEED'
  | 'BALANCED';

export type ActionPlanClassification =
  | 'OPTIMAL'
  | 'RECOMMENDED'
  | 'ACCEPTABLE'
  | 'HIGH_RISK'
  | 'INFEASIBLE';

export type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ConflictType =
  | 'RESOURCE'
  | 'TEMPORAL'
  | 'OPERATIONAL'
  | 'SAFETY'
  | 'SERVICE'
  | 'DEPENDENCY';

export interface ResilienceActionCandidateDto {
  actionId: string;
  category: ResilienceActionCategory;
  domain: ResilienceDomainType;
  title: string;
  description: string;
  targetAsset: string;
  reason: string;
  riskReductionPoints: number;
  estimatedCostUsd: number;
  estimatedDurationHours: number;
  populationProtected: number;
  requiredResourcesCount: number;
  confidencePercent: number;
  dataSource: ResilienceDataSource;
}

export interface ResilienceActionDependencyDto {
  dependencyId: string;
  prerequisiteActionId: string;
  successorActionId: string;
  relationType: 'PREREQUISITE' | 'BLOCKING' | 'PARALLEL_OK' | 'CONDITIONAL';
  rationale: string;
}

export interface ResilienceActionConflictDto {
  conflictId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  actionsInvolved: string[];
  reason: string;
  resolutionSuggestion: string;
}

export interface ResilienceActionStepDto {
  stepNumber: number;
  actionId: string;
  domain: ResilienceDomainType;
  category: ResilienceActionCategory;
  title: string;
  executionMode: 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL';
  estimatedStartHours: number;
  estimatedDurationHours: number;
  dependencies: string[];
  requiredResources: string[];
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ResilienceActionParallelGroupDto {
  groupId: string;
  groupName: string;
  stepNumbers: number[];
  actionsInvolved: string[];
}

export interface ResilienceActionSequenceDto {
  sequenceId: string;
  totalStepsCount: number;
  totalDurationHours: number;
  steps: ResilienceActionStepDto[];
  parallelGroups: ResilienceActionParallelGroupDto[];
}

export interface ResilienceActionImpactDto {
  baselineResilienceScore: number;
  projectedResilienceScore: number;
  resilienceImprovementDelta: number;
  totalRiskReductionPercent: number;
  totalPopulationProtected: number;
  totalServiceRestorationIndex: number;
  remainingVulnerabilitiesCount: number;
}

export interface ResilienceActionRiskDto {
  riskType: string;
  probabilityPercent: number;
  potentialImpact: string;
  mitigationStrategy: string;
}

export interface ResilienceActionBenefitDto {
  benefitDomain: ResilienceDomainType;
  metricName: string;
  projectedGain: number;
  unit: string;
}

export interface ResilienceActionConstraintDto {
  constraintName: string;
  limitValue: number;
  actualValue: number;
  unit: string;
  status: 'PASS' | 'WARNING' | 'VIOLATED';
}

export interface ResilienceActionPlanComparisonDto {
  planId: string;
  title: string;
  objectiveMode: PlanningObjectiveMode;
  overallScore: number; // 0-100
  classification: ActionPlanClassification;
  riskReductionPercent: number;
  totalCostUsd: number;
  downtimeHours: number;
  populationImpact: number;
  resourceUtilizationPercent: number;
  resilienceImprovementDelta: number;
}

export interface ResilienceActionRecommendationDto {
  recommendedPlanId: string;
  planTitle: string;
  classification: ActionPlanClassification;
  decisionReason: string;
  expectedBenefitSummary: string;
  remainingRiskSummary: string;
  estimatedCostUsd: number;
  estimatedDowntimeHours: number;
  populationProtected: number;
  requiresHumanApproval: true;
  alternativePlanIds: string[];
}

export interface ResilienceActionApprovalDto {
  approvalId: string;
  planId: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  decisionStatus: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW';
  operatorNotes: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface ResilienceActionAuditDto {
  eventId: string;
  orchestrationId: string;
  planId: string;
  eventType:
    | 'ACTION_PLAN_CREATED'
    | 'CANDIDATES_GENERATED'
    | 'DEPENDENCIES_ANALYZED'
    | 'CONFLICTS_DETECTED'
    | 'SEQUENCE_GENERATED'
    | 'PLANS_COMPARED'
    | 'RECOMMENDATION_GENERATED'
    | 'HUMAN_REVIEW_REQUIRED';
  timestamp: string;
  actor: string;
  metadata: Record<string, any>;
}

export interface ResilienceActionPlanEntity {
  id: string;
  orchestrationId: string;
  cityId: string;
  title: string;
  objectiveMode: PlanningObjectiveMode;
  classification: ActionPlanClassification;
  overallScore: number;
  candidates: ResilienceActionCandidateDto[];
  dependencies: ResilienceActionDependencyDto[];
  conflicts: ResilienceActionConflictDto[];
  sequence: ResilienceActionSequenceDto;
  impact: ResilienceActionImpactDto;
  risks: ResilienceActionRiskDto[];
  benefits: ResilienceActionBenefitDto[];
  constraints: ResilienceActionConstraintDto[];
  requiresHumanApproval: true;
  dataSource: ResilienceDataSource;
  createdAt: Date;
  updatedAt: Date;
}
