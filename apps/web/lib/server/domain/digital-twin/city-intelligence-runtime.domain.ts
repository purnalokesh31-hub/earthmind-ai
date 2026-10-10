// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 City Intelligence Runtime Domain Entities
// Strongly Typed Domain Models & Governance/Safety Boundary Contracts
// ──────────────────────────────────────────────────────────────

import { DataQualityState, Phase8ProvenanceSource } from './city-data-provider.domain';
import { CrossDomainSignalDto } from './cross-domain.domain';

export type RuntimeExecutionMode = 'LIVE_READ_ONLY' | 'DEMO' | 'SIMULATION';
export type ForbiddenExecutionMode = 'LIVE_WRITE' | 'AUTONOMOUS' | 'PHYSICAL_EXECUTION';

export type RuntimeHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DATA_LIMITED'
  | 'UNAVAILABLE';

export const SUPPORTED_RUNTIME_DOMAINS = [
  'ENVIRONMENTAL',
  'WEATHER',
  'MOBILITY',
  'TRANSIT',
  'UTILITY',
  'EMERGENCY',
  'CITIZEN_INTELLIGENCE',
] as const;

export type SupportedRuntimeDomain = typeof SUPPORTED_RUNTIME_DOMAINS[number];

export function assertRuntimeExecutionMode(mode: string): RuntimeExecutionMode {
  const allowed: RuntimeExecutionMode[] = ['LIVE_READ_ONLY', 'DEMO', 'SIMULATION'];
  if (!allowed.includes(mode as RuntimeExecutionMode)) {
    throw new Error(
      `FORBIDDEN_EXECUTION_MODE: Execution mode '${mode}' is forbidden or unauthorized. EarthMind PIOS enforces advisory-only execution.`
    );
  }
  return mode as RuntimeExecutionMode;
}

export interface UnifiedCityIntelligenceOverviewDto {
  cityId: string;
  executionMode: RuntimeExecutionMode;
  runtimeStatus: RuntimeHealthStatus;
  cityRiskLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  trustScorePct: number;
  trustLevel: 'HIGH_TRUST' | 'MODERATE_TRUST' | 'DEGRADED_TRUST' | 'ZERO_TRUST';
  activeSignalsCount: number;
  predictiveAlertsCount: number;
  activeSimulationsCount: number;
  priorityActionsCount: number;
  pendingApprovalsCount: number;
  pipelineStages: PipelineStageSummaryDto[];
  timestamp: string;
}

export interface PipelineStageSummaryDto {
  stageId: string;
  stageName: string;
  status: 'COMPLETED' | 'RUNNING' | 'DEGRADED' | 'PENDING_APPROVAL';
  provenance: Phase8ProvenanceSource;
  details: string;
  timestamp: string;
}

export interface CityRiskStatusDto {
  cityId: string;
  currentRiskScore: number;
  riskCategory: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  activeAlerts: Array<{
    alertId: string;
    domain: string;
    severity: string;
    description: string;
    confidence: number;
  }>;
  evaluatedAt: string;
}

export interface ActionRecommendationsDto {
  cityId: string;
  recommendations: Array<{
    recommendationId: string;
    title: string;
    priority: string;
    costEstimate: number;
    timeToImplementHours: number;
    requiresHumanApproval: boolean;
    governanceStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  }>;
  generatedAt: string;
}

// ── Phase 8.6 Domain Foundation Entities ──

export interface DomainRuntimeState {
  domain: SupportedRuntimeDomain | string;
  cityId: string;
  providerType: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';
  providerStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'FALLBACK' | 'UNAVAILABLE';
  lastUpdate: string; // ISO timestamp
  freshnessSeconds: number;
  confidence: number; // 0 - 100
  dataQuality: DataQualityState;
  availability: number; // 0 - 100 %
  failureCount: number;
  fallbackActive: boolean;
  telemetryCount: number;
  signalCount: number;
  provenance: Phase8ProvenanceSource;
  explanation: string;
}

export interface TelemetrySnapshot {
  snapshotId: string;
  cityId: string;
  timestamp: string;
  signals: CrossDomainSignalDto[];
  domainBreakdown: Record<string, number>;
  totalSignals: number;
  provenance: Phase8ProvenanceSource;
  dataQuality: DataQualityState;
  confidence: number;
}

export type ReadinessStatus = 'READY' | 'READY_WITH_WARNINGS' | 'DEGRADED' | 'NOT_READY';
export type CoverageStatus = 'COMPLETE' | 'PARTIAL' | 'DEGRADED' | 'CRITICAL';
export type QualityStatus = 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'POOR' | 'CRITICAL';
export type FreshnessStatus = 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'STALE';
export type ProviderHealthState = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'FALLBACK' | 'UNKNOWN';

export interface RuntimeHealth {
  telemetryCoverage: number; // 0 - 100 %
  dataQualityScore: number; // 0 - 100 %
  freshnessScore: number; // 0 - 100 %
  providerHealthScore: number; // 0 - 100 %
  cityIntelligenceReadiness: number; // 0 - 100 %
  readinessStatus?: ReadinessStatus;
  explanations: {
    telemetryCoverage: string;
    dataQualityScore: string;
    freshnessScore: string;
    providerHealthScore: string;
    cityIntelligenceReadiness: string;
  };
}

