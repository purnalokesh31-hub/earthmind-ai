// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.4 Data Quality, Observability & Trust Engine
// Domain Models, Data Trust Score, Telemetry Anomalies & Lineage Traces
// ──────────────────────────────────────────────────────────────

import { ProviderDomain, ProviderHealthStatus } from './provider-gateway.domain';
import { DataQualityState, Phase8ProvenanceSource } from './city-data-provider.domain';

export type DataTrustLevel = 'TRUSTED' | 'MODERATE' | 'LOW' | 'UNTRUSTED';

export type TelemetryAnomalyType =
  | 'IMPOSSIBLE_VALUE'
  | 'SUDDEN_SPIKE'
  | 'MISSING_FIELD'
  | 'TIMESTAMP_ANOMALY'
  | 'UNIT_MISMATCH';

export interface DataTrustScoreDto {
  overallScore: number; // 0 - 100%
  freshnessScore: number;
  validityScore: number;
  providerHealthScore: number;
  consistencyScore: number;
  latencyScore: number;
  historicalReliabilityScore: number;
  trustLevel: DataTrustLevel;
  explainabilityReasons: string[];
  calculatedAt: string;
}

export interface TelemetryAnomalyDto {
  anomalyId: string;
  eventId: string;
  providerId: string;
  domain: ProviderDomain;
  anomalyType: TelemetryAnomalyType;
  description: string;
  rawSignalValue: number;
  expectedRange: { min: number; max: number };
  detectedAt: string;
}

export interface DataLineageTraceDto {
  traceId: string;
  providerId: string;
  eventId: string;
  signalId: string;
  predictionId?: string;
  simulationId?: string;
  decisionId?: string;
  interventionId?: string;
  provenance: Phase8ProvenanceSource;
  dataQualityState: DataQualityState;
  trustScorePct: number;
  timestamp: string;
}

export interface ProviderQualityMetricsDto {
  providerId: string;
  providerName: string;
  domain: ProviderDomain;
  uptimePercent: number;
  averageLatencyMs: number;
  successRatePercent: number;
  failureRatePercent: number;
  staleRatePercent: number;
  invalidRatePercent: number;
  eventThroughputPerSec: number;
  overallTrustScore: number;
  trustLevel: DataTrustLevel;
  updatedAt: string;
}

export interface SystemDataQualityOverviewDto {
  systemTrustScorePct: number;
  systemTrustLevel: DataTrustLevel;
  totalActiveProviders: number;
  healthyProvidersCount: number;
  activeAnomaliesCount: number;
  qualityBreakdown: {
    freshCount: number;
    degradedCount: number;
    staleCount: number;
    unknownCount: number;
    invalidCount: number;
    unavailableCount: number;
  };
  provenanceBreakdown: Record<Phase8ProvenanceSource, number>;
  generatedAt: string;
}
