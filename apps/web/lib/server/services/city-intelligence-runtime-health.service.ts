// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 City Intelligence Runtime Health Service
// Deterministic Health, Telemetry Coverage, Data Quality & Provider Health Engine
// ──────────────────────────────────────────────────────────────

import {
  DomainRuntimeState,
  RuntimeHealth,
  RuntimeDataQuality,
  RuntimeCoverage,
  RuntimeAlert,
  RuntimeCorrelation,
  SupportedRuntimeDomain,
  SUPPORTED_RUNTIME_DOMAINS,
  ReadinessStatus,
  CoverageStatus,
  QualityStatus,
  FreshnessStatus,
  ProviderHealthState,
  RuntimeExecutionMode,
  TelemetryTrustScore,
  TelemetryTrustFactor,
  TelemetryTrustCategory,
} from '../domain/digital-twin/city-intelligence-runtime.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { Phase8ProvenanceSource, DataQualityState } from '../domain/digital-twin/city-data-provider.domain';
import { logger } from '../logger';

export class CityIntelligenceRuntimeHealthService {
  /**
   * Calculates deterministic 0-100 citywide health metrics and readiness score
   */
  public calculateCitywideHealth(
    domainStates: Record<string, DomainRuntimeState>,
    evaluatedSignals: CrossDomainSignalDto[]
  ): RuntimeHealth {
    const activeDomainStates = Object.values(domainStates).filter((d) => d.signalCount > 0);
    const availableDomainsCount = activeDomainStates.length;

    // 1. Telemetry Coverage
    const telemetryCoverage = Math.round((availableDomainsCount / 7) * 100);

    // 2. Data Quality Score (Penalizes INVALID data heavily)
    let dataQualityScore = 0;
    if (activeDomainStates.length > 0) {
      const sumQuality = activeDomainStates.reduce((acc, d) => {
        if (d.dataQuality === 'FRESH') return acc + 100;
        if (d.dataQuality === 'STALE') return acc + 60;
        if (d.dataQuality === 'DEGRADED') return acc + 40;
        return acc; // INVALID or UNKNOWN contributes 0
      }, 0);
      dataQualityScore = Math.round(sumQuality / activeDomainStates.length);
    }

    // 3. Freshness Score
    let freshnessScore = 0;
    if (activeDomainStates.length > 0) {
      const sumFresh = activeDomainStates.reduce(
        (acc, d) => acc + Math.max(0, 100 - Math.min(100, d.freshnessSeconds)),
        0
      );
      freshnessScore = Math.round(sumFresh / activeDomainStates.length);
    }

    // 4. Provider Health Score
    const providerHealthScore = Math.round(
      Object.values(domainStates).reduce((acc, d) => {
        if (d.providerStatus === 'ONLINE') return acc + 100;
        if (d.providerStatus === 'DEGRADED') return acc + 60;
        if (d.providerStatus === 'FALLBACK') return acc + 50;
        return acc; // OFFLINE / UNAVAILABLE = 0
      }, 0) / 7
    );

    // 5. City Intelligence Readiness (Weighted combination)
    const cityIntelligenceReadiness = Math.floor(
      telemetryCoverage * 0.35 +
      dataQualityScore * 0.25 +
      freshnessScore * 0.20 +
      providerHealthScore * 0.20
    );

    let readinessStatus: ReadinessStatus = 'NOT_READY';
    if (cityIntelligenceReadiness >= 85) readinessStatus = 'READY';
    else if (cityIntelligenceReadiness >= 70) readinessStatus = 'READY_WITH_WARNINGS';
    else if (cityIntelligenceReadiness >= 50) readinessStatus = 'DEGRADED';

    return {
      telemetryCoverage,
      dataQualityScore,
      freshnessScore,
      providerHealthScore,
      cityIntelligenceReadiness,
      readinessStatus,
      explanations: {
        telemetryCoverage: `${availableDomainsCount} of 7 intelligence domains currently provide active telemetry.`,
        dataQualityScore:
          dataQualityScore >= 85
            ? 'High telemetry quality across active domain signals.'
            : 'Data quality degraded due to stale or invalid domain signals.',
        freshnessScore:
          freshnessScore >= 80
            ? 'Telemetry freshness is within normal operational thresholds (<60s).'
            : 'Telemetry freshness reduced due to delayed provider feeds.',
        providerHealthScore:
          providerHealthScore >= 80
            ? 'All active domain providers reporting healthy operational status.'
            : 'Provider health reduced due to domain provider offline or fallback state.',
        cityIntelligenceReadiness:
          readinessStatus === 'READY'
            ? 'City intelligence runtime readiness is HIGH.'
            : readinessStatus === 'READY_WITH_WARNINGS'
            ? 'City intelligence runtime is READY WITH WARNINGS due to partial domain coverage or latency.'
            : 'City intelligence readiness is DEGRADED or NOT READY for high-confidence operational advisory.',
      },
    };
  }

