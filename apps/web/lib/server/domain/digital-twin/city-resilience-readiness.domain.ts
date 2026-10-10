// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Citywide Resilience Coordination & Operational Preparedness Domain
// ──────────────────────────────────────────────────────────────

export type CityResilienceReadinessStatus =
  | 'DRAFT'
  | 'ASSESSING'
  | 'ASSESSED'
  | 'ANALYZING'
  | 'OPTIONS_GENERATED'
  | 'VALIDATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type PreparednessDomainType =
  | 'CLIMATE'
  | 'MOBILITY'
  | 'TRANSIT'
  | 'UTILITY'
  | 'EMERGENCY_RESPONSE'
  | 'CITIZEN_INTELLIGENCE';

export type CapabilityGapType =
  | 'RESOURCE_SHORTAGE'
  | 'CREW_SHORTAGE'
  | 'EQUIPMENT_SHORTAGE'
  | 'SERVICE_COVERAGE_GAP'
  | 'DOMAIN_READINESS_GAP'
  | 'RESPONSE_TIME_GAP'
  | 'INFRASTRUCTURE_VULNERABILITY'
  | 'DEPENDENCY_GAP'
  | 'COMMUNICATION_GAP'
  | 'DATA_CONFIDENCE_GAP';

export type ResourceAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN';

export type PreparednessStrategyType =
  | 'BALANCED_READINESS'
  | 'MAXIMIZE_RESPONSE_CAPABILITY'
  | 'MINIMIZE_PREPAREDNESS_COST'
  | 'MINIMIZE_RESPONSE_TIME'
  | 'MAXIMIZE_POPULATION_PROTECTION'
  | 'MAXIMIZE_CRITICAL_SERVICE_CONTINUITY';

export type ResilienceReadinessProvenance =
  | 'PREDICTION'
  | 'SIMULATION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'RESILIENCE_PREPAREDNESS';

export interface CityPreparednessCapabilityDto {
  capabilityId: string;
  domain: PreparednessDomainType;
  name: string;
  readinessPercentage: number;
  isCritical: boolean;
  status: 'OPTIMAL' | 'ADEQUATE' | 'DEFICIENT' | 'CRITICAL_GAP';
}

export interface CityPreparednessDomainDto {
  domain: PreparednessDomainType;
  readinessScore: number;
  status: 'HIGH' | 'MODERATE' | 'VULNERABLE' | 'CRITICAL';
  capabilities: CityPreparednessCapabilityDto[];
  dataSource: ResilienceReadinessProvenance;
}

export interface CityResourceReadinessDto {
  resourceId: string;
  name: string;
  category: 'ENGINEERING_CREW' | 'ELECTRICAL_CREW' | 'WATER_CREW' | 'TRANSPORT_CREW' | 'EMERGENCY_TEAM' | 'MOBILE_GENERATOR' | 'WATER_TANKER' | 'MEDICAL_RESOURCE' | 'TRAFFIC_CONTROL' | 'COMMUNICATION_RESOURCE';
  requiredQuantity: number;
  knownAvailableQuantity: number;
  resourceGap: number;
  availabilityStatus: ResourceAvailabilityStatus;
  readinessPercentage: number;
  isUncertain: boolean;
}

export interface CityResourceGapDto {
  gapId: string;
  domain: PreparednessDomainType;
  gapType: CapabilityGapType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidence: string;
  confidence: number;
  dataSource: ResilienceReadinessProvenance;
  requiresHumanApproval: true;
}

export interface CityOperationalRiskDto {
  riskId: string;
  riskName: string;
  impactScore: number;
  probabilityScore: number;
  combinedRiskScore: number;
  category: string;
}

export interface CityReadinessConstraintDto {
  constraintId: string;
  type: 'BUDGET' | 'RESOURCE' | 'CREW' | 'DOMAIN' | 'DEPENDENCY' | 'RESPONSE_TIME' | 'SERVICE_CONTINUITY' | 'CONFIDENCE';
  description: string;
  isViolated: boolean;
  violationMessage?: string;
}

export interface CityReadinessScoreDto {
  overallReadinessScore: number;
  criticalDomainReadiness: number;
  resourceReadiness: number;
  operationalReadiness: number;
  infrastructureReadiness: number;
  responseReadiness: number;
  crossDomainReadiness: number;
}

export interface CityPreparednessOptionDto {
  optionId: string;
  strategy: PreparednessStrategyType;
  title: string;
  description: string;
  estimatedCostUsd: number;
  estimatedPreparationTimeMinutes: number;
  expectedRiskReduction: number;
  expectedPopulationProtection: number;
  serviceContinuityScore: number;
  resourceRequirements: string[];
  constraints: CityReadinessConstraintDto[];
  confidence: number;
  dataSource: ResilienceReadinessProvenance;
  requiresHumanApproval: true;
}

export interface CityPreparednessComparisonDto {
  readinessId: string;
  options: CityPreparednessOptionDto[];
  recommendedOptionId?: string;
  comparisonMatrix: Array<{
    optionId: string;
    strategy: PreparednessStrategyType;
    riskReductionLabel: string;
    costLabel: string;
    preparationTimeLabel: string;
    populationProtectionLabel: string;
  }>;
}

export interface CityResilienceRecommendationDto {
  recommendationId: string;
  readinessId: string;
  recommendedOptionId: string;
  title: string;
  summary: string;
  rationale: string;
  expectedBenefit: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: ResilienceReadinessProvenance;
}

export interface CityReadinessApprovalDto {
  approvalId: string;
  readinessId: string;
  recommendationId: string;
  userId: string;
  userRole?: string;
  decision: 'APPROVED' | 'REJECTED';
  timestamp: string;
  operatorNotes?: string;
  requiresHumanApproval: true;
}

export interface CityReadinessAuditDto {
  auditId: string;
  readinessId: string;
  eventType: string;
  userId: string;
  summary: string;
  timestamp: string;
  provenance: ResilienceReadinessProvenance;
}

export interface CityReadinessSummaryDto {
  totalAssessments: number;
  assessedCount: number;
  awaitingApprovalCount: number;
  approvedCount: number;
  activeGapCount: number;
  averageReadinessScore: number;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: ResilienceReadinessProvenance;
  updatedAt: string;
}

export interface CityResilienceReadinessEntity {
  id: string;
  cityId: string;
  title: string;
  description: string;
  status: CityResilienceReadinessStatus;
  scores: CityReadinessScoreDto;
  domains: CityPreparednessDomainDto[];
  resourceReadiness: CityResourceReadinessDto[];
  gaps: CityResourceGapDto[];
  operationalRisks: CityOperationalRiskDto[];
  constraints: CityReadinessConstraintDto[];
  options: CityPreparednessOptionDto[];
  comparison?: CityPreparednessComparisonDto;
  recommendation?: CityResilienceRecommendationDto;
  approval?: CityReadinessApprovalDto;
  createdAt: string;
  updatedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: ResilienceReadinessProvenance;
}

export interface CityResilienceReadinessInputDto {
  cityId: string;
  title: string;
  description: string;
  targetDomains?: PreparednessDomainType[];
  budgetLimitUsd?: number;
  metadata?: Record<string, any>;
}
