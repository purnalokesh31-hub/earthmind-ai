// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 3/6
// Citywide Decision Fusion & Multi-Objective Action Optimization Domain
// ──────────────────────────────────────────────────────────────

import { ResilienceDomainType, ResilienceDataSource } from './resilience-orchestration.domain';

export type CityDecisionStatus =
  | 'DRAFT'
  | 'READY'
  | 'EVALUATING'
  | 'RANKED'
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'VALIDATED'
  | 'ARCHIVED';

export type FusionSignalSource = 'LIVE' | 'HISTORICAL' | 'PREDICTION' | 'SIMULATION';

export type DecisionFeasibilityStatus = 'FEASIBLE' | 'CONDITIONALLY_FEASIBLE' | 'INFEASIBLE';

export type DecisionOptimizationObjective =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_POPULATION_IMPACT'
  | 'MINIMIZE_DOWNTIME'
  | 'MINIMIZE_COST'
  | 'MAXIMIZE_RESILIENCE'
  | 'MAXIMIZE_SERVICE_RECOVERY'
  | 'BALANCED';

export interface CityDecisionSignalDto {
  signalId: string;
  domain: ResilienceDomainType;
  title: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidencePercent: number;
  location: string;
  populationImpactCount: number;
  serviceImpactIndex: number;
  infrastructureImpactScore: number;
  source: FusionSignalSource;
  dataSource: ResilienceDataSource;
  timestamp: string;
}

export interface CityDecisionCandidateDto {
  candidateId: string;
  actionType: string;
  title: string;
  description: string;
  affectedDomains: ResilienceDomainType[];
  affectedZones: string[];
  requiredResources: string[];
  estimatedCostUsd: number;
  estimatedDurationHours: number;
  expectedPopulationBenefit: number;
  expectedServiceImprovementIndex: number;
  expectedRiskReductionPoints: number;
  expectedResilienceImprovementPoints: number;
  feasibilityStatus: DecisionFeasibilityStatus;
  confidencePercent: number;
  requiresHumanApproval: true;
}

export interface CityDecisionConstraintDto {
  constraintName: string;
  constraintType: 'HARD' | 'SOFT';
  limitValue: number;
  actualValue: number;
  unit: string;
  isSatisfied: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface CityDecisionObjectiveDto {
  objectiveMode: DecisionOptimizationObjective;
  riskWeight: number;
  populationWeight: number;
  costWeight: number;
  downtimeWeight: number;
  resilienceWeight: number;
  serviceRecoveryWeight: number;
}

export interface CityDecisionScoreDto {
  overallScore: number; // 0-100
  riskReductionScore: number;
  populationBenefitScore: number;
  costEfficiencyScore: number;
  downtimeReductionScore: number;
  resilienceScore: number;
  serviceRecoveryScore: number;
}

export interface CityDecisionResourceDto {
  resourceType: string;
  demandCount: number;
  availableCount: number;
  utilizationPercent: number;
  shortfallCount: number;
  isConstrained: boolean;
}

export interface CityDecisionImpactDto {
  populationImpactReduction: number;
  serviceDisruptionReductionIndex: number;
  infrastructureRiskReductionPoints: number;
  responseTimeImprovementMinutes: number;
  downtimeReductionHours: number;
  financialImpactUsd: number;
  resilienceImprovementPoints: number;
  dataSource: ResilienceDataSource;
}

export interface CityDecisionRiskDto {
  riskName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  mitigationStrategy: string;
}

export interface CityDecisionRecommendationDto {
  recommendationId: string;
  candidateId: string;
  actionTitle: string;
  reason: string;
  whyNow: string;
  supportingSignals: string[];
  expectedBenefitsSummary: string;
  risksSummary: string;
  constraintsSummary: string;
  confidencePercent: number;
  requiresHumanApproval: true;
  alternativeCandidateIds: string[];
}

export interface CityDecisionComparisonDto {
  rank: number;
  candidateId: string;
  title: string;
  score: number;
  costUsd: number;
  riskReductionPoints: number;
  populationBenefit: number;
  downtimeHours: number;
  feasibilityStatus: DecisionFeasibilityStatus;
  confidencePercent: number;
}

export interface CityDecisionApprovalDto {
  approvalId: string;
  decisionId: string;
  recommendationId: string;
  operatorUserId: string;
  operatorName: string;
  operatorRole: string;
  decisionStatus: 'APPROVED' | 'REJECTED' | 'DEFERRED';
  notes: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface CityDecisionAuditDto {
  eventId: string;
  decisionId: string;
  eventType:
    | 'DECISION_CREATED'
    | 'SIGNALS_FUSED'
    | 'CANDIDATES_GENERATED'
    | 'CONSTRAINTS_EVALUATED'
    | 'RESOURCES_EVALUATED'
    | 'CANDIDATES_RANKED'
    | 'RECOMMENDATION_GENERATED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'DEFERRED';
  timestamp: string;
  userId?: string;
  metadata: Record<string, any>;
}

export interface CityDecisionSummaryDto {
  decisionId: string;
  cityId: string;
  status: CityDecisionStatus;
  overallScore: number;
  topCandidateTitle: string;
  requiresHumanApproval: true;
  createdAt: string;
}

export interface CityDecisionHistoryDto {
  decisionId: string;
  status: CityDecisionStatus;
  operatorName?: string;
  decisionStatus?: 'APPROVED' | 'REJECTED' | 'DEFERRED';
  evaluatedAt: string;
}

export interface CityDecisionEntity {
  id: string;
  cityId: string;
  status: CityDecisionStatus;
  signals: CityDecisionSignalDto[];
  candidates: CityDecisionCandidateDto[];
  constraints: CityDecisionConstraintDto[];
  resources: CityDecisionResourceDto[];
  impacts: Map<string, CityDecisionImpactDto>;
  scores: Map<string, CityDecisionScoreDto>;
  comparisons: CityDecisionComparisonDto[];
  recommendation?: CityDecisionRecommendationDto;
  approvals: CityDecisionApprovalDto[];
  auditLogs: CityDecisionAuditDto[];
  requiresHumanApproval: true; // MANDATORY RULE
  dataSource: ResilienceDataSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityDecisionInputDto {
  cityId: string;
  objectiveMode?: DecisionOptimizationObjective;
  customWeights?: Partial<CityDecisionObjectiveDto>;
}
