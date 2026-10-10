// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// Human Command & Authorization Center Domain Models
// Mandatory Human Governance, Operator Authorization & Safety Invariants
// ──────────────────────────────────────────────────────────────

import {
  GovernanceAuthorizationLevel,
  GovernanceRiskTier,
  GovernanceConfidenceLevel,
  GovernanceProvenanceType,
} from './city-governance.domain';

export type CityCommandCaseStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'EVIDENCE_REQUESTED'
  | 'READY_FOR_DECISION'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type CityCommandDecisionType =
  | 'APPROVE'
  | 'REJECT'
  | 'REQUEST_MORE_EVIDENCE'
  | 'ESCALATE'
  | 'DEFER'
  | 'CANCEL';

export type CityCommandSourceType =
  | 'PREDICTION'
  | 'SIMULATION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'GOVERNANCE';

export type CityCommandEvidenceStatus =
  | 'OPEN'
  | 'PARTIALLY_SATISFIED'
  | 'SATISFIED'
  | 'CANCELLED';

export type CityCommandEscalationStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED';

// ── DTOs & Interfaces ──

export interface CityCommandOperatorDto {
  userId: string;
  userName?: string;
  role: string;
  authorizationLevel: GovernanceAuthorizationLevel;
}

export interface CityCommandRiskContextDto {
  riskScore: number;
  riskTier: GovernanceRiskTier;
  explanation: string;
  impactedDomainCount: number;
}

export interface CityCommandConfidenceContextDto {
  confidenceScore: number;
  confidenceLevel: GovernanceConfidenceLevel;
  availableEvidenceCount: number;
  requiredEvidenceCount: number;
  explanation: string;
}

export interface CityCommandEvidenceDto {
  evidenceRequestId: string;
  caseId: string;
  requestedBy: string;
  reason: string;
  requiredEvidence: string[];
  submittedTelemetryIds?: string[];
  timestamp: string;
  status: CityCommandEvidenceStatus;
}

export interface CityCommandEscalationDto {
  escalationId: string;
  caseId: string;
  fromAuthorizationLevel: GovernanceAuthorizationLevel;
  toAuthorizationLevel: GovernanceAuthorizationLevel;
  reason: string;
  triggeringPolicies: string[];
  requestedBy: string;
  timestamp: string;
  status: CityCommandEscalationStatus;
  requiresHumanApproval: true;
}

export interface CityCommandRecommendationDto {
  recommendationId: string;
  title: string;
  summary: string;
  targetId: string;
  expectedRiskReductionDelta: number;
  estimatedCostUsd: number;
  estimatedDurationHours: number;
  requiresHumanApproval: true;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandCaseInputDto {
  title: string;
  description: string;
  cityId: string;
  sourceType: CityCommandSourceType;
  sourceReferenceId: string;
  riskScore: number;
  riskTier: GovernanceRiskTier;
  confidenceScore: number;
  confidenceLevel: GovernanceConfidenceLevel;
  populationImpact?: number;
  serviceImpact?: number;
  financialImpactUsd?: number;
  requiredAuthorizationLevel?: GovernanceAuthorizationLevel;
  recommendation?: CityCommandRecommendationDto;
  metadata?: Record<string, unknown>;
}

export interface CityCommandCaseEntity {
  caseId: string;
  title: string;
  description: string;
  cityId: string;
  sourceType: CityCommandSourceType;
  sourceReferenceId: string;
  riskScore: number;
  riskTier: GovernanceRiskTier;
  confidenceScore: number;
  confidenceLevel: GovernanceConfidenceLevel;
  populationImpact: number;
  serviceImpact: number;
  financialImpactUsd: number;
  requiredAuthorizationLevel: GovernanceAuthorizationLevel;
  status: CityCommandCaseStatus;
  recommendation?: CityCommandRecommendationDto;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandApprovalRequestDto {
  caseId: string;
  decision: CityCommandDecisionType;
  reason: string;
  operatorNotes?: string;
  evidenceReferences?: string[];
  confirmationToken?: string;
  clientTimestamp?: string;
}

export interface CityCommandApprovalDecisionDto {
  decisionId: string;
  caseId: string;
  decision: CityCommandDecisionType;
  operator: CityCommandOperatorDto;
  reason: string;
  operatorNotes?: string;
  evidenceReferences?: string[];
  confirmationToken?: string;
  decidedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandAuthorizationDto {
  authorizationId: string;
  caseId: string;
  decisionId: string;
  authorizedBy: CityCommandOperatorDto;
  requiredLevel: GovernanceAuthorizationLevel;
  isFullyAuthorized: boolean;
  requiresDoubleSignOff: boolean;
  secondSignOffBy?: CityCommandOperatorDto;
  authorizedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandQueueItemDto {
  queueId: string;
  caseId: string;
  title: string;
  cityId: string;
  queuePriority: number;
  priorityScore: number;
  priorityFactors: string[];
  riskTier: GovernanceRiskTier;
  confidenceLevel: GovernanceConfidenceLevel;
  requiredAuthorizationLevel: GovernanceAuthorizationLevel;
  ageMinutes: number;
  escalationLevel: string;
  status: CityCommandCaseStatus;
  requiresHumanApproval: true;
}

export interface CityCommandAuditDto {
  auditId: string;
  caseId: string;
  eventType: string;
  operatorUserId?: string;
  operatorRole?: string;
  previousStatus?: CityCommandCaseStatus;
  newStatus?: CityCommandCaseStatus;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandHistoryDto {
  eventId: string;
  caseId: string;
  eventType: string;
  userId?: string;
  timestamp: string;
  previousStatus?: CityCommandCaseStatus;
  newStatus?: CityCommandCaseStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
  provenance: GovernanceProvenanceType;
}

export interface CityCommandDecisionComparisonDto {
  caseId: string;
  decisionOptions: Array<{
    decisionType: CityCommandDecisionType;
    expectedConsequence: string;
    riskImpactDelta: string;
    populationProtectionScore: number;
    downtimeDurationHours: number;
    costUsd: number;
    requiresHumanApproval: true;
    provenance: GovernanceProvenanceType;
  }>;
  recommendedDecision: CityCommandDecisionType;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}

export interface CityCommandSummaryDto {
  totalCases: number;
  pendingReviewCount: number;
  underReviewCount: number;
  evidenceRequestedCount: number;
  approvedCount: number;
  rejectedCount: number;
  escalatedCount: number;
  activeQueueItems: number;
  averageDecisionTimeMinutes: number;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: GovernanceProvenanceType;
  updatedAt: string;
}
