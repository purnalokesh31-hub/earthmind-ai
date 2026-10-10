// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 6/6)
// Citywide Operational Intelligence Domain
// ──────────────────────────────────────────────────────────────

import { EarthMindProvenanceSource } from '../../services/earthmind-provenance.service';

export type OperationalAccuracyClassification = 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'DEGRADED' | 'INSUFFICIENT_DATA';
export type OperationalTrendDirection = 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'INSUFFICIENT_DATA';
export type ResilienceClassification = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED' | 'RESILIENT';

export interface CityOperationalKpiDto {
  metric: string;
  value: number | null;
  unit: string;
  timeWindow: string; // '1h' | '6h' | '24h' | '7d' | '30d' | '90d'
  dataSource: EarthMindProvenanceSource;
  confidence: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'INSUFFICIENT_DATA';
}

export interface CityResilienceScoreDto {
  resilienceScore: number; // 0 - 100
  classification: ResilienceClassification;
  contributingFactors: Array<{
    factor: string;
    score: number;
    impactDescription: string;
  }>;
  requiresHumanApproval: true;
  dataSource: EarthMindProvenanceSource;
  updatedAt: string;
}

export interface CityOperationalTrendDto {
  metric: string;
  timeWindow: string;
  direction: OperationalTrendDirection;
  percentageChange: number;
  confidence: number;
}

export interface CityFeedbackDto {
  feedbackId: string;
  interventionId?: string;
  predictionAccuracyPercentage: number;
  responseAccuracyPercentage: number;
  impactAccuracyPercentage: number;
  costAccuracyPercentage: number;
  overallOperationalAccuracyPercentage: number;
  classification: OperationalAccuracyClassification;
  suggestedAdjustments: string[];
  requiresHumanApproval: true;
  timestamp: string;
}

export interface CityHistoricalPerformanceDto {
  timeWindow: string;
  totalInterventions: number;
  approvedCount: number;
  rejectedCount: number;
  avgReadinessScore: number;
  avgRiskReductionDelta: number;
  trends: CityOperationalTrendDto[];
}

export interface CityOperationalRiskDto {
  riskId: string;
  riskName: string;
  impactScore: number;
  probabilityScore: number;
  combinedRiskScore: number;
  affectedDomain: string;
}

export interface CityOperationalRecommendationDto {
  recommendationId: string;
  cityId: string;
  title: string;
  summary: string;
  rationale: string;
  expectedRiskReduction: number;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: EarthMindProvenanceSource;
}

export interface CityOperationalApprovalDto {
  approvalId: string;
  intelligenceId: string;
  userId: string;
  userRole?: string;
  decision: 'APPROVED' | 'REJECTED';
  operatorNotes?: string;
  timestamp: string;
  requiresHumanApproval: true;
}

export interface CityOperationalAuditDto {
  auditId: string;
  intelligenceId: string;
  eventType: string;
  userId: string;
  summary: string;
  timestamp: string;
  provenance: EarthMindProvenanceSource;
}

export interface CityOperationalSummaryDto {
  cityId: string;
  resilienceScore: CityResilienceScoreDto;
  kpis: CityOperationalKpiDto[];
  activeInterventionsCount: number;
  pendingApprovalsCount: number;
  activeDeviationsCount: number;
  activeEscalationsCount: number;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: EarthMindProvenanceSource;
  updatedAt: string;
}

export interface CityOperationalIntelligenceEntity {
  id: string;
  cityId: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  summary: CityOperationalSummaryDto;
  resilienceScore: CityResilienceScoreDto;
  kpis: CityOperationalKpiDto[];
  trends: CityOperationalTrendDto[];
  feedback: CityFeedbackDto;
  historicalPerformance: CityHistoricalPerformanceDto;
  recommendations: CityOperationalRecommendationDto[];
  approval?: CityOperationalApprovalDto;
  createdAt: string;
  updatedAt: string;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
  provenance: EarthMindProvenanceSource;
}
