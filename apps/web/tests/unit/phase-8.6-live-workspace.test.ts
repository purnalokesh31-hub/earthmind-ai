import { describe, it, expect } from 'vitest';
import { cityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';

describe('Phase 8.6 — Command Center Live Intelligence Workspace Integration Unit Tests', () => {
  it('1. Verifies City Intelligence Scores API response structure', async () => {
    const overview = await cityIntelligenceRuntimeService.getRuntimeOverview('city-vja', 'LIVE_READ_ONLY');
    expect(overview.cityId).toBe('city-vja');
    expect(overview.executionMode).toBe('LIVE_READ_ONLY');
    expect(overview.health).toBeDefined();
    expect(overview.quality).toBeDefined();
    expect(overview.governance.advisoryOnly).toBe(true);
  });

  it('2. Verifies 7-Domain Telemetry Grid API response', async () => {
    const domainsMap = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'LIVE_READ_ONLY');
    const domainKeys = Object.keys(domainsMap);
    expect(domainKeys.length).toBe(7);
    expect(domainKeys).toContain('ENVIRONMENTAL');
    expect(domainKeys).toContain('WEATHER');
    expect(domainKeys).toContain('MOBILITY');
    expect(domainKeys).toContain('TRANSIT');
    expect(domainKeys).toContain('UTILITY');
    expect(domainKeys).toContain('EMERGENCY');
    expect(domainKeys).toContain('CITIZEN_INTELLIGENCE');
  });

  it('3. Verifies Data Quality breakdown metrics', async () => {
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    expect(quality.freshCount).toBeGreaterThanOrEqual(0);
    expect(quality.staleCount).toBeGreaterThanOrEqual(0);
    expect(quality.invalidCount).toBeGreaterThanOrEqual(0);
  });

  it('4. Verifies Provider Health circuit breaker and status structure', async () => {
    const providerHealth = await cityIntelligenceRuntimeService.getProviderHealth('city-vja', 'LIVE_READ_ONLY');
    expect(Object.keys(providerHealth).length).toBe(7);
    for (const status of Object.values(providerHealth)) {
      expect(['HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'FALLBACK', 'UNKNOWN']).toContain(status);
    }
  });

  it('5. Verifies Event Stream chronological payload', async () => {
    const events = await cityIntelligenceRuntimeService.getRuntimeEvents('city-vja', 'LIVE_READ_ONLY', { limit: 10 });
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeLessThanOrEqual(10);
  });

  it('6. Verifies Phase 7 Pipeline bridge governance invariants', async () => {
    const pipeline = await cityIntelligenceRuntimeService.executePipeline({
      cityId: 'city-vja',
      executionMode: 'LIVE_READ_ONLY',
    });
    expect(pipeline.governanceApproval.requiresHumanApproval).toBe(true);
    expect(pipeline.governanceApproval.advisoryOnly).toBe(true);
    expect(pipeline.governanceApproval.autonomousExecution).toBe(false);
  });
});
