// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.2 Utility Predictive Intelligence Domain
// ──────────────────────────────────────────────────────────────

import { UtilityType, UtilityAssetType } from './utility.domain';

export type PredictionLifecycle =
  | 'DETECTED'
  | 'ANALYZING'
  | 'PREDICTED'
  | 'RECOMMENDED'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'COMPLETED';

export type UtilityRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface UtilityAnomalyTrendDto {
  assetId: string;
  assetName: string;
  metricName: string;
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE' | 'ERRATIC';
  anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  supportingObservations: string[];
}

export interface UtilityFailureProbabilityDto {
  assetId: string;
  assetName: string;
  utilityType: UtilityType;
  failureProbabilityPercent: number; // 0 - 100
  riskClassification: UtilityRiskLevel;
  dominantFailureIndicators: string[];
  confidenceScore: number;
}

export interface UtilityRemainingLifeDto {
  assetId: string;
  assetName: string;
  estimatedRemainingLifeDays: number;
  expectedFailureWindow: string; // e.g. "7 - 14 Days"
  confidenceScore: number;
}

export interface UtilityOutageImpactDto {
  predictionId: string;
  sourceAssetId: string;
  sourceAssetName: string;
  utilityType: UtilityType;
  downstreamAffectedAssets: string[];
  affectedZones: string[];
  estimatedOutageDurationHours: number;
  estimatedServiceImpactPopulation: number;
  cascadingRiskLevel: UtilityRiskLevel;
  explanation: string;
}

export interface UtilityPredictiveMaintenanceDto {
  recommendationId: string;
  assetId: string;
  assetName: string;
  utilityType: UtilityType;
  actionTitle: string;
  actionDescription: string;
  predictedRiskLevel: UtilityRiskLevel;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedMaintenanceWindowDays: number;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UtilityPredictionEntity {
  predictionId: string;
  assetId: string;
  assetName: string;
  utilityType: UtilityType;
  assetType: UtilityAssetType;
  cityId: string;
  status: PredictionLifecycle;
  failureProbability: UtilityFailureProbabilityDto;
  remainingLife: UtilityRemainingLifeDto;
  outageImpact: UtilityOutageImpactDto;
  recommendation: UtilityPredictiveMaintenanceDto;
  createdAt: Date;
  updatedAt: Date;
}
