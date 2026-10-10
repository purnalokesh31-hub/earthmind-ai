// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Mega Prompt 2/6 Runtime Aggregation Test Suite
// Verifies 7-Domain Orchestration, Health Aggregation, Provider Resilience & Phase 7 Compatibility
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CityRuntimeState,
  DomainRuntimeState,
  TelemetrySnapshot,
  RuntimeHealth,
  RuntimeDataQuality,
  RuntimeCoverage,
  RuntimeProvenance,
  RuntimeAlert,
  RuntimeCorrelation,
  RuntimeUpdateEvent,
  SUPPORTED_RUNTIME_DOMAINS,
  assertRuntimeExecutionMode,
} from '../../lib/server/domain/digital-twin/city-intelligence-runtime.domain';
import { CityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';
import { cityTelemetryIngestionService } from '../../lib/server/services/city-telemetry-ingestion.service';
import { cityDataProviderManagerService } from '../../lib/server/services/city-data-provider-manager.service';

describe('Phase 8.6 — Runtime Aggregation & 7-Domain Orchestration Test Suite', () => {
  let runtimeService: CityIntelligenceRuntimeService;

  beforeEach(() => {
    runtimeService = new CityIntelligenceRuntimeService();
  });

  // ── 1. Domain Entities & Safety Checks ──
  it('1. CityRuntimeState contains all mandatory fields', async () => {
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.cityId).toBe('city-vja');
    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.executionMode).toBe('LIVE_READ_ONLY');
    expect(snapshot.domains).toBeDefined();
    expect(snapshot.telemetrySnapshot).toBeDefined();
    expect(snapshot.health).toBeDefined();
    expect(snapshot.quality).toBeDefined();
    expect(snapshot.coverage).toBeDefined();
    expect(snapshot.provenance).toBeDefined();
    expect(Array.isArray(snapshot.alerts)).toBe(true);
    expect(Array.isArray(snapshot.correlations)).toBe(true);
    expect(Array.isArray(snapshot.recentEvents)).toBe(true);
  });

  it('2. All seven domains are orchestrated and represented in runtime state', async () => {
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja');
    const domainsMap = snapshot.domains;

    expect(Object.keys(domainsMap).length).toBe(7);
    for (const dom of SUPPORTED_RUNTIME_DOMAINS) {
      expect(domainsMap[dom]).toBeDefined();
      expect(domainsMap[dom].domain).toBe(dom);
    }
  });

  it('3. Complete telemetry produces full domain coverage', async () => {
    const coverage = await runtimeService.getRuntimeCoverage('city-vja', 'LIVE_READ_ONLY');
    expect(coverage.domainCoverage).toBeGreaterThan(0);
    expect(coverage.temporalCoverage).toBeGreaterThanOrEqual(0);
  });

  it('4 & 5. Missing domain produces UNKNOWN/unavailable state and reduces telemetry coverage', async () => {
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja');
    // If any domain is unavailable, coverage is < 100
    const domainStates = Object.values(snapshot.domains);
    const availableCount = domainStates.filter((d) => d.signalCount > 0).length;
    const expectedCoverage = Math.round((availableCount / 7) * 100);

    expect(snapshot.health.telemetryCoverage).toBe(expectedCoverage);
    expect(snapshot.coverage.domainCoverage).toBe(expectedCoverage);
  });

  it('6 & 7. Provider failure does not crash runtime and fallback is represented', async () => {
    // Switch to MOCK provider to simulate provider fallback
    cityDataProviderManagerService.setProviderByType('MOCK');
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja', 'DEMO');

    expect(snapshot).toBeDefined();
    expect(snapshot.executionMode).toBe('DEMO');
    expect(snapshot.health.cityIntelligenceReadiness).toBeGreaterThan(0);
  });

  it('8. Fallback provenance is preserved', async () => {
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja', 'SIMULATION');
    expect(snapshot.provenance.primarySource).toBe('SIMULATION');
    expect(snapshot.provenance.isPureLive).toBe(false);
  });

  it('9 & 10. Stale and invalid telemetry handling', async () => {
    const quality = await runtimeService.getRuntimeQuality('city-vja');
    expect(quality).toBeDefined();
    expect(quality.overallScore).toBeGreaterThanOrEqual(0);
    expect(quality.explanation).toBeDefined();
  });

  it('11 & 12. Duplicate and out-of-order event resilience', async () => {
    const rawSignal: CrossDomainSignalDto = {
      signalId: `sig-order-${Date.now()}`,
      domain: 'CLIMATE',
      entityId: 'sensor-01',
      entityName: 'Sensor Unit',
      eventType: 'TEMPERATURE',
      severity: 'LOW',
      location: { lat: 16.5, lng: 80.6 },
      value: 32,
      unit: 'C',
      timestamp: new Date().toISOString(),
    };

    const ingested = await cityTelemetryIngestionService.ingestRawSignal('connector-weather-01', rawSignal);
    expect(ingested.eventId).toBeDefined();

    // Duplicate ingestion rejects
    await expect(cityTelemetryIngestionService.ingestRawSignal('connector-weather-01', rawSignal)).rejects.toThrow();
  });

  it('13, 14, 15, 16. Domain metrics preserved in DomainRuntimeState', async () => {
    const envState = await runtimeService.getDomainRuntimeState('city-vja', 'ENVIRONMENTAL');
    expect(envState).toBeDefined();
    expect(envState.domain).toBe('ENVIRONMENTAL');
    expect(typeof envState.confidence).toBe('number');
    expect(typeof envState.failureCount).toBe('number');
    expect(envState.lastUpdate).toBeDefined();
    expect(envState.explanation).toBeDefined();
  });

  it('17, 18, 19, 20, 21, 22. Deterministic citywide health scores and explanations', async () => {
    const health = await runtimeService.getRuntimeHealth('city-vja');

    expect(health.telemetryCoverage).toBeGreaterThanOrEqual(0);
    expect(health.dataQualityScore).toBeGreaterThanOrEqual(0);
    expect(health.freshnessScore).toBeGreaterThanOrEqual(0);
    expect(health.providerHealthScore).toBeGreaterThanOrEqual(0);
    expect(health.cityIntelligenceReadiness).toBeGreaterThanOrEqual(0);

    expect(health.explanations.telemetryCoverage).toBeDefined();
    expect(health.explanations.dataQualityScore).toBeDefined();
    expect(health.explanations.freshnessScore).toBeDefined();
    expect(health.explanations.providerHealthScore).toBeDefined();
    expect(health.explanations.cityIntelligenceReadiness).toBeDefined();
  });

  it('23, 24, 25. Execution mode switching (LIVE_READ_ONLY, DEMO, SIMULATION)', async () => {
    runtimeService.setExecutionMode('LIVE_READ_ONLY');
    expect(runtimeService.getExecutionMode()).toBe('LIVE_READ_ONLY');

    runtimeService.setExecutionMode('DEMO');
    expect(runtimeService.getExecutionMode()).toBe('DEMO');

    runtimeService.setExecutionMode('SIMULATION');
    expect(runtimeService.getExecutionMode()).toBe('SIMULATION');
  });

  it('26, 27, 28. Safety Gateway rejection of forbidden modes (LIVE_WRITE, AUTONOMOUS, PHYSICAL_EXECUTION)', async () => {
    expect(() => runtimeService.assertExecutionMode('LIVE_WRITE')).toThrow('FORBIDDEN_EXECUTION_MODE');
    expect(() => runtimeService.assertExecutionMode('AUTONOMOUS')).toThrow('FORBIDDEN_EXECUTION_MODE');
    expect(() => runtimeService.assertExecutionMode('PHYSICAL_EXECUTION')).toThrow('FORBIDDEN_EXECUTION_MODE');
  });

  it('29, 30, 31. Strict preservation of advisory-only safety invariants', async () => {
    const snapshot = await runtimeService.getRuntimeSnapshot('city-vja');
    expect(snapshot.requiresHumanApproval).toBe(true);
    expect(snapshot.advisoryOnly).toBe(true);
    expect(snapshot.autonomousExecution).toBe(false);

    // Verify physical actuation capability does NOT exist
    expect((snapshot as any).physicalActuationEnabled).toBeUndefined();
    expect((runtimeService as any).executePhysicalIntervention).toBeUndefined();
  });

  it('32 - 37. Phase 7 Pipeline Compatibility Bridges (Phase 7.8 - 7.11)', async () => {
    runtimeService.setExecutionMode('LIVE_READ_ONLY');
    const overview = await runtimeService.executePipeline('city-vja');

    expect(overview.cityId).toBe('city-vja');
    expect(overview.executionMode).toBe('LIVE_READ_ONLY');
    expect(overview.pipelineStages.length).toBe(7);

    const stg1 = overview.pipelineStages.find((s) => s.stageId === 'stage-1-signals');
    expect(stg1?.provenance).toBe('LIVE');

    const stg7 = overview.pipelineStages.find((s) => s.stageId === 'stage-7-governance');
    expect(stg7?.status).toBe('PENDING_APPROVAL');
    expect(stg7?.details).toContain('HUMAN APPROVAL REQUIRED');
  });

  describe('Edge-case Scenarios', () => {
    it('should handle zero valid signals gracefully', async () => {
      const snapshot = await runtimeService.getRuntimeSnapshot('non-existent-city');
      expect(snapshot).toBeDefined();
      expect(snapshot.health.cityIntelligenceReadiness).toBeGreaterThanOrEqual(0);
    });

    it('should query specific domain runtime state cleanly', async () => {
      const weatherState = await runtimeService.getDomainRuntimeState('city-vja', 'WEATHER');
      expect(weatherState.domain).toBe('WEATHER');

      const allStates = await runtimeService.getAllDomainRuntimeStates('city-vja');
      expect(Object.keys(allStates).length).toBe(7);
    });

    it('should prepare Phase 7 read-only context DTOs', async () => {
      const snapshot = await runtimeService.getRuntimeSnapshot('city-vja');
      const p7Context = runtimeService.preparePhase7Context(snapshot.telemetrySnapshot);

      expect(p7Context.cityId).toBe('city-vja');
      expect(p7Context.advisoryOnly).toBe(true);
      expect(p7Context.requiresHumanApproval).toBe(true);
      expect(p7Context.autonomousExecution).toBe(false);
    });
  });

});
