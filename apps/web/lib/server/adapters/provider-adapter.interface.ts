// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 ProviderAdapter Interface
// ──────────────────────────────────────────────────────────────

import { ProviderConfigDto, ProviderHealthMetricsDto } from '../domain/digital-twin/provider-gateway.domain';
import { DataFreshnessMetadataDto } from '../domain/digital-twin/city-data-provider.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';

export interface ProviderAdapter {
  readonly config: ProviderConfigDto;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<ProviderHealthMetricsDto>;
  fetchSignals(cityId: string): Promise<any>;
  validatePayload(rawPayload: any): boolean;
  normalize(rawPayload: any, cityId: string): CrossDomainSignalDto[];
  getMetadata(): DataFreshnessMetadataDto;
}
