// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Demo Provider Adapter Implementation
// ──────────────────────────────────────────────────────────────

import { BaseProviderAdapter } from './base-provider-adapter';
import { ProviderConfigDto } from '../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { DemoCityDataProvider } from '../providers/demo-city-data-provider';

export class DemoProviderAdapter extends BaseProviderAdapter {
  private demoProvider: DemoCityDataProvider;

  constructor(customConfig?: Partial<ProviderConfigDto>) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'provider-demo-gateway',
      providerName: 'City Flood Cascade Demo Gateway Adapter',
      providerType: 'DEMO',
      domain: 'WEATHER',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'NONE',
      endpointUrl: 'demo://expo/crisis-cascade',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 12,
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
    this.demoProvider = new DemoCityDataProvider();
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    const response = await this.demoProvider.getNormalizedSignals(cityId);
    return response.payload;
  }

  public validatePayload(rawPayload: any): boolean {
    return Array.isArray(rawPayload) && rawPayload.length > 0;
  }

  public normalize(rawPayload: any, cityId: string): CrossDomainSignalDto[] {
    return rawPayload as CrossDomainSignalDto[];
  }
}
