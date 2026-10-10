// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 CitizenIntelligenceProviderAdapter Implementation
// ──────────────────────────────────────────────────────────────

import { ExternalProviderAdapter } from '../external-provider.adapter';
import { ProviderConfigDto } from '../../domain/digital-twin/provider-gateway.domain';
import { CrossDomainSignalDto } from '../../domain/digital-twin/cross-domain.domain';
import { CITIZEN_RAW_FIXTURE } from '../../fixtures/connector-fixtures';

export class CitizenIntelligenceProviderAdapter extends ExternalProviderAdapter {
  constructor(customConfig?: Partial<ProviderConfigDto>, private mockRawPayload: any = CITIZEN_RAW_FIXTURE) {
    const defaultConfig: ProviderConfigDto = {
      providerId: 'connector-civic-citizen-01',
      providerName: 'Crowdsourced Citizen Intelligence Connector',
      providerType: 'EXTERNAL_CONTRACT',
      domain: 'CITIZEN',
      enabled: true,
      timeoutMs: 3000,
      retryPolicy: { maxRetries: 2, backoffFactorMs: 50 },
      rateLimit: { maxRequestsPerMinute: 600 },
      freshnessThresholdSeconds: 60,
      authenticationMode: 'API_KEY',
      endpointUrl: 'https://api.citizen.municipal.gov/reports/v1',
      health: {
        status: 'HEALTHY',
        lastSuccessfulFetch: null,
        lastFailedFetch: null,
        latencyMs: 15,
        failureCount: 0,
        consecutiveFailures: 0,
        freshnessSeconds: 0,
        errorReason: null,
        circuitState: 'CLOSED',
      },
      fallbackProviderId: 'provider-mock-gateway',
    };
    super(defaultConfig, ['community_votes', 'urgency_tier', 'category_name']);
  }

  protected async fetchRawData(cityId: string): Promise<any> {
    if (!this.mockRawPayload) throw new Error('RAW_FETCH_FAILED: Empty raw payload');
    return this.mockRawPayload;
  }

  public validatePayload(raw: any): boolean {
    return Boolean(raw && raw.ticket_id && typeof raw.community_votes === 'number');
  }

  public normalize(raw: any, cityId: string): CrossDomainSignalDto[] {
    const ts = raw.filed_at || new Date().toISOString();
    return [
      {
        signalId: `sig-ext-cit-${raw.ticket_id}`,
        domain: 'CITIZEN_INTELLIGENCE',
        entityId: raw.ticket_id,
        entityName: 'Citizen Urban Flash Flood Report',
        eventType: raw.category_name,
        severity: raw.priority_tier === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        location: raw.geo || { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: raw.community_votes,
        unit: 'upvotes',
        timestamp: ts,
        confidenceScore: 90,
      },
    ];
  }
}
