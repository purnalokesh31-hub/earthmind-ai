// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Predictive Decision Optimization Domain DTOs & Entities
// ──────────────────────────────────────────────────────────────

export type UrbanDomain = 'CLIMATE' | 'MOBILITY' | 'TRANSIT' | 'UTILITY' | 'EMERGENCY_RESPONSE' | 'CITIZEN_INTELLIGENCE';
export type DecisionSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ObjectivePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DecisionScenarioStatus = 'DRAFT' | 'GENERATED' | 'EVALUATED' | 'RECOMMENDED' | 'APPROVED' | 'REJECTED';

export interface CityDecisionObjectiveDto {
  objectiveId: string;
  name: string;
  domain: UrbanDomain;
  weight: number; // 0.0 to 1.0
  targetValue: number;
  unit: string;
  priority: ObjectivePriority;
}

export interface CityDecisionConstraintDto {
  constraintId: string;
  name: string;
  domain: UrbanDomain;
  limitValue: number;
  unit: string;
  isHardConstraint: boolean; // hard constraint vs soft preference
  isViolated?: boolean;
}

export interface CityInterventionOptionDto {
  optionId: string;
  title: string;
  description: string;
  primaryDomain: UrbanDomain;
  affectedDomains: UrbanDomain[];
  objective: string;
  expectedRiskReduction: number; // Risk points reduced (e.g. 28.5 pts)
  populationImpact: number; // Exposed/protected population
  infrastructureImpact: number; // Percent asset coverage
  estimatedCostUsd: number;
  estimatedDowntimeHours: number;
  resourceRequirementCount: number;
  confidencePercent: number; // e.g. 92.5%
  operationalFeasibilityScore: number; // 0-100
  constraintsSatisfied: string[];
  constraintsViolated: string[];
  decisionScore: number; // 0-100 aggregated multi-objective score
  requiresHumanApproval: boolean; // MUST ALWAYS BE TRUE
}

export interface CityDecisionInputDto {
  cityId: string;
  scenarioTitle: string;
  description?: string;
  horizon: '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
  severityLevel: DecisionSeverity;
  targetDomains: UrbanDomain[];
  objectives: CityDecisionObjectiveDto[];
  constraints: CityDecisionConstraintDto[];
  baseRiskScore: number;
  simulatedPeakRiskScore: number;
}

export interface CityDecisionScoreBreakdownDto {
  riskReductionScore: number;
  populationSafetyScore: number;
  costEfficiencyScore: number;
  downtimeMinimizationScore: number;
  operationalFeasibilityScore: number;
  constraintCompliancePenalty: number;
  finalAggregatedScore: number;
}

export interface CityDecisionScoreDto {
  optionId: string;
  optionTitle: string;
  finalScore: number; // 0-100
  breakdown: CityDecisionScoreBreakdownDto;
  rank: number;
}

export interface CityDecisionRecommendationDto {
  recommendationId: string;
  scenarioId: string;
  selectedOptionId: string;
  title: string;
  summary: string;
  rationale: string;
  expectedRiskReduction: number;
  confidencePercent: number;
  requiresHumanApproval: boolean; // MUST ALWAYS BE TRUE
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  operatorApproval?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  approvalReason?: string | null;
  decisionConfidence?: number;
  decisionExplanation?: string;
  auditEventId?: string | null;
  generatedAt: Date;
}

export interface CityDecisionComparisonDto {
  scenarioId: string;
  options: CityInterventionOptionDto[];
  topRankedOptionId: string;
  scoreDeltas: { optionId: string; deltaFromTopRanked: number }[];
  dataSource: 'SIMULATION';
}

export interface CityDecisionApprovalDto {
  scenarioId: string;
  recommendationId: string;
  userId: string;
  decision: 'APPROVED' | 'REJECTED';
  notes?: string;
  timestamp: Date;
}

export interface CityDecisionSummaryDto {
  scenarioId: string;
  title: string;
  status: DecisionScenarioStatus;
  primaryDomain: UrbanDomain;
  baseRiskScore: number;
  simulatedRiskScore: number;
  interventionOptionsCount: number;
  topRankedOptionTitle?: string;
  requiresHumanApproval: boolean;
  dataSource: 'SIMULATION';
  createdAt: Date;
}

export interface CityDecisionScenarioEntity {
  scenarioId: string;
  cityId: string;
  input: CityDecisionInputDto;
  status: DecisionScenarioStatus;
  options: CityInterventionOptionDto[];
  scores: CityDecisionScoreDto[];
  recommendation?: CityDecisionRecommendationDto;
  approvalAudit?: CityDecisionApprovalDto;
  createdAt: Date;
  updatedAt: Date;
}
