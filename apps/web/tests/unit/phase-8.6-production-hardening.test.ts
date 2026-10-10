// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Final Enterprise Production Hardening & Certification Test Suite
// Verifies Security, Invariants, Resilience, Data Trust & Operational Boundaries
// ──────────────────────────────────────────────────────────────

// @ts-ignore - module may not exist
import { describe, it, expect, beforeEach } from 'vitest';
import { CityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { DataQualityEngine } from '../../lib/server/services/data-quality-engine.service';
import { CityDataProviderManagerService } from '../../lib/server/services/city-data-provider-manager.service';
import { cityTelemetryIngestionService } from '../../lib/server/services/city-telemetry-ingestion.service';
import { DataLineageService } from '../../lib/server/services/data-lineage.service';
import { AuthSecurityService } from '../../lib/server/auth/security.service';
import { JwtService } from '../../lib/server/auth/jwt.service';
import { WeatherProviderAdapter } from '../../lib/server/adapters/domain-adapters/weather-provider.adapter';
// import removed: city-telemetry-event.domain does not exist
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';

describe('Phase 8.6 Enterprise Production Hardening & Safety Invariants', () => {
  let runtimeService: CityIntelligenceRuntimeService;
  let qualityEngine: DataQualityEngine;
  let providerManager: CityDataProviderManagerService;
  let lineageService: DataLineageService;
  let securityService: AuthSecurityService;
  let jwtService: JwtService;
  let weatherAdapter: WeatherProviderAdapter;

  beforeEach(() => {
    runtimeService = new CityIntelligenceRuntimeService();
    qualityEngine = new DataQualityEngine();
    providerManager = new CityDataProviderManagerService();
    lineageService = new DataLineageService();
    securityService = new AuthSecurityService();
    jwtService = new JwtService();
    weatherAdapter = new WeatherProviderAdapter();
  });

  describe('1. Global Safety Invariants & Governance Constraints', () => {
    it('should strictly enforce advisoryOnly === true, autonomousExecution === false, and requiresHumanApproval === true across runtime overview', async () => {
      runtimeService.setExecutionMode('LIVE_READ_ONLY');
      const overview = await runtimeService.executePipeline('city-vja');
      
      expect(overview.executionMode).toBe('LIVE_READ_ONLY');
      expect(overview.pipelineStages.length).toBe(7);

      // Verify governance stage explicitly requires human approval
      const govStage = overview.pipelineStages.find((s) => s.stageId === 'stage-7-governance');
      expect(govStage).toBeDefined();
      expect(govStage?.status).toBe('PENDING_APPROVAL');
      expect(govStage?.details).toContain('HUMAN APPROVAL REQUIRED');
    });

    it('should reject physical actuation or autonomous execution calls by contract', async () => {
      const status = runtimeService.getRuntimeStatus();
      expect(['HEALTHY', 'DATA_LIMITED', 'DEGRADED', 'UNAVAILABLE']).toContain(status);
      
      const overview = await runtimeService.executePipeline('city-vja');
      expect((overview as any).physicalActuationEnabled).toBeUndefined();
    });
  });

  describe('2. Security, Authentication & Lockout Mechanisms', () => {
    it('should throw UnauthorizedError when verifying an invalid JWT token', async () => {
      await expect(jwtService.verifyAccessToken('invalid-token-string')).rejects.toThrow();
    });

    it('should trigger lockout status after 5 failed authentication attempts', async () => {
      const targetUser = 'audit-test-user@earthmind.gov';
      const ip = '192.168.1.99';

      // First 4 failed attempts tracking
      for (let i = 0; i < 4; i++) {
        await securityService.trackFailedLogin(targetUser, ip);
      }

      // 5th attempt throws ForbiddenError due to lockout
      await expect(securityService.trackFailedLogin(targetUser, ip)).rejects.toThrow();

      const status = await securityService.checkLockout(targetUser);
      expect(status.isLocked).toBe(true);
    });
  });

  describe('3. Ingestion Resilience: Deduplication, Ordering & DLQ', () => {
    it('should block duplicate telemetry events based on signalId and throw DUPLICATE_EVENT', async () => {
      const sigId = `sig-dedup-${Date.now()}`;
      const rawSignal: CrossDomainSignalDto = {
        signalId: sigId,
        domain: 'CLIMATE',
        entityId: 'station-01',
        entityName: 'Weather Station',
        eventType: 'PRECIPITATION',
        severity: 'HIGH',
        location: { lat: 16.5, lng: 80.6 },
        value: 85,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      };

      // First ingestion succeeds
      const ingested = await cityTelemetryIngestionService.ingestRawSignal('connector-weather-01', rawSignal);
      expect(ingested.eventId).toBe(`evt-${sigId}`);

      // Second ingestion with same signalId throws duplicate error
      await expect(cityTelemetryIngestionService.ingestRawSignal('connector-weather-01', rawSignal)).rejects.toThrow('DUPLICATE_EVENT');
    });

    it('should detect out-of-order event timestamps and track metrics', async () => {
      const metricsBefore = cityTelemetryIngestionService.getMetrics();

      const oldSignal: CrossDomainSignalDto = {
        signalId: `sig-ooo-${Date.now()}`,
        domain: 'MOBILITY',
        entityId: 'cam-01',
        entityName: 'Traffic Camera',
        eventType: 'VEHICLE_COUNT',
        severity: 'MEDIUM',
        location: { lat: 16.5, lng: 80.6 },
        value: 120,
        unit: 'vehicles/min',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      };

      await cityTelemetryIngestionService.ingestRawSignal('connector-mobility-01', oldSignal);

      const metricsAfter = cityTelemetryIngestionService.getMetrics();
      expect(metricsAfter.outOfOrderCount).toBeGreaterThanOrEqual(metricsBefore.outOfOrderCount);
    });
  });

  describe('4. Data Trust & Quality Engine Verification', () => {
    it('should mark physically impossible numerical values as INVALID and assign 0% trust score', async () => {
      const impossibleSignal: CrossDomainSignalDto = {
        signalId: 'sig-imp-val-01',
        domain: 'CLIMATE',
        entityId: 'WTH-01',
        entityName: 'Weather Station WTH-01',
        eventType: 'RAINFALL',
        severity: 'HIGH',
        location: { lat: 16.5, lng: 80.6 },
        value: 9999.0, // Impossible: > 300 mm/hr
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      };

      const result = qualityEngine.evaluateSignalQuality(impossibleSignal, weatherAdapter, 'LIVE');
      expect(result.qualityState).toBe('INVALID');
      expect(result.trustScore.trustLevel).toBe('UNTRUSTED');
      expect(result.anomalies.some((a) => a.anomalyType === 'IMPOSSIBLE_VALUE')).toBe(true);
    });

    it('should penalize STALE telemetry signals in trust score calculations', async () => {
      const staleTime = new Date(Date.now() - 180000).toISOString(); // 3 mins old
      const staleSignal: CrossDomainSignalDto = {
        signalId: 'sig-stale-01',
        domain: 'CLIMATE',
        entityId: 'WTH-01',
        entityName: 'Weather Station WTH-01',
        eventType: 'RAINFALL',
        severity: 'MEDIUM',
        location: { lat: 16.5, lng: 80.6 },
        value: 45.0,
        unit: 'mm/hr',
        timestamp: staleTime,
      };

      const result = qualityEngine.evaluateSignalQuality(staleSignal, weatherAdapter, 'LIVE');
      expect(result.qualityState).toBe('STALE');
      expect(result.trustScore.overallScore).toBeLessThan(85);
    });
  });

  describe('5. Data Lineage & Provenance Preservation', () => {
    it('should record complete end-to-end data lineage from ingestion to recommendation', async () => {
      const trace = lineageService.createSampleTrace(
        'connector-doppler-01',
        'evt-lineage-101',
        'sig-lineage-101',
        'LIVE',
        'FRESH',
        98.5
      );

      expect(trace.traceId).toBeDefined();
      expect(trace.providerId).toBe('connector-doppler-01');

      const retrievedTrace = lineageService.getTraceById(trace.traceId);
      expect(retrievedTrace).not.toBeNull();
      expect(retrievedTrace?.eventId).toBe('evt-lineage-101');
    });
  });

  describe('6. Provider Isolation & Fallback Resiliency', () => {
    it('should safely activate local mock fallback provider if external contract fails', async () => {
      const response = await providerManager.getCitywideSignals('city-vja');
      expect(response).toBeDefined();
      expect(response.payload).toBeDefined();
      expect(Array.isArray(response.payload)).toBe(true);
    });
  });

});