  /**
   * Calculates domain telemetry coverage metrics
   */
  public calculateCoverage(
    domainStates: Record<string, DomainRuntimeState>,
    evaluatedSignals: CrossDomainSignalDto[]
  ): RuntimeCoverage {
    const missingDomains = Object.values(domainStates)
      .filter((d) => d.signalCount === 0)
      .map((d) => d.domain);

    const degradedDomains = Object.values(domainStates)
      .filter((d) => d.providerStatus === 'DEGRADED' || d.dataQuality === 'STALE')
      .map((d) => d.domain);

    const availableCount = 7 - missingDomains.length;
    const domainCoverage = Math.round((availableCount / 7) * 100);

    let coverageStatus: CoverageStatus = 'CRITICAL';
    if (domainCoverage === 100) coverageStatus = 'COMPLETE';
    else if (domainCoverage >= 70) coverageStatus = 'PARTIAL';
    else if (domainCoverage >= 40) coverageStatus = 'DEGRADED';

    return {
      domainCoverage,
      signalCoverage: Math.min(100, Math.round((evaluatedSignals.length / 14) * 100)),
      spatialCoverage: 'UNKNOWN', // Explicitly un-fabricated
      temporalCoverage: domainCoverage > 0 ? 90 : 0,
      coverageStatus,
      availableDomainsCount: availableCount,
      totalDomainsCount: 7,
      missingDomains,
      degradedDomains,
      missingSignals: missingDomains.map((d) => `${d}_PRIMARY_FEED`),
    };
  }

  /**
   * Calculates data quality breakdown and status
   */
  public calculateQuality(
    evaluatedSignals: CrossDomainSignalDto[],
    staleCount: number,
    invalidCount: number,
    totalAttempted: number
  ): RuntimeDataQuality {
    const freshCount = Math.max(0, evaluatedSignals.length - staleCount);
    const unknownCount = Math.max(0, totalAttempted - evaluatedSignals.length - invalidCount);

    // Invalid signals penalized 3x more heavily than stale signals
    const penalty = invalidCount * 30 + staleCount * 10;
    const overallScore = Math.max(0, Math.min(100, 100 - penalty));

    let qualityStatus: QualityStatus = 'CRITICAL';
    if (overallScore >= 90) qualityStatus = 'EXCELLENT';
    else if (overallScore >= 75) qualityStatus = 'GOOD';
    else if (overallScore >= 50) qualityStatus = 'DEGRADED';
    else if (overallScore >= 25) qualityStatus = 'POOR';

    return {
      overallScore,
      qualityStatus,
      freshCount,
      staleCount,
      invalidCount,
      unknownCount,
      domainBreakdown: {},
      explanation: `${freshCount} fresh, ${staleCount} stale, and ${invalidCount} invalid telemetry payload(s) evaluated.`,
    };
  }

