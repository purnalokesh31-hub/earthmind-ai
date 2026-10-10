// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 External Provider Adapter Contract Implementation
// ──────────────────────────────────────────────────────────────

import { BaseProviderAdapter } from './base-provider-adapter';
import { ProviderConfigDto } from '../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';

export class ExternalProviderAdapterContract extends BaseProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'provider-external-contract-gateway',
      providerName: 'External Municipal API Provider Contract Adapter',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'UTILITY',
      enabled: true,
      timeoutMs: 1500,
      retryPolicy: { maxRetries: 1, backoffFactorMs: 20 },
      rateLimit: { maxRequestsPerMinute: 300 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'API_KEY',
      endpointUrl: 'https://api.municipal.gov/v1/telemetry',
      health: {
        status: 'UNKNOWN',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 999999,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
      apiKeySecret: 'SEC-REDACTED-KEY-999',
      ...customConfig,
    };
    super(defaultConfig);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    throw new Error(
      `EXTERNAL_CONTRACT_NOT_CONNECTED: External municipal endpoint '${this.config.endpointUrl}' is a Phase 8 contract interface. Real external municipal credentials are not connected.`
    );
  }

  public validatePayload(rawPayload: any): boolean {
    return false;
  }

  public normalize(rawPayload: any, cityId: string): CrossDomainSignalDto[] {
    return [];
  }
}
