// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 TransitProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { TRANSIT_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class TransitProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = TRANSIT_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-gtfs-transit-01',
      providerName: 'Public Transit GTFS Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'TRANSIT',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'API_KEY',
      endpointUrl: 'https://api.transit.municipal.gov/gtfs/v2',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 16,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['delayed_buses', 'avg_delay_mins', 'blocked_routes']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.fleet_uuid && typeof raw.avg_delay_mins === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.observed_at || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-trn-${raw.fleet_uuid}`,
        domain: 'TRANSIT',
        entityId: raw.fleet_uuid,
        entityName: 'Sector 4 Bus Corridor Fleet',
        eventType: raw.avg_delay_mins > 30 ? 'FLEET_SYSTEMIC_DELAY' : 'FLEET_DELAY',
        severity: raw.avg_delay_mins > 30 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.51, lng: 80.655, zoneId: 'zone-benz-circle' },
        value: raw.avg_delay_mins,
        unit: 'mins',
        timestamp: ts,
        confidenceScore: 92,
      },
    ];
  }
}
