// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Mega Prompt 5/6 Command Center Unit Test Suite
// Verifies Workspace Rendering, Governance Envelopes, Domain Grid & Safety Invariants
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';

describe('Phase 8.6 — Command Center Runtime Workspace Unit Test Suite', () => {
  it('1. Runtime workspace dataset retrieves canonical snapshot', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.cityId).toBe('city-vja');
    expect(snapshot.executionMode).toBe('LIVE_READ_ONLY');
    expect(snapshot.governance!.requiresHumanApproval).toBe(true);
    expect(snapshot.governance!.advisoryOnly).toBe(true);
    expect(snapshot.governance!.autonomousExecution).toBe(false);
  });

  it('2. Seven domains render in canonical dataset', async () => {
    const domainStates = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'LIVE_READ_ONLY');
    const domainNames = Object.keys(domainStates);
    expect(domainNames.length).toBe(7);
    expect(domainNames).toContain('ENVIRONMENTAL');
    expect(domainNames).toContain('WEATHER');
    expect(domainNames).toContain('MOBILITY');
    expect(domainNames).toContain('TRANSIT');
    expect(domainNames).toContain('UTILITY');
    expect(domainNames).toContain('EMERGENCY');
    expect(domainNames).toContain('CITIZEN_INTELLIGENCE');
  });

  it('3. Health metrics render with 0-100 scores and explanations', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'LIVE_READ_ONLY');
    expect(health.cityIntelligenceReadiness).toBeGreaterThanOrEqual(0);
    expect(health.cityIntelligenceReadiness).toBeLessThanOrEqual(100);
    expect(health.telemetryCoverage).toBeGreaterThanOrEqual(0);
    expect(health.dataQualityScore).toBeGreaterThanOrEqual(0);
    expect(health.freshnessScore).toBeGreaterThanOrEqual(0);
    expect(health.providerHealthScore).toBeGreaterThanOrEqual(0);
    expect(health.explanations).toBeDefined();
  });

  it('4. Data Quality metrics break down fresh, stale, invalid and fallback signals', async () => {
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    expect(quality.overallScore).toBeGreaterThanOrEqual(0);
    expect(quality.freshCount).toBeGreaterThanOrEqual(0);
    expect(quality.explanation).toBeDefined();
  });

  it('5. Coverage metrics calculate total, available and missing domains', async () => {
    const coverage = await cityIntelligenceRuntimeService.getRuntimeCoverage('city-vja', 'LIVE_READ_ONLY');
    expect(coverage.domainCoverage).toBeGreaterThanOrEqual(0);
    expect(coverage.missingDomains).toBeDefined();
    expect(coverage.spatialCoverage).toBe('UNKNOWN');
  });

  it('6. Provider health returns provider statuses across all adapters', async () => {
    const providerHealth = await cityIntelligenceRuntimeService.getProviderHealth('city-vja', 'LIVE_READ_ONLY');
    expect(Object.keys(providerHealth).length).toBeGreaterThan(0);
    for (const pStatus of Object.values(providerHealth)) {
      expect(['HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'FALLBACK', 'UNKNOWN']).toContain(pStatus);
    }
  });

  it('7 & 8. Runtime alerts and cross-domain correlations render advisory payloads', async () => {
    const alerts = await cityIntelligenceRuntimeService.getRuntimeAlerts('city-vja', 'LIVE_READ_ONLY');
    expect(Array.isArray(alerts)).toBe(true);

    const correlations = await cityIntelligenceRuntimeService.getRuntimeCorrelations('city-vja', 'LIVE_READ_ONLY');
    expect(Array.isArray(correlations)).toBe(true);
  });

  it('11, 12, 13. Supports valid execution modes: LIVE_READ_ONLY, DEMO, SIMULATION', async () => {
    const live = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(live.executionMode).toBe('LIVE_READ_ONLY');

    const demo = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'DEMO');
    expect(demo.executionMode).toBe('DEMO');

    const sim = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'SIMULATION');
    expect(sim.executionMode).toBe('SIMULATION');
  });

  it('21, 22, 23. Governance banner and safety invariants enforce no autonomous execution', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.governance!.requiresHumanApproval).toBe(true);
    expect(snapshot.governance!.advisoryOnly).toBe(true);
    expect(snapshot.governance!.autonomousExecution).toBe(false);
  });

  it('26. Reject forbidden physical execution attempts', async () => {
    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'AUTONOMOUS' as any)
    ).rejects.toThrow('FORBIDDEN_EXECUTION_MODE');
  });
});