export interface RuntimeDataQuality {
  overallScore: number; // 0 - 100 %
  qualityStatus?: QualityStatus;
  freshCount: number;
  staleCount: number;
  invalidCount: number;
  unknownCount: number;
  freshSignals?: number;
  staleSignals?: number;
  invalidSignals?: number;
  unknownSignals?: number;
  fallbackCount?: number;
  domainBreakdown: Record<string, DataQualityState>;
  explanation: string;
}

export interface RuntimeCoverage {
  domainCoverage: number; // 0 - 100 % (percentage of 7 domains present)
  signalCoverage: number; // 0 - 100 %
  spatialCoverage: number | 'UNKNOWN';
  temporalCoverage: number; // 0 - 100 %
  coverageStatus?: CoverageStatus;
  availableDomainsCount?: number;
  totalDomainsCount?: number;
  missingDomains: string[];
  missingSignals: string[];
  degradedDomains?: string[];
}

export interface RuntimeProvenance {
  primarySource: Phase8ProvenanceSource;
  provenanceComposition: Record<Phase8ProvenanceSource, number>; // Count per provenance
  isPureLive: boolean;
  containsSimulatedData: boolean;
  containsDemoData: boolean;
}

export type TelemetryTrustCategory = 'TRUSTED_LIVE_DATA' | 'DEGRADED_LIVE_DATA' | 'STALE_DATA' | 'SIMULATION_DATA' | 'DEMO_DATA' | 'INVALID_DATA';

export interface TelemetryTrustFactor {
  factor: string;
  score: number;
  impact: number;
  explanation: string;
}

export interface TelemetryTrustScore {
  trustScore: number; // 0 - 100
  trustStatus: 'HIGH_TRUST' | 'MODERATE_TRUST' | 'DEGRADED_TRUST' | 'ZERO_TRUST';
  trustCategory: TelemetryTrustCategory;
  trustFactors: TelemetryTrustFactor[];
  trustExplanation: string;
  degradedReason?: string;
  phase7GatingStatus: 'ALLOWED_TRUSTED' | 'ALLOWED_DEGRADED' | 'BLOCKED_INVALID';
}

export type RuntimeUpdateEventType =
  | 'TELEMETRY_RECEIVED'
  | 'TELEMETRY_REJECTED'
  | 'TELEMETRY_STALE'
  | 'PROVIDER_FAILURE'
  | 'PROVIDER_RECOVERY'
  | 'FALLBACK_ACTIVATED'
  | 'RUNTIME_UPDATED';

export interface RuntimeUpdateEvent {
  eventId: string;
  cityId: string;
  domain: string;
  signalId?: string;
  timestamp: string;
  eventType: RuntimeUpdateEventType;
  providerType: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';
  provenance: Phase8ProvenanceSource;
  dataQuality: DataQualityState;
  executionMode: RuntimeExecutionMode;
}

export type RuntimeAlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuntimeAlertType =
  | 'DOMAIN_MISSING'
  | 'DOMAIN_DEGRADED'
  | 'STALE_TELEMETRY'
  | 'INVALID_TELEMETRY'
  | 'PROVIDER_FAILURE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_FALLBACK'
  | 'LOW_CONFIDENCE'
  | 'LOW_COVERAGE'
  | 'CIRCUIT_BREAKER_OPEN'
  | 'INTELLIGENCE_NOT_READY'
  | 'STALE_DOMAIN_DATA'
  | 'FALLBACK_ACTIVE'
  | 'MISSING_DOMAIN';

export interface RuntimeAlert {
  alertId: string;
  severity: RuntimeAlertSeverity;
  alertType: RuntimeAlertType;
  domain: string;
  message: string;
  timestamp: string;
  provenance: Phase8ProvenanceSource;
  dataQuality: DataQualityState;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}

export interface RuntimeCorrelation {
  correlationId: string;
  cityId: string;
  sourceSignals: string[];
  domains: string[];
  relationship: string;
  confidence: number;
  timestamp: string;
  provenance: Phase8ProvenanceSource;
}

export interface CityRuntimeState {
  cityId: string;
  timestamp: string;
  executionMode: RuntimeExecutionMode;
  domains: Record<string, DomainRuntimeState>;
  telemetrySnapshot: TelemetrySnapshot;
  health: RuntimeHealth;
  quality: RuntimeDataQuality;
  coverage: RuntimeCoverage;
  provenance: RuntimeProvenance;
  alerts: RuntimeAlert[];
  correlations: RuntimeCorrelation[];
  recentEvents: RuntimeUpdateEvent[];
  governance?: {
    requiresHumanApproval: boolean;
    advisoryOnly: boolean;
    autonomousExecution: boolean;
  };
  telemetryTrust?: TelemetryTrustScore;
  requiresHumanApproval: true;
  advisoryOnly: true;
  autonomousExecution: false;
}
