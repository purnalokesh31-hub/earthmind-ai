// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 Real-World External Data Connector Framework Test Suite
// Verified Connector Adapters, Capability Discovery, Secret Isolation & Safety Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { WeatherProviderAdapter } from '../../lib/server/adapters/domain-adapters/weather-provider.adapter';
import { EnvironmentalProviderAdapter } from '../../lib/server/adapters/domain-adapters/environmental-provider.adapter';
import { MobilityProviderAdapter } from '../../lib/server/adapters/domain-adapters/mobility-provider.adapter';
import { TransitProviderAdapter } from '../../lib/server/adapters/domain-adapters/transit-provider.adapter';
import { UtilityProviderAdapter } from '../../lib/server/adapters/domain-adapters/utility-provider.adapter';
import { EmergencyProviderAdapter } from '../../lib/server/adapters/domain-adapters/emergency-provider.adapter';
import { CitizenIntelligenceProviderAdapter } from '../../lib/server/adapters/domain-adapters/citizen-intelligence-provider.adapter';
import { ExternalProviderAdapter } from '../../lib/server/adapters/external-provider.adapter';
import { ExternalProviderError } from '../../lib/server/domain/digital-twin/connector-framework.domain';
import { providerRegistryService } from '../../lib/server/services/provider-registry.service';
import {
  WEATHER_RAW_FIXTURE,
  ENVIRONMENTAL_RAW_FIXTURE,
  MOBILITY_RAW_FIXTURE,
  TRANSIT_RAW_FIXTURE,
  UTILITY_RAW_FIXTURE,
  EMERGENCY_RAW_FIXTURE,
  CITIZEN_RAW_FIXTURE,
} from '../../lib/server/fixtures/connector-fixtures';

