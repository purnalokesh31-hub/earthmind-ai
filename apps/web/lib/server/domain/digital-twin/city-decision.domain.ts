// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Citywide Predictive Decision Architecture
// ──────────────────────────────────────────────────────────────

import { UrbanDomain } from './city-intervention.domain';
import {
  DecisionScenarioStatus,
  OptimizationObjectiveMode,
  DecisionConstraintType,
  DecisionSignalDto as IntelDecisionSignalDto,
  MitigationActionDto,
  MitigationCandidateDto,
  DecisionConstraintDto,
  DecisionRiskReductionDto,
  DecisionCostImpactDto,
  DecisionResourceRequirementDto,
  DecisionImpactDto as IntelDecisionImpactDto,
  DecisionCandidateComparisonDto as IntelDecisionComparisonDto,
  DecisionRecommendationDto as IntelDecisionRecommendationDto,
  DecisionExplanationDto,
  DecisionApprovalAuditDto as IntelDecisionApprovalAuditDto,
  DecisionIntelligenceSummaryDto,
  CityDecisionInputDto as IntelCityDecisionInputDto,
  CityDecisionScenarioEntity as IntelCityDecisionScenarioEntity,
} from './city-decision-intelligence.domain';

export type CityDecisionStatus = DecisionScenarioStatus;
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NORMAL' | 'LOW';
export type ConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface CityDecisionSignalDto extends IntelDecisionSignalDto {
  climateRisk?: number;
  floodRisk?: number;
  trafficDisruption?: number;
  transitDelay?: number;
  utilityFailureProbability?: number;
  emergencyResponseDegradation?: number;
  citizenImpact?: number;
  populationExposure?: number;
  infrastructureExposure?: number;
  financialImpact?: number;
  downtime?: number;
  cascadeRisk?: number;
  forecastConfidence?: number;
  dataSource: 'SIMULATION';
}

export interface CityDecisionOptionDto {
  optionId: string;
  name: string;
  description: string;
  affectedDomains: UrbanDomain[];
  estimatedCost: number;
  estimatedDowntime: number;
  estimatedPopulationBenefit: number;
  estimatedRiskReduction: number;
  resourceRequirement: Record<string, number>;
  implementationTime: number; // hours
  confidence: number;
  priorityScore: number;
  requiresHumanApproval: true;
}

export interface CityDecisionImpactDto extends IntelDecisionImpactDto {
  riskDelta: number;
  populationExposureDelta: number;
  downtimeDelta: number;
  financialImpactDelta: number;
  serviceImpactDelta: number;
  cascadeRiskDelta: number;
}

export interface CityDecisionRiskDto {
  baselineRisk: number;
  predictedRisk: number;
  mitigatedRisk: number;
  riskReductionPoints: number;
  cascadeRisk: number;
}

export interface CityDecisionScoreDto {
  overallScore: number; // 0-100
  riskReductionScore: number;
  populationProtectionScore: number;
  serviceRecoveryScore: number;
  costEfficiencyScore: number;
  resourceEfficiencyScore: number;
  confidenceScore: number;
  cascadePreventionScore: number;
  explainableMetrics: Record<string, number>;
}

export interface CityDecisionPriorityDto {
  priorityScore: number; // 0-100
  priorityClassification: PriorityLevel;
  timeToImpactHours: number;
  populationExposure: number;
  criticalInfrastructureCount: number;
  serviceDependencyScore: number;
  cascadePotentialScore: number;
  reasoning: string;
}

export interface CityDecisionRecommendationDto extends IntelDecisionRecommendationDto {
  optionId: string;
  priorityClassification: PriorityLevel;
  whyPrioritized: string[];
  whyNotOtherOptions: { optionId: string; reason: string }[];
  keyTradeoffs: string[];
  whatCouldChangeThis: string[];
  requiresHumanApproval: true; // MUST ALWAYS BE TRUE
}

export interface CityDecisionComparisonDto {
  scenarioId: string;
  noActionBaseline: {
    risk: number;
    populationExposure: number;
    downtimeHours: number;
    financialImpactUsd: number;
    cascadeRisk: number;
  };
  recommendedAction: {
    optionId: string;
    risk: number;
    populationExposure: number;
    downtimeHours: number;
    financialImpactUsd: number;
    cascadeRisk: number;
  };
  improvement: {
    riskReductionPoints: number;
    populationProtected: number;
    downtimeReductionHours: number;
    financialSavingsUsd: number;
    cascadeRiskReductionPoints: number;
  };
  options: CityDecisionOptionDto[];
  dataSource: 'SIMULATION';
}

export interface CityDecisionConfidenceDto {
  confidenceScore: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  forecastConfidence: number;
  dataCompleteness: number;
  crossDomainAgreement: number;
  scenarioConsistency: number;
  historicalSupport: number;
  signalFreshness: number;
  explanation: string;
}

export interface CityDecisionApprovalDto {
  userId: string;
  decisionId: string;
  recommendationId: string;
  decisionStatus: 'APPROVED' | 'REJECTED';
  timestamp: Date | string;
  operatorNotes: string;
}

export interface CityDecisionAuditDto {
  eventId: string;
  eventType:
    | 'DECISION_CREATED'
    | 'SIGNALS_LOADED'
    | 'FORECAST_LOADED'
    | 'OPTIONS_GENERATED'
    | 'OPTIONS_SCORED'
    | 'PRIORITY_CALCULATED'
    | 'COMPARISON_COMPLETED'
    | 'RECOMMENDATION_GENERATED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVED'
    | 'REJECTED';
  timestamp: Date | string;
  actor: string;
  decisionId: string;
  metadata?: Record<string, any>;
}

export interface CityDecisionSummaryDto extends DecisionIntelligenceSummaryDto {}

export interface CityDecisionInputDto extends IntelCityDecisionInputDto {}

export interface CityDecisionEntity extends IntelCityDecisionScenarioEntity {
  options?: CityDecisionOptionDto[];
  scores?: CityDecisionScoreDto;
  priorities?: CityDecisionPriorityDto[];
  comparison?: CityDecisionComparisonDto;
  confidence?: CityDecisionConfidenceDto;
  audits?: CityDecisionAuditDto[];
}

export * from './city-decision-intelligence.domain';
