// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 WeatherProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { WEATHER_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class WeatherProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = WEATHER_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-doppler-weather-01',
      providerName: 'Doppler Radar Weather Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'WEATHER',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'API_KEY',
      endpointUrl: 'https://api.weather.municipal.gov/doppler/v1',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 14,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['rainfall_mm_hr', 'wind_speed_kmh', 'barometer_hpa']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.station_id && raw.precipitation && typeof raw.precipitation.rate_mm_hr === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.timestamp_utc || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-wth-${raw.station_id}`,
        domain: 'CLIMATE',
        entityId: raw.station_id,
        entityName: 'Municipal Doppler Weather Station',
        eventType: raw.precipitation.rate_mm_hr > 100 ? 'EXTREME_HEAVY_RAINFALL' : 'RAINFALL',
        severity: raw.precipitation.rate_mm_hr > 100 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: raw.precipitation.rate_mm_hr,
        unit: 'mm/hr',
        timestamp: ts,
        confidenceScore: 98,
      },
    ];
  }
}
