// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture Unit Test Suite
// Real-World Data Integration & Live City Intelligence Layer Verification
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { cityDataProviderManagerService } from '../../lib/server/services/city-data-provider-manager.service';
import { MockCityDataProvider } from '../../lib/server/providers/mock-city-data-provider';
import { DemoCityDataProvider } from '../../lib/server/providers/demo-city-data-provider';
import { ExternalCityDataProviderContract } from '../../lib/server/providers/external-city-data-provider.contract';
import { earthMindProvenanceService } from '../../lib/server/services/earthmind-provenance.service';

describe('Phase 8 Foundation Architecture — Real-World Data Provider Abstraction', () => {
  beforeEach(() => {
    cityDataProviderManagerService.setProvider(new MockCityDataProvider());
  });

  // ── 1. Provider Switching Test ──
  it('should support dynamic provider switching between Mock, Demo, and External Contract', () => {
    expect(cityDataProviderManagerService.getActiveProvider().providerType).toBe('MOCK');

    cityDataProviderManagerService.setProviderByType('DEMO');
    expect(cityDataProviderManagerService.getActiveProvider().providerType).toBe('DEMO');
    expect(cityDataProviderManagerService.getActiveProvider().provenance).toBe('DEMO');

    cityDataProviderManagerService.setProviderByType('EXTERNAL_CONTRACT');
    expect(cityDataProviderManagerService.getActiveProvider().providerType).toBe('EXTERNAL_CONTRACT');

    cityDataProviderManagerService.setProviderByType('MOCK');
    expect(cityDataProviderManagerService.getActiveProvider().providerType).toBe('MOCK');
  });

  // ── 2. Mock Provider All 7 Domain Feeds ──
  it('should fetch structured telemetry across all 7 domain capabilities from Mock provider', async () => {
    const mockProvider = new MockCityDataProvider();

    const env = await mockProvider.getEnvironmentalTelemetry('city-vja');
    expect(env.payload.length).toBeGreaterThan(0);
    expect(env.payload[0].stationName).toBeDefined();

    const weather = await mockProvider.getWeatherFeed('city-vja');
    expect(weather.payload.rainfallAccumulationMmHr).toBe(45.0);

    const mobility = await mockProvider.getMobilityFeed('city-vja');
    expect(mobility.payload[0].congestionPercent).toBe(78.5);

    const transit = await mockProvider.getTransitFeed('city-vja');
    expect(transit.payload.averageDelayMinutes).toBe(24.5);

    const utility = await mockProvider.getUtilityTelemetry('city-vja');
    expect(utility.payload[0].thermalSurgeCelsius).toBe(74.2);

    const emergency = await mockProvider.getEmergencyFeed('city-vja');
    expect(emergency.payload.hospitalAccessDelayMinutes).toBe(18.5);

    const citizen = await mockProvider.getCitizenIntelligenceFeed('city-vja');
    expect(citizen.payload[0].upvotesCount).toBe(34);
  });

  // ── 3. Demo Provider Scenario Data ──
  it('should return scenario crisis cascade telemetry from Demo provider', async () => {
    const demoProvider = new DemoCityDataProvider();

    const weather = await demoProvider.getWeatherFeed('city-vja');
    expect(weather.payload.rainfallAccumulationMmHr).toBe(145.0);
    expect(weather.provenance).toBe('DEMO');

    const mobility = await demoProvider.getMobilityFeed('city-vja');
    expect(mobility.payload[0].congestionPercent).toBe(92.4);

    const signals = await demoProvider.getNormalizedSignals('city-vja');
    expect(signals.payload.length).toBeGreaterThan(0);
    expect(signals.provenance).toBe('DEMO');
  });

  // ── 4. Provenance Preservation Test ──
  it('should preserve explicit provenance tags across provider responses', async () => {
    const mockProvider = new MockCityDataProvider();
    const mockResponse = await mockProvider.getWeatherFeed('city-vja');
    expect(mockResponse.provenance).toBe('LIVE');

    const demoProvider = new DemoCityDataProvider();
    const demoResponse = await demoProvider.getWeatherFeed('city-vja');
    expect(demoResponse.provenance).toBe('DEMO');

    const provObj = earthMindProvenanceService.verifyProvenance('DEMO', 98, 'DEMO_WEATHER_STREAM');
    expect(provObj.dataSource).toBe('DEMO');
    expect(provObj.confidence).toBe(98);
  });

  // ── 5. Stale Data Detection Test ──
  it('should detect stale data when payload timestamp exceeds max allowed age (>60s)', async () => {
    const oldTimestamp = new Date(Date.now() - 120 * 1000).toISOString(); // 120 seconds old
    const staleMockProvider = new MockCityDataProvider(oldTimestamp);

    cityDataProviderManagerService.setProvider(staleMockProvider);
    const response = await cityDataProviderManagerService.getCitywideSignals('city-vja');

    expect(response.metadata.dataQuality).toBe('STALE');
    expect(response.metadata.freshnessSeconds).toBeGreaterThanOrEqual(120);
  });

  // ── 6. Invalid Data Rejection Test ──
  it('should mark corrupt or malformed payload timestamps as INVALID', async () => {
    const invalidMockProvider = new MockCityDataProvider('INVALID_ISO_STRING', 'INVALID');

    cityDataProviderManagerService.setProvider(invalidMockProvider);
    const response = await cityDataProviderManagerService.getCitywideSignals('city-vja');

    expect(response.metadata.dataQuality).toBe('INVALID');
  });

  // ── 7. Provider Failure Resilience & Fallback Test ──
  it('should fall back gracefully to MockProvider when external contract provider fails', async () => {
    const contractProvider = new ExternalCityDataProviderContract();
    cityDataProviderManagerService.setProvider(contractProvider);

    // Expect Manager to catch exception and return fallback signals with fall-back metadata
    const response = await cityDataProviderManagerService.getCitywideSignals('city-vja');

    expect(response.metadata.dataQuality).toBe('STALE');
    expect(response.metadata.source).toBe('SIMULATION');
    expect(response.metadata.metadata?.fallbackTriggered).toBe(true);
    expect(response.payload.length).toBeGreaterThan(0);
  });

  // ── 8. Backward Compatibility Test ──
  it('should maintain backward compatibility with existing cross-domain signal DTO structure', async () => {
    const mockProvider = new MockCityDataProvider();
    const response = await mockProvider.getNormalizedSignals('city-vja');

    for (const signal of response.payload) {
      expect(signal.signalId).toBeDefined();
      expect(signal.domain).toBeDefined();
      expect(signal.severity).toBeDefined();
      expect(signal.value).toBeTypeOf('number');
      expect(signal.timestamp).toBeDefined();
    }
  });
});
