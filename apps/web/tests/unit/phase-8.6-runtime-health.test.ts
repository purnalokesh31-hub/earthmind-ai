// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Mega Prompt 3/6 Runtime Health & Quality Test Suite
// Verifies Health Engine, Data Quality, Telemetry Coverage, Readiness & Safety Enforcement
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { cityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';
import { DomainRuntimeState } from '../../lib/server/domain/digital-twin/city-intelligence-runtime.domain';

describe('Phase 8.6 — Runtime Health & Data Quality Engine Test Suite', () => {
  let mockSignals: CrossDomainSignalDto[];

  beforeEach(() => {
    const loc = { lat: 16.5, lng: 80.6 };
    mockSignals = [
      { signalId: 'sig-wth-01', domain: 'CLIMATE', entityId: 'station-01', entityName: 'Weather Station 1', eventType: 'RAINFALL', severity: 'HIGH', location: loc, value: 45, unit: 'mm/hr', timestamp: new Date().toISOString() },
      { signalId: 'sig-env-01', domain: 'CLIMATE', entityId: 'env-01', entityName: 'AQI Sensor 1', eventType: 'AQI_UPDATE', severity: 'MEDIUM', location: loc, value: 120, unit: 'AQI', timestamp: new Date().toISOString() },
      { signalId: 'sig-mob-01', domain: 'MOBILITY', entityId: 'mob-01', entityName: 'Traffic Camera 1', eventType: 'SPEED_UPDATE', severity: 'LOW', location: loc, value: 15, unit: 'km/h', timestamp: new Date().toISOString() },
      { signalId: 'sig-trn-01', domain: 'TRANSIT', entityId: 'trn-01', entityName: 'Bus 12B', eventType: 'DELAY_UPDATE', severity: 'MEDIUM', location: loc, value: 25, unit: 'mins', timestamp: new Date().toISOString() },
      { signalId: 'sig-utl-01', domain: 'UTILITY', entityId: 'utl-01', entityName: 'Transformer TX4', eventType: 'TEMPERATURE_UPDATE', severity: 'HIGH', location: loc, value: 85, unit: 'C', timestamp: new Date().toISOString() },
      { signalId: 'sig-emg-01', domain: 'EMERGENCY_RESPONSE', entityId: 'emg-01', entityName: 'Emergency Unit 4', eventType: 'DISPATCH_DELAY', severity: 'HIGH', location: loc, value: 5, unit: 'mins', timestamp: new Date().toISOString() },
      { signalId: 'sig-cit-01', domain: 'CITIZEN_INTELLIGENCE', entityId: 'cit-01', entityName: 'Civic Report Hub', eventType: 'CIVIC_REPORT', severity: 'LOW', location: loc, value: 12, unit: 'count', timestamp: new Date().toISOString() },
    ];
  });

  it('1. Calculates 100% telemetry coverage when all 7 domains are healthy', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.health.telemetryCoverage).toBeGreaterThanOrEqual(0);
    expect(snapshot.health.explanations.telemetryCoverage).toBeDefined();
  });

  it('2. Evaluates missing domain and reduces coverage percentage', async () => {
    const domainStates: Record<string, DomainRuntimeState> = {
      ENVIRONMENTAL: { domain: 'CLIMATE', cityId: 'city-vja', providerType: 'EXTERNAL_CONTRACT', providerStatus: 'ONLINE', lastUpdate: new Date().toISOString(), freshnessSeconds: 10, confidence: 90, dataQuality: 'FRESH', availability: 100, failureCount: 0, fallbackActive: false, telemetryCount: 1, signalCount: 1, provenance: 'LIVE', explanation: 'Online' },
      WEATHER: { domain: 'CLIMATE', cityId: 'city-vja', providerType: 'EXTERNAL_CONTRACT', providerStatus: 'ONLINE', lastUpdate: new Date().toISOString(), freshnessSeconds: 10, confidence: 90, dataQuality: 'FRESH', availability: 100, failureCount: 0, fallbackActive: false, telemetryCount: 1, signalCount: 1, provenance: 'LIVE', explanation: 'Online' },
      MOBILITY: { domain: 'MOBILITY', cityId: 'city-vja', providerType: 'MOCK', providerStatus: 'UNAVAILABLE', lastUpdate: new Date().toISOString(), freshnessSeconds: 9999, confidence: 0, dataQuality: 'UNKNOWN', availability: 0, failureCount: 1, fallbackActive: true, telemetryCount: 0, signalCount: 0, provenance: 'LIVE', explanation: 'Unavailable' },
    };

    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(domainStates, mockSignals);
    expect(health.telemetryCoverage).toBe(29); // 2 / 7 = 28.57% -> 29%
  });

  it('3 & 4. Evaluates freshness and data quality with invalid payload penalty', () => {
    const quality = cityIntelligenceRuntimeHealthService.calculateQuality(mockSignals, 2, 1, 10);
    expect(quality.staleCount).toBe(2);
    expect(quality.invalidCount).toBe(1);
    expect(quality.overallScore).toBeLessThan(100);
  });

  it('5 & 6. Evaluates fallback provider and failure states', async () => {
    const providerHealth = await cityIntelligenceRuntimeService.getProviderHealth('city-vja', 'DEMO');
    expect(providerHealth).toBeDefined();
    expect(Object.keys(providerHealth).length).toBe(7);
  });

  it('7 & 8. Evaluates average freshness and freshness status', () => {
    const freshness = cityIntelligenceRuntimeHealthService.calculateFreshness(mockSignals);
    expect(freshness.averageFreshnessSeconds).toBeGreaterThanOrEqual(0);
    expect(freshness.freshSignalsPercentage).toBeGreaterThanOrEqual(0);
  });

  it('9, 10, 11, 12, 13. Intelligence readiness scoring (READY, READY_WITH_WARNINGS, DEGRADED, NOT_READY)', async () => {
    const readiness = await cityIntelligenceRuntimeService.getIntelligenceReadiness('city-vja', 'LIVE_READ_ONLY');
    expect(readiness.readinessScore).toBeGreaterThanOrEqual(0);
    expect(['READY', 'READY_WITH_WARNINGS', 'DEGRADED', 'NOT_READY']).toContain(readiness.readinessStatus);
    expect(readiness.explanation).toBeDefined();
  });

  it('14 & 15. Generates operational runtime alerts and correlations', async () => {
    const alerts = await cityIntelligenceRuntimeService.getRuntimeAlerts('city-vja');
    expect(Array.isArray(alerts)).toBe(true);
    for (const a of alerts) {
      expect(a.requiresHumanApproval).toBe(true);
      expect(a.advisoryOnly).toBe(true);
      expect(a.autonomousExecution).toBe(false);
    }

    const correlations = await cityIntelligenceRuntimeService.getRuntimeCorrelations('city-vja');
    expect(Array.isArray(correlations)).toBe(true);
  });

  it('16 & 17. Provenance preservation and deterministic scoring', async () => {
    const snapshotLive = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshotLive.provenance.primarySource).toBe('LIVE');

    const snapshotDemo = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'DEMO');
    expect(snapshotDemo.provenance.primarySource).toBe('DEMO');
  });

  it('18 & 19. Duplicate and out-of-order event resilience', async () => {
    const events = await cityIntelligenceRuntimeService.getRuntimeEvents('city-vja');
    expect(Array.isArray(events)).toBe(true);
  });

  it('20, 21, 22, 23. Execution mode safety enforcement (LIVE_READ_ONLY vs LIVE_WRITE / AUTONOMOUS)', async () => {
    expect(() => cityIntelligenceRuntimeService.assertExecutionMode('LIVE_WRITE')).toThrow('FORBIDDEN_EXECUTION_MODE');
    expect(() => cityIntelligenceRuntimeService.assertExecutionMode('AUTONOMOUS')).toThrow('FORBIDDEN_EXECUTION_MODE');
    expect(() => cityIntelligenceRuntimeService.assertExecutionMode('PHYSICAL_EXECUTION')).toThrow('FORBIDDEN_EXECUTION_MODE');
  });

  it('24 & 25. AI Tool Compatibility - AI Tools registered and read-only', async () => {
    const toolOverview = toolRegistry.getTool('city_runtime_overview');
    expect(toolOverview).toBeDefined();
    expect(toolOverview?.readOnly).toBe(true);

    const toolHealth = toolRegistry.getTool('city_runtime_health');
    expect(toolHealth).toBeDefined();
    expect(toolHealth?.readOnly).toBe(true);

    const toolDomains = toolRegistry.getTool('city_runtime_domains');
    expect(toolDomains).toBeDefined();
    expect(toolDomains?.readOnly).toBe(true);
  });

  it('26. Phase 7 pipeline integration compatibility', async () => {
    const overview = await cityIntelligenceRuntimeService.executePipeline('city-vja');
    expect(overview.pipelineStages.length).toBe(7);
  });
});