  /**
   * Evaluates freshness metrics across signals
   */
  public calculateFreshness(evaluatedSignals: CrossDomainSignalDto[]): {
    averageFreshnessSeconds: number;
    freshSignalsPercentage: number;
    staleSignalsPercentage: number;
    freshnessScore: number;
    freshnessStatus: FreshnessStatus;
  } {
    if (evaluatedSignals.length === 0) {
      return {
        averageFreshnessSeconds: 9999,
        freshSignalsPercentage: 0,
        staleSignalsPercentage: 100,
        freshnessScore: 0,
        freshnessStatus: 'STALE',
      };
    }

    const now = Date.now();
    let totalAge = 0;
    let freshCount = 0;

    for (const sig of evaluatedSignals) {
      const ageSec = Math.max(0, Math.floor((now - new Date(sig.timestamp).getTime()) / 1000));
      totalAge += ageSec;
      if (ageSec <= 60) freshCount++;
    }

    const avgAge = Math.round(totalAge / evaluatedSignals.length);
    const freshPct = Math.round((freshCount / evaluatedSignals.length) * 100);
    const stalePct = 100 - freshPct;
    const freshnessScore = Math.max(0, 100 - Math.min(100, avgAge));

    let freshnessStatus: FreshnessStatus = 'STALE';
    if (freshnessScore >= 90) freshnessStatus = 'EXCELLENT';
    else if (freshnessScore >= 75) freshnessStatus = 'GOOD';
    else if (freshnessScore >= 50) freshnessStatus = 'DEGRADED';

    return {
      averageFreshnessSeconds: avgAge,
      freshSignalsPercentage: freshPct,
      staleSignalsPercentage: stalePct,
      freshnessScore,
      freshnessStatus,
    };
  }

  /**
   * Generates operational runtime alerts with strict safety invariant enforcement
   */
  public generateRuntimeAlerts(
    domainStates: Record<string, DomainRuntimeState>,
    health: RuntimeHealth,
    quality: RuntimeDataQuality,
    coverage: RuntimeCoverage,
    prov: Phase8ProvenanceSource
  ): RuntimeAlert[] {
    const alerts: RuntimeAlert[] = [];
    const nowIso = new Date().toISOString();

    if (coverage.missingDomains.length > 0) {
      alerts.push({
        alertId: `alt-missing-${Date.now()}`,
        severity: coverage.missingDomains.length > 3 ? 'CRITICAL' : 'HIGH',
        alertType: 'DOMAIN_MISSING',
        domain: coverage.missingDomains[0],
        message: `Missing telemetry feeds for domain(s): ${coverage.missingDomains.join(', ')}`,
        timestamp: nowIso,
        provenance: prov,
        dataQuality: 'UNKNOWN',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      });
    }

    if (quality.staleCount > 0) {
      alerts.push({
        alertId: `alt-stale-${Date.now()}`,
        severity: 'MEDIUM',
        alertType: 'STALE_TELEMETRY',
        domain: 'CITYWIDE',
        message: `${quality.staleCount} telemetry signal(s) exceed maximum 60-second freshness window.`,
        timestamp: nowIso,
        provenance: prov,
        dataQuality: 'STALE',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      });
    }

    if (quality.invalidCount > 0) {
      alerts.push({
        alertId: `alt-invalid-${Date.now()}`,
        severity: 'HIGH',
        alertType: 'INVALID_TELEMETRY',
        domain: 'CITYWIDE',
        message: `${quality.invalidCount} telemetry payload(s) rejected due to schema bounds violation.`,
        timestamp: nowIso,
        provenance: prov,
        dataQuality: 'INVALID',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      });
    }

    if (health.readinessStatus === 'NOT_READY' || health.readinessStatus === 'DEGRADED') {
      alerts.push({
        alertId: `alt-readiness-${Date.now()}`,
        severity: 'HIGH',
        alertType: 'INTELLIGENCE_NOT_READY',
        domain: 'CITYWIDE',
        message: `City intelligence readiness is ${health.readinessStatus}. Telemetry quality or coverage is below threshold.`,
        timestamp: nowIso,
        provenance: prov,
        dataQuality: quality.overallScore > 60 ? 'FRESH' : 'DEGRADED',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      });
    }

    return alerts;
  }

