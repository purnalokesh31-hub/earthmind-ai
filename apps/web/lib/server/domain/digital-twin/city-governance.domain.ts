// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// Citywide Intelligence Governance & Policy Engine Domain Models
// Mandatory Human Governance & Safety Boundary
// ──────────────────────────────────────────────────────────────

export type GovernancePolicyStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEPRECATED'
  | 'ARCHIVED';

export type GovernancePolicyCategory =
  | 'SAFETY'
  | 'HUMAN_AUTHORIZATION'
  | 'RISK'
  | 'CONFIDENCE'
  | 'RESOURCE'
  | 'OPERATIONAL'
  | 'DATA_PROVENANCE'
  | 'AI_AGENT'
  | 'INTERVENTION'
  | 'EMERGENCY_ESCALATION'
  | 'RBAC'
  | 'AUDIT';

export type GovernanceRiskTier =
  | 'LOW'
  | 'GUARDED'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL';

export type GovernanceConfidenceLevel =
  | 'HIGH_CONFIDENCE'
  | 'MEDIUM_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_CONFIDENCE';

export type GovernanceAuthorizationLevel =
  | 'OPERATOR'
  | 'SENIOR_OPERATOR'
  | 'DOMAIN_MANAGER'
  | 'CITY_COMMANDER'
  | 'EMERGENCY_COMMANDER';

export type GovernanceDecisionType =
  | 'ALLOW_FOR_HUMAN_REVIEW'
  | 'ESCALATE_FOR_REVIEW'
  | 'BLOCK'
  | 'REQUEST_MORE_EVIDENCE'
  | 'POLICY_VIOLATION'
  | 'REQUIRES_AUTHORIZATION';

export type GovernanceProvenanceType =
  | 'PREDICTION'
  | 'SIMULATION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'GOVERNANCE';

export type GovernanceViolationSeverity =
  | 'INFO'
  | 'WARNING'
  | 'HIGH'
  | 'CRITICAL';

export type GovernanceEscalationLevel =
  | 'NONE'
  | 'OPERATOR'
  | 'DOMAIN_MANAGER'
  | 'CITY_COMMANDER'
  | 'EMERGENCY_COMMANDER';

// ── DTOs & Interfaces ──

export interface GovernancePolicyScopeDto {
  cityId?: string;
  domains?: string[];
  zones?: string[];
  environment?: 'STAGING' | 'PRODUCTION' | 'ALL';
}

export interface GovernancePolicyConditionDto {
  field: string;
  operator: 'GTE' | 'LTE' | 'EQ' | 'NEQ' | 'GT' | 'LT' | 'IN' | 'CONTAINS';
  targetValue: string | number | boolean | string[];
  explanation: string;
}

export interface GovernancePolicyActionDto {
  actionType: 'REQUIRE_APPROVAL' | 'ESCALATE' | 'BLOCK' | 'REQUEST_EVIDENCE' | 'LOG_WARNING';
  authorizationLevel?: GovernanceAuthorizationLevel;
  message: string;
}

export interface GovernancePolicyRuleDto {
  ruleId: string;
  name: string;
  category: GovernancePolicyCategory;
  conditions: GovernancePolicyConditionDto[];
  action: GovernancePolicyActionDto;
  priority: number;
}

export interface GovernancePolicyThresholdDto {
  lowRiskMax: number; // e.g. 20
  guardedRiskMax: number; // e.g. 40
  elevatedRiskMax: number; // e.g. 60
  highRiskMax: number; // e.g. 80
  criticalRiskMin: number; // e.g. 81
  highConfidenceMin: number; // e.g. 85
  mediumConfidenceMin: number; // e.g. 65
  lowConfidenceMin: number; // e.g. 40
}

export interface GovernancePolicyEscalationDto {
  escalationId: string;
  triggerCategory: GovernancePolicyCategory;
  requiredLevel: GovernanceAuthorizationLevel;
  explanation: string;
}

export interface GovernanceAuthorizationRuleDto {
  actionType: string;
  minRiskTier: GovernanceRiskTier;
  requiredLevel: GovernanceAuthorizationLevel;
  requiresDoubleSignOff: boolean;
}

export interface GovernanceProvenanceDto {
  sourcePipeline: GovernanceProvenanceType;
  upstreamIds: string[];
  timestamp: string;
  isVerified: boolean;
}

