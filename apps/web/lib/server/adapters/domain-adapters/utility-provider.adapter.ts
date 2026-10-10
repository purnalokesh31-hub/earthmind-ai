// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 UtilityProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { UTILITY_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class UtilityProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = UTILITY_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-scada-utility-01',
      providerName: 'Electrical & Water Utility SCADA Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'UTILITY',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'OAUTH2',
      endpointUrl: 'https://api.utility.municipal.gov/scada/v1',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 22,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['grid_load_pct', 'thermal_surge_celsius', 'outage_risk']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.substation_tag && typeof raw.temp_surge_celsius === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.sample_time || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-utl-${raw.substation_tag}`,
        domain: 'UTILITY',
        entityId: raw.substation_tag,
        entityName: 'Substation 4B Electrical Grid',
        eventType: raw.temp_surge_celsius > 75 ? 'SUBSTATION_THERMAL_SURGE' : 'GRID_HIGH_LOAD',
        severity: raw.temp_surge_celsius > 75 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.504, lng: 80.642, zoneId: 'zone-benz-circle' },
        value: raw.temp_surge_celsius,
        unit: '°C',
        timestamp: ts,
        confidenceScore: 96,
      },
    ];
  }
}
