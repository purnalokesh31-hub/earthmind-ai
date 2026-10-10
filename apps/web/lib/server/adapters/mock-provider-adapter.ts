// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Mock Provider Adapter Implementation
// ──────────────────────────────────────────────────────────────

import { BaseProviderAdapter } from './base-provider-adapter';
import { ProviderConfigDto } from '../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { MockCityDataProvider } from '../providers/mock-city-data-provider';

export class MockProviderAdapter extends BaseProviderAdapter {
  private mockProvider: MockCityDataProvider;

  constructor(customConfig?: Partial<ProviderConfigDto>) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'provider-mock-gateway',
      providerName: 'Mock Data Gateway Adapter',
      providerType: 'MOCK',
      domain: 'ENVIRONMENTAL',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'NONE',
      endpointUrl: 'mock://local/telemetry',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 5,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
      ...customConfig,
    };
    super(defaultConfig);
    this.mockProvider = new MockCityDataProvider();
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    const response = await this.mockProvider.getNormalizedSignals(cityId);
    return response.payload;
  }

  public validatePayload(rawPayload: any): boolean {
    return Array.isArray(rawPayload) && rawPayload.length > 0;
  }

  public normalize(rawPayload: any, cityId: string): CrossDomainSignalDto[] {
    return rawPayload as CrossDomainSignalDto[];
  }
}