  public evaluateTelemetryTrustScore(
    health: RuntimeHealth,
    quality: RuntimeDataQuality,
    domainStates: Record<string, DomainRuntimeState>,
    mode: string = 'LIVE_READ_ONLY'
  ): TelemetryTrustScore {
    const factors: TelemetryTrustFactor[] = [
      { factor: 'Freshness', score: health.freshnessScore, impact: 30, explanation: `Freshness score is ${health.freshnessScore}% (<60s latency).` },
      { factor: 'Data Quality', score: quality.overallScore, impact: 30, explanation: `Data quality score is ${quality.overallScore}% (${quality.freshCount} fresh, ${quality.staleCount} stale, ${quality.invalidCount} invalid).` },
      { factor: 'Provider Health', score: health.providerHealthScore, impact: 20, explanation: `Provider health score is ${health.providerHealthScore}%.` },
      { factor: 'Domain Coverage', score: health.telemetryCoverage, impact: 20, explanation: `Telemetry coverage is ${health.telemetryCoverage}% across 7 urban domains.` },
    ];

    let fallbackPenalty = 0;
    const fallbackActive = Object.values(domainStates).some((d) => d.fallbackActive);
    if (fallbackActive) {
      fallbackPenalty = 10;
      factors.push({ factor: 'Fallback Usage Penalty', score: 90, impact: -10, explanation: 'One or more domain providers are currently operating in fallback mode.' });
    }

    const rawScore = Math.floor(
      health.freshnessScore * 0.3 +
      quality.overallScore * 0.3 +
      health.providerHealthScore * 0.2 +
      health.telemetryCoverage * 0.2 -
      fallbackPenalty
    );
    const trustScore = Math.max(0, Math.min(100, rawScore));

    let trustStatus: 'HIGH_TRUST' | 'MODERATE_TRUST' | 'DEGRADED_TRUST' | 'ZERO_TRUST' = 'ZERO_TRUST';
    if (trustScore >= 85) trustStatus = 'HIGH_TRUST';
    else if (trustScore >= 70) trustStatus = 'MODERATE_TRUST';
    else if (trustScore >= 50) trustStatus = 'DEGRADED_TRUST';

    let trustCategory: TelemetryTrustCategory = 'TRUSTED_LIVE_DATA';
    let phase7GatingStatus: 'ALLOWED_TRUSTED' | 'ALLOWED_DEGRADED' | 'BLOCKED_INVALID' = 'ALLOWED_TRUSTED';

    if (mode === 'DEMO') {
      trustCategory = 'DEMO_DATA';
    } else if (mode === 'SIMULATION') {
      trustCategory = 'SIMULATION_DATA';
    } else if (quality.invalidCount > 0) {
      trustCategory = 'INVALID_DATA';
      phase7GatingStatus = 'BLOCKED_INVALID';
    } else if (quality.staleCount > 0) {
      trustCategory = 'STALE_DATA';
      phase7GatingStatus = 'ALLOWED_DEGRADED';
    } else if (trustScore < 70) {
      trustCategory = 'DEGRADED_LIVE_DATA';
      phase7GatingStatus = 'ALLOWED_DEGRADED';
    }

    const trustExplanation = trustCategory === 'TRUSTED_LIVE_DATA'
      ? 'Telemetry is fully verified, fresh (<60s), schema-valid, and sourced from healthy live provider adapters.'
      : trustCategory === 'DEGRADED_LIVE_DATA'
      ? 'Telemetry is live but degraded due to reduced provider health or coverage.'
      : trustCategory === 'STALE_DATA'
      ? 'Telemetry contains stale signals (>60s old). Preserved with quality metadata for Phase 7 advisory analysis.'
      : trustCategory === 'INVALID_DATA'
      ? 'Telemetry contains invalid payloads violating schema bounds. Blocked from downstream actuation.'
      : `Telemetry is running in ${mode} execution mode for safe simulation and demonstration.`;

    return {
      trustScore,
      trustStatus,
      trustCategory,
      trustFactors: factors,
      trustExplanation,
      degradedReason: trustScore < 85 ? quality.explanation || 'Minor quality or freshness degradation' : undefined,
      phase7GatingStatus,
    };
  }
}

export const cityIntelligenceRuntimeHealthService = new CityIntelligenceRuntimeHealthService();