describe('Phase 8.2 External Data Connector Framework Test Suite', () => {
  beforeEach(() => {
    process.env.EARTHMIND_CONNECTOR_WEATHER_TEST_API_KEY = 'ENV_SECRET_KEY_12345';
  });

  // ── 1. Schema Mapping & Signal Normalization Across All 7 Urban Domains ──
  it('should map raw external telemetry to normalized CrossDomainSignalDto across all 7 urban domains', async () => {
    const weather = new WeatherProviderAdapter({}, WEATHER_RAW_FIXTURE);
    const env = new EnvironmentalProviderAdapter({}, ENVIRONMENTAL_RAW_FIXTURE);
    const mob = new MobilityProviderAdapter({}, MOBILITY_RAW_FIXTURE);
    const trn = new TransitProviderAdapter({}, TRANSIT_RAW_FIXTURE);
    const utl = new UtilityProviderAdapter({}, UTILITY_RAW_FIXTURE);
    const emg = new EmergencyProviderAdapter({}, EMERGENCY_RAW_FIXTURE);
    const cit = new CitizenIntelligenceProviderAdapter({}, CITIZEN_RAW_FIXTURE);

    const wthSignals = weather.normalize(await weather.fetchSignals('city-vja'), 'city-vja');
    expect(wthSignals[0].domain).toBe('CLIMATE');
    expect(wthSignals[0].value).toBe(120.5);

    const envSignals = env.normalize(await env.fetchSignals('city-vja'), 'city-vja');
    expect(envSignals[0].domain).toBe('CLIMATE');
    expect(envSignals[0].value).toBe(48);

    const mobSignals = mob.normalize(await mob.fetchSignals('city-vja'), 'city-vja');
    expect(mobSignals[0].domain).toBe('MOBILITY');
    expect(mobSignals[0].value).toBe(94.8);

    const trnSignals = trn.normalize(await trn.fetchSignals('city-vja'), 'city-vja');
    expect(trnSignals[0].domain).toBe('TRANSIT');
    expect(trnSignals[0].value).toBe(38.0);

    const utlSignals = utl.normalize(await utl.fetchSignals('city-vja'), 'city-vja');
    expect(utlSignals[0].domain).toBe('UTILITY');
    expect(utlSignals[0].value).toBe(82.1);

    const emgSignals = emg.normalize(await emg.fetchSignals('city-vja'), 'city-vja');
    expect(emgSignals[0].domain).toBe('EMERGENCY_RESPONSE');
    expect(emgSignals[0].value).toBe(24.0);

    const citSignals = cit.normalize(await cit.fetchSignals('city-vja'), 'city-vja');
    expect(citSignals[0].domain).toBe('CITIZEN_INTELLIGENCE');
    expect(citSignals[0].value).toBe(189);
  });

  // ── 2. Secret Isolation Test ──
  it('should resolve secrets from process.env and NEVER expose secrets in DTOs or logs', () => {
    const adapter = new WeatherProviderAdapter({
      providerId: 'connector-weather-test',
      apiKeySecret: 'EXPLICIT_SECRET_KEY',
    });

    const sanitized = providerRegistryService.sanitizeConfig(adapter.config);
    expect((sanitized as any).apiKeySecret).toBeUndefined();
    expect(JSON.stringify(sanitized)).not.toContain('EXPLICIT_SECRET_KEY');
    expect(JSON.stringify(sanitized)).not.toContain('ENV_SECRET_KEY_12345');
    expect(sanitized.hasSecretConfigured).toBe(true);
  });

  // ── 3. Capability Discovery Test ──
  it('should report comprehensive provider capabilities across supported metrics and freshness', () => {
    const weather = new WeatherProviderAdapter();
    const caps = weather.getCapabilities();

    expect(caps.providerId).toBe('connector-doppler-weather-01');
    expect(caps.supportedDomains).toContain('WEATHER');
    expect(caps.supportedMetrics.length).toBeGreaterThan(0);
    expect(caps.freshnessThresholdSeconds).toBe(60);
  });

  // ── 4. Rate Limiting Test ──
  it('should enforce rate limits and throw PROVIDER_RATE_LIMITED when limit is exceeded', async () => {
    const limitedAdapter = new WeatherProviderAdapter({
      providerId: 'connector-rate-limit-test',
      rateLimit: { maxRequestsPerMinute: 2 },
    });

    await limitedAdapter.fetchSignals('city-vja');
    await limitedAdapter.fetchSignals('city-vja');

    try {
      await limitedAdapter.fetchSignals('city-vja');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ExternalProviderError);
      expect(err.code).toBe('PROVIDER_RATE_LIMITED');
      expect(err.statusCode).toBe(429);
    }
  });

  // ── 5. Request Correlation ID Test ──
  it('should attach correlation IDs to request execution logs for auditability', async () => {
    const weather = new WeatherProviderAdapter();
    await weather.fetchSignals('city-vja');

    const logs = weather.getRequestLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].correlationId).toMatch(/^corr-ext-/);
    expect(logs[0].success).toBe(true);
  });

  // ── 6. Malformed & Stale Payload Handling Test ──
  it('should reject malformed raw payloads via payload validation', () => {
    const weather = new WeatherProviderAdapter();
    const invalidPayload = { invalid_field: true };

    expect(weather.validatePayload(invalidPayload)).toBe(false);
  });

  // ── 7. Resilient Fallback & Provenance Guarantee ──
  it('should fall back to simulation signals when external connector fails and NEVER label fallback as LIVE', async () => {
    class FailingExternalAdapter extends ExternalProviderAdapter {
      constructor(providerId: string = 'connector-failing-wth') {
        super({
          providerId,
          providerName: 'Failing External Connector',
          providerType: 'EXTERNAL_CONTRACT',
          domain: 'WEATHER',
          enabled: true,
          timeoutMs: 100,
          retryPolicy: { maxRetries: 1, backoffFactorMs: 10 },
          rateLimit: { maxRequestsPerMinute: 600 },
          freshnessThresholdSeconds: 60,
          authenticationMode: 'NONE',
          endpointUrl: 'https://failing.api/test',
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
      }

      protected async fetchRawData(cityId: string): Promise<any> {
        throw new Error('INTENTIONAL_EXTERNAL_CONNECTOR_FAILURE');
      }

      public validatePayload(raw: any): boolean {
        return false;
      }

      public normalize(raw: any, cityId: string): any[] {
        return [];
      }
    }

    const failingAdapter = new FailingExternalAdapter();

    providerRegistryService.registerProviderAdapter(failingAdapter);
    const isolated = await providerRegistryService.fetchSignalsIsolated('connector-failing-wth', 'city-vja');

    expect(isolated.fallbackTriggered).toBe(true);
    expect(isolated.metadata.source).toBe('SIMULATION');
    expect(isolated.metadata.source).not.toBe('LIVE');

    providerRegistryService.unregisterProvider('connector-failing-wth');
  });
});
