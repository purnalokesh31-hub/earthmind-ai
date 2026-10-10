// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.4 Data Quality & Trust Engine Test Suite
// Data Trust Score, Anomaly Detection, Data Lineage & Explainability Verification
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { DataQualityEngine } from '../../lib/server/services/data-quality-engine.service';
import { DataLineageService } from '../../lib/server/services/data-lineage.service';
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';
import { WeatherProviderAdapter } from '../../lib/server/adapters/domain-adapters/weather-provider.adapter';

describe('Phase 8.4 Data Quality, Observability & Trust Engine Test Suite', () => {
  let qualityEngine: DataQualityEngine;
  let lineageService: DataLineageService;
  let weatherAdapter: WeatherProviderAdapter;

  beforeEach(() => {
    qualityEngine = new DataQualityEngine();
    lineageService = new DataLineageService();
    weatherAdapter = new WeatherProviderAdapter();
  });

  // ── 1. Data Trust Score Calculation ──
  it('should calculate transparent DataTrustScore and classify valid fresh signal as TRUSTED', () => {
    const freshSignal: CrossDomainSignalDto = {
      signalId: 'sig-trust-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'HIGH',
      location: { lat: 16.5, lng: 80.6 },
      value: 120.0,
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    const evalResult = qualityEngine.evaluateSignalQuality(freshSignal, weatherAdapter, 'LIVE');

    expect(evalResult.qualityState).toBe('FRESH');
    expect(evalResult.trustScore.overallScore).toBeGreaterThanOrEqual(85);
    expect(evalResult.trustScore.trustLevel).toBe('TRUSTED');
    expect(evalResult.anomalies.length).toBe(0);
  });

  // ── 2. Telemetry Anomaly Detection (Impossible Values) ──
  it('should detect IMPOSSIBLE_VALUE telemetry anomaly when physical bounds are violated and classify as INVALID/UNTRUSTED', () => {
    const impossibleSignal: CrossDomainSignalDto = {
      signalId: 'sig-impossible-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'HIGH',
      location: { lat: 16.5, lng: 80.6 },
      value: 9999.0, // Impossible rainfall value (max 300 mm/hr)
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    const evalResult = qualityEngine.evaluateSignalQuality(impossibleSignal, weatherAdapter, 'LIVE');

    expect(evalResult.qualityState).toBe('INVALID');
    expect(evalResult.trustScore.trustLevel).toBe('UNTRUSTED');
    expect(evalResult.anomalies.length).toBe(1);
    expect(evalResult.anomalies[0].anomalyType).toBe('IMPOSSIBLE_VALUE');
  });

  // ── 3. Stale Data Quality State Evaluation ──
  it('should evaluate qualityState as STALE when signal timestamp exceeds freshness threshold', () => {
    const staleTime = new Date(Date.now() - 180000).toISOString(); // 3 mins old
    const staleSignal: CrossDomainSignalDto = {
      signalId: 'sig-stale-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'MEDIUM',
      location: { lat: 16.5, lng: 80.6 },
      value: 45.0,
      unit: 'mm/hr',
      timestamp: staleTime,
    };

    const evalResult = qualityEngine.evaluateSignalQuality(staleSignal, weatherAdapter, 'LIVE');

    expect(evalResult.qualityState).toBe('STALE');
    expect(evalResult.trustScore.explainabilityReasons[0]).toContain('old');
  });

  // ── 4. Sudden Jump / Consistency Anomaly Detection ──
  it('should detect sudden spike delta vs moving average and lower consistency score', () => {
    const signal1: CrossDomainSignalDto = {
      signalId: 'sig-spike-1',
      domain: 'CLIMATE',
      entityId: 'WTH-SPIKE-NODE',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'LOW',
      location: { lat: 16.5, lng: 80.6 },
      value: 10.0,
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    const signal2: CrossDomainSignalDto = {
      signalId: 'sig-spike-2',
      domain: 'CLIMATE',
      entityId: 'WTH-SPIKE-NODE',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'CRITICAL',
      location: { lat: 16.5, lng: 80.6 },
      value: 250.0, // 25x jump from 10
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    qualityEngine.evaluateSignalQuality(signal1, weatherAdapter);
    const evalResult2 = qualityEngine.evaluateSignalQuality(signal2, weatherAdapter);

    expect(evalResult2.trustScore.consistencyScore).toBeLessThan(50);
    expect(evalResult2.trustScore.explainabilityReasons.some((r) => r.includes('moving average'))).toBe(true);
  });

  // ── 5. End-to-End Data Lineage Tracking ──
  it('should trace complete data lineage chain from provider to intervention', () => {
    const trace = lineageService.createSampleTrace(
      'connector-doppler-weather-01',
      'evt-sig-ext-wth-01',
      'sig-ext-wth-01',
      'LIVE',
      'FRESH',
      98.5
    );

    const fetched = lineageService.getTraceById(trace.traceId);
    expect(fetched).not.toBeNull();
    expect(fetched?.providerId).toBe('connector-doppler-weather-01');
    expect(fetched?.eventId).toBe('evt-sig-ext-wth-01');
    expect(fetched?.predictionId).toContain('pred-');
    expect(fetched?.decisionId).toContain('dec-');
    expect(fetched?.interventionId).toContain('int-');
  });

  // ── 6. Low-Quality Provenance Safety ──
  it('should guarantee that degraded/invalid data is NEVER silently tagged as trusted LIVE data', () => {
    const invalidSignal: CrossDomainSignalDto = {
      signalId: 'sig-untrusted-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Data Trust Sensor',
      eventType: 'RAINFALL',
      severity: 'HIGH',
      location: { lat: 16.5, lng: 80.6 },
      value: -50.0, // Negative rainfall (impossible)
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    const evalResult = qualityEngine.evaluateSignalQuality(invalidSignal, weatherAdapter, 'SIMULATION');

    expect(evalResult.trustScore.trustLevel).toBe('UNTRUSTED');
    expect(evalResult.qualityState).toBe('INVALID');
    expect(evalResult.trustScore.overallScore).toBeLessThan(40);
  });
});
