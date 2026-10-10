// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Citywide Predictive Decision Intelligence Domain Models
// ──────────────────────────────────────────────────────────────

import { UrbanDomain } from './city-intervention.domain';

export type DecisionScenarioStatus =
  | 'READY'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type OptimizationObjectiveMode =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_COST'
  | 'MINIMIZE_DOWNTIME'
  | 'MINIMIZE_POPULATION_IMPACT'
  | 'MAXIMIZE_RESILIENCE'
  | 'BALANCED';

export type DecisionConstraintType =
  | 'MAX_BUDGET'
  | 'MAX_DOWNTIME'
  | 'MAX_CREWS'
  | 'MAX_EQUIPMENT'
  | 'MAX_POPULATION_EXPOSURE'
  | 'MIN_RISK_REDUCTION'
  | 'MIN_SERVICE_RECOVERY';

export interface DecisionSignalDto {
  signalId: string;
  domain: UrbanDomain;
  name: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  dataSource?: 'SIMULATION';
}

export interface MitigationActionDto {
  actionId: string;
  domain: UrbanDomain;
  title: string;
  targetAsset: string;
  actionType: string;
  estimatedDurationHours: number;
  estimatedCostUsd: number;
}

export interface MitigationCandidateDto {
  candidateId: string;
  name: string;
  description: string;
  category: 'CANDIDATE_A' | 'CANDIDATE_B' | 'CANDIDATE_C' | 'CANDIDATE_D' | 'CANDIDATE_E' | 'CANDIDATE_F' | 'CANDIDATE_G';
  actions: MitigationActionDto[];
  estimatedCost: number;
  estimatedDowntime: number;
  populationImpact: number;
  riskReduction: number;
  resourceRequirements: Record<string, number>;
  executionComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  feasible: boolean;
  score: number;
  rank: number;
  dataSource: 'SIMULATION';
  requiresHumanApproval: true;
}

export interface DecisionConstraintDto {
  constraintId: string;
  constraintType: DecisionConstraintType;
  limit: number;
  actualValue: number;
  status: 'PASS' | 'WARNING' | 'VIOLATION';
  reason: string;
}

export interface DecisionRiskReductionDto {
  baselineRisk: number;
  scenarioRisk: number;
  mitigatedRisk: number;
  riskReductionPoints: number;
  riskReductionPercent: number;
}

export interface DecisionCostImpactDto {
  directCostUsd: number;
  operationalCostUsd: number;
  totalCostUsd: number;
  costEfficiencyScore: number;
}

export interface DecisionResourceRequirementDto {
  resourceType: string;
  quantity: number;
  availability: number;
  shortfall: number;
  allocationPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DecisionImpactDto {
  candidateId: string;
  riskReduction: DecisionRiskReductionDto;
  costImpact: DecisionCostImpactDto;
  populationExposureReduction: number;
  infrastructureDowntimeReductionHours: number;
  transitDisruptionReductionPercent: number;
  utilityServiceImprovementPercent: number;
  emergencyResponseImprovementPercent: number;
  estimatedFinancialImpactUsd: number;
  resilienceImprovementPercent: number;
  dataSource: 'SIMULATION';
}

export interface DecisionCandidateComparisonDto {
  scenarioId: string;
  objective: OptimizationObjectiveMode;
  candidates: MitigationCandidateDto[];
  topRankedCandidateId: string;
  tradeOffSummary: string;
  dataSource: 'SIMULATION';
}

export interface DecisionRecommendationDto {
  recommendationId: string;
  scenarioId: string;
  candidateId: string;
  reasoning: string;
  expectedOutcome: string;
  riskReduction: number;
  estimatedCost: number;
  estimatedDowntime: number;
  resourceRequirements: Record<string, number>;
  confidence: number;
  tradeoffs: string[];
  constraints: DecisionConstraintDto[];
  requiresHumanApproval: true; // MUST ALWAYS BE TRUE
}

export interface DecisionExplanationDto {
  recommendationId: string;
  candidateId: string;
  whySelected: string;
  whyAlternativesRejected: { candidateId: string; reason: string }[];
  activeConstraints: DecisionConstraintDto[];
  tradeoffAnalysis: string;
  whatIfSensitivity: { parameter: string; impact: string }[];
}

export interface DecisionApprovalAuditDto {
  approvalId: string;
  userId: string;
  timestamp: Date | string;
  decisionId: string;
  scenarioId: string;
  recommendationId: string;
  status: 'APPROVED' | 'REJECTED';
  operatorNotes: string;
}

export interface DecisionIntelligenceSummaryDto {
  scenarioId: string;
  cityId: string;
  status: DecisionScenarioStatus;
  primaryDomain: UrbanDomain;
  candidateCount: number;
  topCandidateName?: string;
  requiresHumanApproval: true;
  dataSource: 'SIMULATION';
  createdAt: Date | string;
}

export interface DecisionPriorityDto {
  priorityScore: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactScale: number;
}

export interface CityDecisionInputDto {
  cityId: string;
  title: string;
  description?: string;
  selectedDomains: UrbanDomain[];
  planningHorizon: '1h' | '6h' | '24h' | '7d' | '30d';
  objective: OptimizationObjectiveMode;
  objectiveWeights?: {
    riskWeight?: number;
    costWeight?: number;
    downtimeWeight?: number;
    populationWeight?: number;
    resilienceWeight?: number;
  };
  constraints?: DecisionConstraintDto[];
}

export interface CityDecisionScenarioEntity {
  scenarioId: string;
  cityId: string;
  title: string;
  description: string;
  status: DecisionScenarioStatus;
  input: CityDecisionInputDto;
  signals: DecisionSignalDto[];
  candidates: MitigationCandidateDto[];
  impacts: DecisionImpactDto[];
  resources: DecisionResourceRequirementDto[];
  recommendation?: DecisionRecommendationDto;
  explanation?: DecisionExplanationDto;
  approvalAudit?: DecisionApprovalAuditDto;
  createdAt: Date | string;
  updatedAt: Date | string;
}
