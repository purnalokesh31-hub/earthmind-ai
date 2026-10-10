// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Citywide Response Execution Readiness, Monitoring & Outcome Intelligence Domain
// ──────────────────────────────────────────────────────────────

export type CityResponseReadinessStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'ASSESSING'
  | 'NOT_READY'
  | 'READY'
  | 'READY_FOR_REVIEW'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_HUMAN_AUTHORIZATION'
  | 'APPROVED'
  | 'AUTHORIZED'
  | 'HANDOFF_READY'
  | 'HANDED_OFF'
  | 'IN_PROGRESS'
  | 'MONITORING'
  | 'DEVIATION_DETECTED'
  | 'ESCALATION_RECOMMENDED'
  | 'OUTCOME_VALIDATING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'OUTCOME_PENDING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface CityResponseReadinessAccountabilityDto {
  eventId: string;
  readinessId: string;
  previousStatus: CityResponseReadinessStatus;
  newStatus: CityResponseReadinessStatus;
  userId: string;
  operatorNotes?: string;
  timestamp: string;
}

export type CityResponseReadinessState = 'READY' | 'CONDITIONALLY_READY' | 'NOT_READY' | 'BLOCKED' | 'PARTIALLY_READY';

export type ReadinessCheckCategory =
  | 'RESOURCE_READY'
  | 'RESOURCE_SHORTAGE'
  | 'DEPENDENCY_READY'
  | 'DEPENDENCY_BLOCKED'
  | 'SAFETY_READY'
  | 'SAFETY_BLOCKED'
  | 'DOMAIN_CONFLICT'
  | 'BUDGET_BLOCKED'
  | 'AUTHORIZATION_REQUIRED'
  | 'DATA_UNAVAILABLE';

export type ReadinessBlockingReason =
  | 'RESOURCE_CONSTRAINT'
  | 'MISSING_APPROVAL'
  | 'DEPENDENCY_NOT_READY'
  | 'CREW_UNAVAILABLE'
  | 'SAFETY_CHECK_INCOMPLETE'
  | 'COMMUNICATION_NOT_READY'
  | 'TIME_WINDOW_INVALID'
  | 'HIGH_RISK_REQUIRES_REVIEW'
  | 'UNKNOWN_RESOURCE_STATE'
  | 'DATA_UNAVAILABLE';

export type OutcomeStatus = 'OUTCOME_MATCH' | 'PARTIAL_MATCH' | 'OUTCOME_MISMATCH' | 'OUTCOME_UNKNOWN' | 'RESIDUAL_RISK';

export type EvidenceStatus = 'ATTACHED' | 'MISSING' | 'PENDING_VERIFICATION' | 'INSUFFICIENT';

export type ReadinessRiskLevel = 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type ReadinessProvenance =
  | 'PREDICTION'
  | 'SIMULATION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'RESPONSE_READINESS'
  | 'EXECUTION_READINESS'
  | 'OUTCOME_VALIDATION'
  | 'OPERATIONAL_EVIDENCE'
  | 'LIVE_TELEMETRY'
  | 'ESTIMATION'
  | 'OPERATOR_INPUT';

export type DeviationSeverity = 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export interface CityResponseDependencyCheckDto {
  dependencyId: string;
  prerequisiteActionId: string;
  description: string;
  status: 'SATISFIED' | 'PENDING' | 'BLOCKED' | 'FAILED';
  isBlocking: boolean;
  satisfactionEvidenceId?: string;
}

export interface CityResponseResourceCheckDto {
  resourceId: string;
  name: string;
  category: string;
  requiredQuantity: number;
  allocatedQuantity: number;
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
  location?: string;
  isUncertain: boolean;
}

export interface CityResponseSafetyCheckDto {
  safetyCheckId: string;
  title: string;
  description: string;
  status: 'PASSED' | 'PENDING' | 'FAILED';
  isCritical: boolean;
}

export interface CityResponseReadinessCheckDto {
  checkId: string;
  category: ReadinessCheckCategory;
  title: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'DATA_UNAVAILABLE';
  description: string;
  evidence?: string;
  requiresHumanApproval: true;
}

