// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Production Data Gateway
// Provider Gateway Domain Models, Configuration DTOs & Health Types
// ──────────────────────────────────────────────────────────────

import { Phase8ProvenanceSource, DataQualityState } from './city-data-provider.domain';

export type ProviderDomain =
  | 'WEATHER'
  | 'ENVIRONMENTAL'
  | 'MOBILITY'
  | 'TRANSIT'
  | 'UTILITY'
  | 'EMERGENCY'
  | 'CITIZEN';

export type ProviderGatewayType = 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';

export type AuthenticationMode = 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'OAUTH2' | 'MTLS';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type ProviderHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface ProviderRetryPolicyDto {
  maxRetries: number;
  backoffFactorMs: number;
}

export interface ProviderRateLimitDto {
  maxRequestsPerMinute: number;
}

export interface ProviderHealthMetricsDto {
  status: ProviderHealthStatus;
  lastSuccessfulFetch: string | null;
  lastFailedFetch: string | null;
  latencyMs: number;
  failureCount: number;
  consecutiveFailures: number;
  freshnessSeconds: number;
  errorReason: string | null;
  circuitState: CircuitBreakerState;
}

export interface ProviderConfigDto {
  providerId: string;
  providerName: string;
  providerType: ProviderGatewayType;
  domain: ProviderDomain;
  enabled: boolean;
  timeoutMs: number;
  retryPolicy: ProviderRetryPolicyDto;
  rateLimit: ProviderRateLimitDto;
  freshnessThresholdSeconds: number;
  authenticationMode: AuthenticationMode;
  endpointUrl: string;
  health: ProviderHealthMetricsDto;
  fallbackProviderId: string;
  metadata?: Record<string, any>;
  // Sensitive secrets must never be exported in user-facing JSON!
  apiKeySecret?: string;
  bearerTokenSecret?: string;
}

export interface SanitizedProviderConfigDto extends Omit<ProviderConfigDto, 'apiKeySecret' | 'bearerTokenSecret'> {
  hasSecretConfigured: boolean;
}

export interface ProviderHealthSnapshotDto {
  totalProviders: number;
  healthyCount: number;
  degradedCount: number;
  unavailableCount: number;
  unknownCount: number;
  openCircuitBreakersCount: number;
  activeDomainCoverage: Record<ProviderDomain, number>;
  generatedAt: string;
}
