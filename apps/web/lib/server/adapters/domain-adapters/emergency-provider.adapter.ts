// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 EmergencyProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { EMERGENCY_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class EmergencyProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = EMERGENCY_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-cad-emergency-01',
      providerName: 'Emergency Dispatch CAD Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'EMERGENCY',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'MTLS',
      endpointUrl: 'https://api.cad.emergency.gov/dispatch/v1',
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
    };
    super(defaultConfig, ['hosp_delay_minutes', 'active_dispatches', 'ambulances_available']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.dispatch_zone_code && typeof raw.hosp_delay_minutes === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.timestamp || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-emg-${raw.dispatch_zone_code}`,
        domain: 'EMERGENCY_RESPONSE',
        entityId: raw.dispatch_zone_code,
        entityName: 'General Hospital Emergency Route',
        eventType: raw.hosp_delay_minutes > 20 ? 'CRITICAL_HOSPITAL_ACCESS_DELAY' : 'HOSPITAL_ACCESS_DELAY',
        severity: raw.hosp_delay_minutes > 20 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.502, lng: 80.64, zoneId: 'zone-benz-circle' },
        value: raw.hosp_delay_minutes,
        unit: 'mins',
        timestamp: ts,
        confidenceScore: 98,
      },
    ];
  }
}
