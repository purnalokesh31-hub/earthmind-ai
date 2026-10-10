// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Predictive Simulation Domain
// ──────────────────────────────────────────────────────────────

import { DomainType, CascadeRiskClassification } from './cross-domain.domain';
import { PredictionHorizonWindow } from './city-prediction.domain';

export type PredictionScenarioType =
  | 'CLIMATE_ESCALATION'
  | 'TRANSIT_DISRUPTION'
  | 'UTILITY_FAILURE'
  | 'TRAFFIC_SURGE'
  | 'EMERGENCY_SURGE'
  | 'MULTI_DOMAIN_CASCADE'
  | 'CUSTOM_CITYWIDE_SCENARIO';

export type ScenarioSeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ScenarioLifecycleStatus =
  | 'DRAFT'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ARCHIVED';

export interface PredictionScenarioVariableDto {
  variableId: string;
  variableName: string;
  domain: DomainType;
  baseValue: number;
  simulatedValue: number;
  unit: string;
  changePercentage: number;
}

export interface PredictionScenarioConstraintDto {
  constraintId: string;
  name: string;
  domain: DomainType;
  maxAllowableThreshold: number;
  unit: string;
  isViolated: boolean;
}

export interface PredictionScenarioCascadeDto {
  stepIndex: number;
  sourceDomain: DomainType;
  targetDomain: DomainType;
  triggerEvent: string;
  cascadingImpactDescription: string;
  timeDelayMinutes: number;
  additionalAffectedPopulation: number;
}

export interface PredictionScenarioImpactDto {
  affectedPopulation: number;
  directFinancialImpactUsd: number;
  criticalInfrastructureDowntimeHours: number;
  transitServiceDisruptionPercent: number;
  emergencyResponseDelayMinutes: number;
  environmentalRiskScore: number;
}

export interface PredictionScenarioRiskDto {
  baselineRiskScore: number; // 0 - 100
  simulatedRiskScore: number; // 0 - 100
  riskDelta: number;
  classification: CascadeRiskClassification;
  highestRiskDomain: DomainType;
  highestRiskAsset: string;
}

export interface PredictionScenarioComparisonDto {
  scenarioIdA: string;
  scenarioIdB: string;
  riskScoreDelta: number;
  downtimeDeltaHours: number;
  costDeltaUsd: number;
  populationImpactDelta: number;
  recommendedOption: 'SCENARIO_A' | 'SCENARIO_B' | 'BASELINE';
}

export interface PredictionScenarioRecommendationDto {
  recommendationId: string;
  scenarioId: string;
  title: string;
  summary: string;
  rationale: string;
  mitigationSteps: string[];
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface PredictionScenarioApprovalDto {
  approvalId: string;
  scenarioId: string;
  recommendationId: string;
  userId: string;
  userRole: string;
  status: 'APPROVED' | 'REJECTED';
  notes: string;
  timestamp: string;
}

export interface PredictionScenarioResultDto {
  resultId: string;
  scenarioId: string;
  horizon: PredictionHorizonWindow;
  risk: PredictionScenarioRiskDto;
  impact: PredictionScenarioImpactDto;
  cascadeSteps: PredictionScenarioCascadeDto[];
  violatedConstraints: PredictionScenarioConstraintDto[];
  confidencePercent: number;
  executedAt: string;
}

export interface CityPredictionScenarioInputDto {
  title: string;
  description: string;
  cityId: string;
  scenarioType: PredictionScenarioType;
  severityLevel: ScenarioSeverityLevel;
  horizon: PredictionHorizonWindow;
  variables: PredictionScenarioVariableDto[];
  constraints?: PredictionScenarioConstraintDto[];
}

export interface PredictionScenarioSummaryDto {
  totalScenarios: number;
  activeScenarios: number;
  completedSimulations: number;
  highRiskScenariosCount: number;
}

export interface CityPredictionScenarioEntity {
  scenarioId: string;
  input: CityPredictionScenarioInputDto;
  status: ScenarioLifecycleStatus;
  result?: PredictionScenarioResultDto;
  recommendation?: PredictionScenarioRecommendationDto;
  approvalAudit?: PredictionScenarioApprovalDto;
  createdAt: Date;
  updatedAt: Date;
}