export interface CityResponseReadinessScoreDto {
  readinessScore: number; // 0 - 100
  classification: CityResponseReadinessState;
  resourceReadinessScore: number;
  dependencyReadinessScore: number;
  safetyReadinessScore: number;
  budgetReadinessScore: number;
  dataAvailabilityScore: number;
  authorizationStateScore: number;
  reasons: string[];
  requiresHumanApproval: true;
  dataSource: ReadinessProvenance;
}

export interface CityResponseMonitoringSignalDto {
  signalId: string;
  readinessId: string;
  domain: string; // utility, road, transit, emergency, flood, population, downtime
  signalType: 'UTILITY_RESTORATION' | 'ROAD_REOPENING' | 'TRANSIT_RECOVERY' | 'EMERGENCY_TIMING' | 'FLOOD_REDUCTION' | 'POPULATION_IMPACT' | 'INFRASTRUCTURE_DOWNTIME';
  currentValue: number;
  targetValue: number;
  unit: string;
  confidence: number;
  provenance: ReadinessProvenance;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface CityResponseExpectedOutcomeDto {
  interventionId: string;
  expectedRiskReduction: number;
  expectedPopulationBenefit: number;
  expectedServiceRecoveryMinutes: number;
  expectedDowntimeMinutes: number;
  expectedCostUsd: number;
}

export interface CityResponseOutcomeObservationDto {
  observationId: string;
  readinessId: string;
  observedRiskReduction: number;
  observedPopulationBenefit: number;
  observedServiceRecoveryMinutes: number;
  observedDowntimeMinutes: number;
  observedCostUsd: number;
  provenance: ReadinessProvenance;
  timestamp: string;
  recordedByUserId: string;
}

export interface CityResponseDeviationDto {
  deviationId: string;
  readinessId: string;
  severity: DeviationSeverity;
  affectedDomain: string;
  riskReductionDelta: number;
  populationBenefitDelta: number;
  serviceRecoveryDeltaMinutes: number;
  downtimeDeltaMinutes: number;
  costDeltaUsd: number;
  explanation: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface CityResponseEscalationDto {
  escalationId: string;
  readinessId: string;
  escalationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  timestamp: string;
}

export interface CityResponseOutcomeValidationDto {
  validationId: string;
  readinessId: string;
  outcomeStatus: OutcomeStatus;
  evidenceStatus: EvidenceStatus;
  residualRiskScore: number;
  validationSummary: string;
  requiresHumanApproval: true;
  timestamp: string;
}

export interface CityResponseFeedbackDto {
  feedbackId: string;
  readinessId: string;
  lessonsLearned: string[];
  modelAccuracyPercentage: number;
  suggestedPlanAdjustments: string[];
  timestamp: string;
}

export interface CityResponseReadinessChecklistItem {
  itemId: string;
  category: 'PRE_ACTION_CHECKS' | 'HANDOFF_CHECKS' | 'POST_ACTION_CHECKS';
  title: string;
  description: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  verificationEvidenceId?: string;
  requiredForReadiness: boolean;
}

export interface CityResponseReadinessChecklistDto {
  readinessId: string;
  items: CityResponseReadinessChecklistItem[];
  totalCount: number;
  completedCount: number;
  isFullySatisfied: boolean;
  requiresHumanApproval: true;
}

export interface CityResponseReadinessCrewDto {
  crewId: string;
  teamName: string;
  specialization: string;
  requiredStaffCount: number;
  assignedStaffCount: number;
  readinessStatus: 'STANDBY' | 'DISPATCHED' | 'UNAVAILABLE' | 'UNKNOWN';
  contactChannel?: string;
}

export interface CityResponseReadinessActionDto {
  actionId: string;
  title: string;
  description: string;
  targetSector: string;
  estimatedDurationMinutes: number;
  readinessState: CityResponseReadinessState;
  blockingReasons: ReadinessBlockingReason[];
  dependencies: CityResponseDependencyCheckDto[];
  resources: CityResponseResourceCheckDto[];
  crews: CityResponseReadinessCrewDto[];
  requiresHumanApproval: true;
}

export interface CityResponseReadinessHandoffDto {
  handoffId: string;
  readinessId: string;
  interventionId: string;
  approvedRecommendationId: string;
  assignedOperationalOwner: string;
  actionSequence: string[];
  dependenciesCount: number;
  resourceRequirementsCount: number;
  crewRequirementsCount: number;
  geographicContext: {
    cityId: string;
    affectedZones: string[];
  };
  timingWindow: {
    recommendedStartWindow: string;
    estimatedDurationMinutes: number;
  };
  riskSummary: {
    riskLevel: ReadinessRiskLevel;
    riskScore: number;
  };
  safetyChecklistCompleted: boolean;
  expectedOutcomes: string[];
  evidenceRequirements: string[];
  operatorNotes?: string;
  handoffStatus: 'READY' | 'PENDING' | 'COMPLETED' | 'BLOCKED';
  createdTimestamp: string;
  requiresHumanApproval: true;
}

export interface CityResponseReadinessApprovalDto {
  approvalId: string;
  readinessId: string;
  interventionId: string;
  userId: string;
  userName?: string;
  userRole?: string;
  decision: 'APPROVED' | 'REJECTED';
  operatorNotes?: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface CityResponseReadinessOutcomeDto {
  outcomeId: string;
  readinessId: string;
  interventionId: string;
  expectedOutcome: string;
  observedOutcome?: string;
  outcomeStatus: OutcomeStatus;
  evidenceId?: string;
  evidenceStatus: EvidenceStatus;
  residualRiskScore: number;
  recordedByUserId: string;
  validatedByUserId?: string;
  recordedTimestamp: string;
  validatedTimestamp?: string;
  requiresHumanApproval: true;
}

export interface CityResponseAuditDto {
  auditId: string;
  readinessId: string;
  eventType: string;
  userId: string;
  summary: string;
  timestamp: string;
  provenance: ReadinessProvenance;
}

export interface CityResponseReadinessRiskDto {
  readinessId: string;
  readinessRiskScore: number;
  riskLevel: ReadinessRiskLevel;
  contributingFactors: Array<{
    factor: string;
    impactScore: number;
    description: string;
  }>;
  requiresHumanApproval: true;
  advisoryOnly: true;
}

export interface CityResponseReadinessSummaryDto {
  totalAssessments: number;
  readyForHandoffCount: number;
  blockedCount: number;
  awaitingApprovalCount: number;
  handedOffCount: number;
  outcomesValidatedCount: number;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: ReadinessProvenance;
  updatedAt: string;
}

export interface CityResponseReadinessEntity {
  readinessId: string;
  interventionId: string;
  cityId: string;
  title: string;
  description: string;
  status: CityResponseReadinessStatus;
  readinessState: CityResponseReadinessState;
  scores: CityResponseReadinessScoreDto;
  checks: CityResponseReadinessCheckDto[];
  blockingReasons: ReadinessBlockingReason[];
  actions: CityResponseReadinessActionDto[];
  checklist: CityResponseReadinessChecklistDto;
  monitoringSignals: CityResponseMonitoringSignalDto[];
  expectedOutcome?: CityResponseExpectedOutcomeDto;
  observedOutcome?: CityResponseOutcomeObservationDto;
  deviation?: CityResponseDeviationDto;
  escalation?: CityResponseEscalationDto;
  validation?: CityResponseOutcomeValidationDto;
  feedback?: CityResponseFeedbackDto;
  handoffPackage?: CityResponseReadinessHandoffDto;
  approval?: CityResponseReadinessApprovalDto;
  outcome?: CityResponseReadinessOutcomeDto;
  riskAssessment: CityResponseReadinessRiskDto;
  createdAt: string;
  updatedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: ReadinessProvenance;
}

export interface CityResponseReadinessInputDto {
  interventionId: string;
  cityId: string;
  title: string;
  description: string;
  targetSector?: string;
  actions?: Array<{
    actionId?: string;
    title: string;
    description: string;
    targetSector: string;
    estimatedDurationMinutes: number;
  }>;
  metadata?: Record<string, any>;
}