export interface GovernanceRiskThresholdDto {
  riskTier: GovernanceRiskTier;
  minScore: number;
  maxScore: number;
  defaultAuthorizationLevel: GovernanceAuthorizationLevel;
}

export interface GovernanceConfidenceThresholdDto {
  confidenceLevel: GovernanceConfidenceLevel;
  minScorePercent: number;
  maxScorePercent: number;
  recommendedAction: string;
}

export interface GovernanceEscalationRuleDto {
  ruleId: string;
  triggerReason: string;
  sourceCategory: GovernancePolicyCategory;
  targetLevel: GovernanceAuthorizationLevel;
}

export interface GovernancePolicyInputDto {
  name: string;
  description: string;
  category: GovernancePolicyCategory;
  priority?: number;
  scope?: GovernancePolicyScopeDto;
  rules?: GovernancePolicyRuleDto[];
  thresholds?: Partial<GovernancePolicyThresholdDto>;
  escalationRules?: GovernancePolicyEscalationDto[];
  authorizationLevelRequired?: GovernanceAuthorizationLevel;
  createdBy?: string;
}

export interface GovernancePolicyEntity {
  policyId: string;
  name: string;
  description: string;
  version: number;
  status: GovernancePolicyStatus;
  category: GovernancePolicyCategory;
  priority: number;
  scope: GovernancePolicyScopeDto;
  rules: GovernancePolicyRuleDto[];
  thresholds: GovernancePolicyThresholdDto;
  escalationRules: GovernancePolicyEscalationDto[];
  authorizationRequirements: GovernanceAuthorizationRuleDto[];
  provenance: GovernanceProvenanceType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  requiresHumanApproval: true;
}

export interface GovernancePolicyViolationDto {
  violationId: string;
  policyId: string;
  policyName: string;
  severity: GovernanceViolationSeverity;
  category: GovernancePolicyCategory;
  message: string;
  reason: string;
  evidence: Record<string, unknown>;
  recommendedResolution: string;
  blocking: boolean;
  requiresHumanApproval: true;
  provenance: GovernanceProvenanceType;
}

export interface GovernancePolicyEvaluationDto {
  evaluationId: string;
  targetId: string;
  cityId: string;
  governanceDecision: GovernanceDecisionType;
  riskTier: GovernanceRiskTier;
  riskScore: number;
  confidenceLevel: GovernanceConfidenceLevel;
  confidenceScore: number;
  violations: GovernancePolicyViolationDto[];
  escalationLevel: GovernanceEscalationLevel;
  requiredAuthorizationLevel: GovernanceAuthorizationLevel;
  explanation: string;
  missingEvidence: string[];
  evaluatedAt: string;
  requiresHumanApproval: true;
  provenance: GovernanceProvenanceType;
}

export interface GovernancePolicyDecisionDto {
  decisionId: string;
  evaluationId: string;
  governanceDecision: GovernanceDecisionType;
  authorizationLevelRequired: GovernanceAuthorizationLevel;
  explanation: string;
  timestamp: string;
  requiresHumanApproval: true;
  provenance: GovernanceProvenanceType;
}

export interface GovernancePolicyOverrideDto {
  overrideId: string;
  policyId: string;
  evaluationId: string;
  operatorUserId: string;
  authorizationLevel: GovernanceAuthorizationLevel;
  reason: string;
  timestamp: string;
  expiresAt: string;
  auditReference: string;
  requiresHumanApproval: true;
}

export interface GovernancePolicyAuditDto {
  auditId: string;
  eventType: string;
  policyId?: string;
  evaluationId?: string;
  userId?: string;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  provenance: GovernanceProvenanceType;
}

export interface GovernancePolicyHistoryDto {
  policyId: string;
  version: number;
  status: GovernancePolicyStatus;
  changedBy: string;
  timestamp: string;
  changeSummary: string;
}

export interface GovernanceGovernanceSummaryDto {
  activePolicyCount: number;
  totalEvaluations: number;
  activeViolationsCount: number;
  pendingEscalationsCount: number;
  activeOverridesCount: number;
  riskDistribution: Record<GovernanceRiskTier, number>;
  governanceStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL_GOVERNANCE_BLOCKED';
  updatedAt: string;
  requiresHumanApproval: true;
  provenance: GovernanceProvenanceType;
}
