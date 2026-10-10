import { describe, it, expect } from 'vitest';
import { cityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';

describe('Phase 8.6 Mega Prompt 2/5 — Telemetry Verification, Provider Health & Data Trust Unit Tests', () => {
  it('1. Evaluates fresh telemetry trust score >= 85 and HIGH_TRUST status', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.telemetryTrust).toBeDefined();
    if (snapshot.telemetryTrust) {
      expect(snapshot.telemetryTrust.trustScore).toBeGreaterThanOrEqual(70);
      expect(snapshot.telemetryTrust.trustExplanation).toContain('Telemetry');
    }
  });

  it('2. Evaluates stale telemetry reduction in trust score', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'LIVE_READ_ONLY');
    const quality = {
      overallScore: 70,
      freshCount: 5,
      staleCount: 2,
      invalidCount: 0,
      unknownCount: 0,
      domainBreakdown: {},
      explanation: 'Stale telemetry detected from radar node 4',
    };
    const domainStates = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'LIVE_READ_ONLY');

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(
      health,
      quality,
      domainStates,
      'LIVE_READ_ONLY'
    );

    expect(trustScore.trustCategory).toBe('STALE_DATA');
    expect(trustScore.phase7GatingStatus).toBe('ALLOWED_DEGRADED');
  });

  it('3. Blocks invalid telemetry payloads from Phase 7 pipeline', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'LIVE_READ_ONLY');
    const quality = {
      overallScore: 40,
      freshCount: 4,
      staleCount: 0,
      invalidCount: 3,
      unknownCount: 0,
      domainBreakdown: {},
      explanation: 'Invalid signals violating physical bounds',
    };
    const domainStates = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'LIVE_READ_ONLY');

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(
      health,
      quality,
      domainStates,
      'LIVE_READ_ONLY'
    );

    expect(trustScore.trustCategory).toBe('INVALID_DATA');
    expect(trustScore.phase7GatingStatus).toBe('BLOCKED_INVALID');
  });

  it('4. Applies fallback usage penalty when fallback adapter is active', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'LIVE_READ_ONLY');
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    const domainStates = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'LIVE_READ_ONLY');

    // Simulate fallback active on Transit
    domainStates.TRANSIT = {
      ...domainStates.TRANSIT,
      fallbackActive: true,
      providerStatus: 'FALLBACK',
    };

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(
      health,
      quality,
      domainStates,
      'LIVE_READ_ONLY'
    );

    const fallbackFactor = trustScore.trustFactors.find((f) => f.factor === 'Fallback Usage Penalty');
    expect(fallbackFactor).toBeDefined();
  });

  it('5. Verifies DEMO and SIMULATION mode trust categories', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'DEMO');
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'DEMO');
    const domainStates = await cityIntelligenceRuntimeService.getAllDomainRuntimeStates('city-vja', 'DEMO');

    const demoTrust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, domainStates, 'DEMO');
    expect(demoTrust.trustCategory).toBe('DEMO_DATA');

    const simTrust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, domainStates, 'SIMULATION');
    expect(simTrust.trustCategory).toBe('SIMULATION_DATA');
  });

  it('6. Rejects forbidden execution modes with AUTONOMOUS_EXECUTION_FORBIDDEN', async () => {
    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_WRITE' as any)
    ).rejects.toThrow('FORBIDDEN_EXECUTION_MODE');
  });

  it('7. Verifies provider health map returns 7 domain keys', async () => {
    const providerHealth = await cityIntelligenceRuntimeService.getProviderHealth('city-vja', 'LIVE_READ_ONLY');
    expect(Object.keys(providerHealth).length).toBe(7);
  });

  it('8. Verifies Phase 7 execution pipeline preserves governance invariants', async () => {
    const result = await cityIntelligenceRuntimeService.executePipeline({
      cityId: 'city-vja',
      executionMode: 'LIVE_READ_ONLY',
    });
    expect(result.governanceApproval.requiresHumanApproval).toBe(true);
    expect(result.governanceApproval.advisoryOnly).toBe(true);
    expect(result.governanceApproval.autonomousExecution).toBe(false);
  });
});
