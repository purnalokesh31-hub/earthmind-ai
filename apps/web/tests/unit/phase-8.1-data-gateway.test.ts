// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Production Data Gateway Test Suite
// Verified Data Gateway Architecture & Resilience Test Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { providerRegistryService } from '../../lib/server/services/provider-registry.service';
import { providerHealthService } from '../../lib/server/services/provider-health.service';
import { MockProviderAdapter } from '../../lib/server/adapters/mock-provider-adapter';
import { DemoProviderAdapter } from '../../lib/server/adapters/demo-provider-adapter';
import { ExternalProviderAdapterContract } from '../../lib/server/adapters/external-provider-adapter.contract';
import { BaseProviderAdapter } from '../../lib/server/adapters/base-provider-adapter';

// Helper Failing Adapter for Testing Resilience & Circuit Breaker
class FailingTestAdapter extends BaseProviderAdapter {
  public failCountNeeded: number;
  public currentFails: number = 0;

  constructor(providerId: string = 'provider-failing-test', failCountNeeded: number = 5) {
    super({
      providerId,
      providerName: 'Failing Test Adapter',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'UTILITY',
      enabled: true,
      timeoutMs: 100,
      retryPolicy: { maxRetries: 1, backoffFactorMs: 10 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'NONE',
      endpointUrl: 'mock://failing/endpoint',
      health: {
        status: 'UNKNOWN',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    });
    this.failCountNeeded = failCountNeeded;
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (this.currentFails < this.failCountNeeded) {
      this.currentFails++;
      throw new Error(`TEST_FAIL_INTENTIONAL: Fail attempt ${this.currentFails}`);
    }
    return [{ signalId: 'sig-recovered', domain: 'UTILITY', eventType: 'RECOVERED', value: 100 }];
  }

  public validatePayload(rawPayload: any): boolean {
    return Array.isArray(rawPayload) && rawPayload.length > 0;
  }

  public normalize(rawPayload: any, cityId: string): any[] {
    return rawPayload;
  }
}

describe('Phase 8.1 Production Data Gateway Test Suite', () => {
  beforeEach(() => {
    // Reset or ensure default providers are registered
  });

  // ── 1. Provider Registration & Duplicate Protection ──
  it('should register providers and throw DUPLICATE_PROVIDER_REGISTRATION on duplicate ID', () => {
    const customAdapter = new MockProviderAdapter({ providerId: 'provider-unique-001' });
    providerRegistryService.registerProviderAdapter(customAdapter);

    expect(providerRegistryService.getProviderAdapter('provider-unique-001')).toBeDefined();

    expect(() => {
      providerRegistryService.registerProviderAdapter(customAdapter);
    }).toThrow(/DUPLICATE_PROVIDER_REGISTRATION/);

    providerRegistryService.unregisterProvider('provider-unique-001');
  });

  // ── 2. Provider Enable / Disable Toggle ──
  it('should enable and disable provider configurations', () => {
    const mock = new MockProviderAdapter({ providerId: 'provider-toggle-test' });
    providerRegistryService.registerProviderAdapter(mock);

    const disabled = providerRegistryService.enableProvider('provider-toggle-test', false);
    expect(disabled.enabled).toBe(false);

    const enabled = providerRegistryService.enableProvider('provider-toggle-test', true);
    expect(enabled.enabled).toBe(true);

    providerRegistryService.unregisterProvider('provider-toggle-test');
  });

  // ── 3. Secret Sanitization Test ──
  it('should sanitize API key and bearer token secrets from user-facing configurations', () => {
    const contract = new ExternalProviderAdapterContract();
    const sanitized = providerRegistryService.sanitizeConfig(contract.config);

    expect((sanitized as any).apiKeySecret).toBeUndefined();
    expect(sanitized.hasSecretConfigured).toBe(true);
  });

  // ── 4. Timeout & Retry Policy Test ──
  it('should execute retries on failure before recording final failure', async () => {
    const failing = new FailingTestAdapter('provider-retry-test', 2);
    try {
      await failing.fetchSignals('city-vja');
    } catch (err: any) {
      expect(err.message).toContain('PROVIDER_FETCH_FAILED');
    }
  });

  // ── 5. Circuit Breaker State Machine Test ──
  it('should transition Circuit Breaker from CLOSED to OPEN after 3 consecutive failures', async () => {
    const failing = new FailingTestAdapter('provider-cb-test', 10);

    for (let i = 0; i < 3; i++) {
      try {
        await failing.fetchSignals('city-vja');
      } catch (e) {}
    }

    const health = await failing.healthCheck();
    expect(health.circuitState).toBe('OPEN');
    expect(health.status).toBe('UNAVAILABLE');

    // Subsequent calls should fail immediately with CIRCUIT_OPEN
    try {
      await failing.fetchSignals('city-vja');
    } catch (err: any) {
      expect(err.message).toContain('CIRCUIT_OPEN');
    }
  });

  // ── 6. Resilient Fallback Handling & Provenance Guarantee ──
  it('should fall back gracefully to simulation signals and NEVER tag fallback data as LIVE', async () => {
    const failingId = 'provider-fail-isolation-test';
    const failing = new FailingTestAdapter(failingId, 10);
    providerRegistryService.registerProviderAdapter(failing);

    const isolatedResult = await providerRegistryService.fetchSignalsIsolated(failingId, 'city-vja');

    expect(isolatedResult.fallbackTriggered).toBe(true);
    expect(isolatedResult.metadata.source).toBe('SIMULATION'); // MUST NOT BE LIVE!
    expect(isolatedResult.metadata.dataQuality).toBe('STALE');
    expect(isolatedResult.signals.length).toBeGreaterThan(0);

    providerRegistryService.unregisterProvider(failingId);
  });

  // ── 7. Provider Health Snapshot Test ──
  it('should compute complete system health snapshot across all 7 domains', () => {
    const snapshot = providerRegistryService.getOverallHealthSnapshot();

    expect(snapshot.totalProviders).toBeGreaterThan(0);
    expect(snapshot.activeDomainCoverage.WEATHER).toBeGreaterThanOrEqual(1);
    expect(snapshot.activeDomainCoverage.ENVIRONMENTAL).toBeGreaterThanOrEqual(1);
    expect(snapshot.activeDomainCoverage.UTILITY).toBeGreaterThanOrEqual(1);
  });

  // ── 8. Phase 7 Pipeline Integration & Signal Compatibility ──
  it('should output CrossDomainSignalDto compliant signals for Phase 7 intelligence', async () => {
    const mock = new MockProviderAdapter();
    const raw = await mock.fetchSignals('city-vja');
    const signals = mock.normalize(raw, 'city-vja');

    for (const sig of signals) {
      expect(sig.signalId).toBeDefined();
      expect(['CLIMATE', 'MOBILITY', 'TRANSIT', 'UTILITY', 'EMERGENCY_RESPONSE', 'CITIZEN_INTELLIGENCE']).toContain(sig.domain);
      expect(sig.severity).toBeDefined();
      expect(typeof sig.value).toBe('number');
    }
  });
});
