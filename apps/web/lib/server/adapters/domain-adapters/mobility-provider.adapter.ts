// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 MobilityProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { MOBILITY_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class MobilityProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = MOBILITY_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-traffic-mobility-01',
      providerName: 'Intelligent Traffic & Mobility Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'MOBILITY',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'BEARER_TOKEN',
      endpointUrl: 'https://api.traffic.municipal.gov/flow/v1',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 18,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['traffic_density_pct', 'avg_speed_kph', 'water_depth_cm']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.corridor_code && typeof raw.traffic_density_pct === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.time_iso || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-mob-${raw.corridor_code}`,
        domain: 'MOBILITY',
        entityId: raw.corridor_code,
        entityName: 'NH-9 Main Arterial Corridor',
        eventType: raw.traffic_density_pct > 90 ? 'SEVERE_GRIDLOCK' : 'TRAFFIC_CONGESTION',
        severity: raw.traffic_density_pct > 90 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.508, lng: 80.651, zoneId: 'zone-benz-circle' },
        value: raw.traffic_density_pct,
        unit: '%',
        timestamp: ts,
        confidenceScore: 95,
      },
    ];
  }
}
