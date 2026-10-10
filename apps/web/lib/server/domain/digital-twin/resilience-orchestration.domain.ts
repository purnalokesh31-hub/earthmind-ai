// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Citywide Resilience Orchestration Domain DTOs & Entities
// ──────────────────────────────────────────────────────────────

export type OrchestrationLifecycleStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'PLANNING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'EXECUTING'
  | 'MONITORING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type ResilienceObjectiveType =
  | 'LIFE_SAFETY'
  | 'SERVICE_CONTINUITY'
  | 'INFRASTRUCTURE_PROTECTION'
  | 'RAPID_RECOVERY'
  | 'RESOURCE_EFFICIENCY'
  | 'COST_CONTROL'
  | 'POPULATION_PROTECTION'
  | 'NETWORK_RESILIENCE';

export type ResilienceClassificationTier =
  | 'CRITICAL'
  | 'VULNERABLE'
  | 'ELEVATED'
  | 'GUARDED'
  | 'RESILIENT';

export type ResilienceDomainType =
  | 'CLIMATE'
  | 'MOBILITY'
  | 'TRANSIT'
  | 'UTILITY'
  | 'EMERGENCY'
  | 'EMERGENCY_RESPONSE'
  | 'INFRASTRUCTURE'
  | 'CITIZEN_SERVICES'
  | 'CITIZEN_INTELLIGENCE';

export type ResilienceDataSource =
  | 'SIMULATION'
  | 'PREDICTION'
  | 'HISTORICAL'
  | 'LIVE_TELEMETRY'
  | 'DERIVED';

export interface ResilienceThreatDto {
  threatId: string;
  domain: ResilienceDomainType;
  title: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  likelihoodPercent: number;
  timeToImpactHours: number;
  description: string;
}

export interface ResilienceDependencyDto {
  dependencyId: string;
  upstreamDomain: ResilienceDomainType;
  downstreamDomain: ResilienceDomainType;
  dependencyType: 'CRITICAL_POWER' | 'TRANSIT_CORRIDOR' | 'COMMUNICATION_LINK' | 'CASCADE_VECTOR';
  impactMultiplier: number;
  exposureScore: number; // 0-100
  vulnerabilityDescription: string;
}

export interface ResilienceDomainStateDto {
  domain: ResilienceDomainType;
  riskScore: number; // 0-100
  resilienceScore: number; // 0-100
  classification: ResilienceClassificationTier;
  criticalAssetsCount: number;
  activeIncidentsCount: number;
  dependenciesCount: number;
  resourceRequirementsCount: number;
  recoveryCapabilityScore: number; // 0-100
}

export interface ResilienceStateDto {
  stateId: string;
  cityId: string;
  overallResilienceScore: number; // 0-100
  classification: ResilienceClassificationTier;
  domainStates: ResilienceDomainStateDto[];
  criticalVulnerabilities: string[];
  activeThreats: ResilienceThreatDto[];
  populationExposureCount: number;
  serviceDisruptionIndex: number;
  infrastructureExposureIndex: number;
  resourceAvailabilityPercent: number;
  dependencyRiskScore: number;
  recoveryCapacityPercent: number;
  confidencePercent: number;
  dataFreshnessSeconds: number;
  dataSource: ResilienceDataSource;
  evaluatedAt: string;
}

export interface ResiliencePriorityDto {
  priorityId: string;
  domain: ResilienceDomainType;
  targetAsset: string;
  priorityClass: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NORMAL';
  urgencyScore: number; // 0-100
  rationale: string;
}

export interface ResilienceActionDto {
  actionId: string;
  domain: ResilienceDomainType;
  title: string;
  description: string;
  targetAsset: string;
  estimatedCostUsd: number;
  estimatedDowntimeHours: number;
  populationProtected: number;
  riskReductionPoints: number;
  implementationTimeHours: number;
}

export interface ResilienceObjectiveDto {
  objectiveId: string;
  objectiveType: ResilienceObjectiveType;
  weightPercent: number;
  targetValue: number;
}

export interface ResilienceConstraintDto {
  constraintId: string;
  constraintType: 'MAX_BUDGET' | 'MAX_DOWNTIME' | 'MAX_RESOURCE_UTILIZATION' | 'MIN_COVERAGE';
  limitValue: number;
  actualValue: number;
  unit: string;
  status: 'PASS' | 'WARNING' | 'VIOLATED';
}

export interface ResiliencePlanDto {
  planId: string;
  title: string;
  description: string;
  objectives: ResilienceObjectiveDto[];
  actions: ResilienceActionDto[];
  constraints: ResilienceConstraintDto[];
  totalCostUsd: number;
  totalPopulationProtected: number;
  totalRiskReduction: number;
  resilienceGainPoints: number;
  confidencePercent: number;
  requiresHumanApproval: true;
}

export interface ResilienceApprovalDto {
  approvalId: string;
  orchestrationId: string;
  userId: string;
  operatorName: string;
  operatorRole: string;
  decisionStatus: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW';
  operatorNotes: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface ResilienceOutcomeDto {
  outcomeId: string;
  orchestrationId: string;
  initialResilienceScore: number;
  finalResilienceScore: number;
  scoreImprovementDelta: number;
  executionStatus: 'COMPLETED' | 'PARTIAL' | 'ABORTED';
  evaluatedAt: string;
}

export interface ResilienceKpiDto {
  metricName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'OPTIMAL' | 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';
}

export interface ResilienceOrchestrationEntity {
  id: string;
  cityId: string;
  status: OrchestrationLifecycleStatus;
  resilienceState: ResilienceStateDto;
  dependencies: ResilienceDependencyDto[];
  priorities: ResiliencePriorityDto[];
  plan?: ResiliencePlanDto;
  approvals: ResilienceApprovalDto[];
  outcomes: ResilienceOutcomeDto[];
  kpis: ResilienceKpiDto[];
  requiresHumanApproval: true; // MANDATORY RULE
  dataSource: ResilienceDataSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResilienceOrchestrationInputDto {
  cityId: string;
  objectives: ResilienceObjectiveType[];
  constraints?: Record<string, number>;
  simulationMode?: boolean;
}
