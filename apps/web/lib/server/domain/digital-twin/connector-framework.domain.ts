// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 Real-World External Data Connector Framework
// Domain Models, Capability Discovery DTOs, and Structured Errors
// ──────────────────────────────────────────────────────────────

import { ProviderDomain, ProviderHealthStatus } from './provider-gateway.domain';
import { Phase8ProvenanceSource } from './city-data-provider.domain';

export type ExternalConnectorErrorCode =
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_AUTH_FAILURE'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_INVALID_RESPONSE'
  | 'PROVIDER_SCHEMA_MISMATCH'
  | 'PROVIDER_STALE_DATA'
  | 'PROVIDER_UNKNOWN_ERROR';

export class ExternalProviderError extends Error {
  constructor(
    public readonly code: ExternalConnectorErrorCode,
    message: string,
    public readonly providerId: string,
    public readonly correlationId?: string,
    public readonly statusCode: number = 500
  ) {
    super(`[${code}:${providerId}] ${message}`);
    this.name = 'ExternalProviderError';
  }
}

export interface ProviderCapabilitiesDto {
  providerId: string;
  providerName: string;
  supportedDomains: ProviderDomain[];
  supportedMetrics: string[];
  updateFrequencySeconds: number;
  freshnessThresholdSeconds: number;
  availabilityPercent: number;
  health: ProviderHealthStatus;
  provenance: Phase8ProvenanceSource;
}

export interface ExternalConnectorRequestLogDto {
  correlationId: string;
  providerId: string;
  domain: ProviderDomain;
  timestamp: string;
  durationMs: number;
  success: boolean;
  errorType: ExternalConnectorErrorCode | null;
  errorMessage: string | null;
}
