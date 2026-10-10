// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 EnvironmentalProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { ENVIRONMENTAL_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class EnvironmentalProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = ENVIRONMENTAL_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-env-sensors-01',
      providerName: 'City Environmental Sensor Mesh Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'ENVIRONMENTAL',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'API_KEY',
      endpointUrl: 'https://api.env.municipal.gov/sensors/v1',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 10,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['aqi_index', 'noise_db', 'co2_ppm']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.sensor_uuid && typeof raw.aqi_index === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.reading_time || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-env-${raw.sensor_uuid}`,
        domain: 'CLIMATE',
        entityId: raw.sensor_uuid,
        entityName: 'Benz Circle Sensor Mesh',
        eventType: 'AIR_QUALITY_MONITOR',
        severity: raw.aqi_index > 100 ? 'HIGH' : 'MEDIUM',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: raw.aqi_index,
        unit: 'AQI',
        timestamp: ts,
        confidenceScore: 94,
      },
    ];
  }
}
