// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.2 ExternalProviderAdapter Abstract Base Class
// Implements Secret Isolation, Rate Limiting, Correlation IDs, and Structured Error Handling
// ──────────────────────────────────────────────────────────────

import { BaseProviderAdapter } from './base-provider-adapter';
import { ProviderConfigDto, ProviderDomain } from '../domain/digital-twin/provider-gateway.domain';
import {
  ExternalProviderError,
  ExternalConnectorErrorCode,
  ProviderCapabilitiesDto,
  ExternalConnectorRequestLogDto,
} from '../domain/digital-twin/connector-framework.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { logger } from '../logger';

export abstract class ExternalProviderAdapter extends BaseProviderAdapter {
  protected requestTimestamps: number[] = [];
  protected recentRequestLogs: ExternalConnectorRequestLogDto[] = [];
  protected supportedMetricsList: string[] = [];

  constructor(config: ProviderConfigDto, supportedMetrics: string[] = []) {
    // Secret Isolation: Resolve server-side secrets from process.env if available, without storing in plaintext DTO
    const envSecretKey = `EARTHMIND_${config.providerId.toUpperCase().replace(/-/g, '_')}_API_KEY`;
    const resolvedSecret = process.env[envSecretKey] || config.apiKeySecret || 'REDACTED_SECRET';

    super({
      ...config,
      apiKeySecret: resolvedSecret ? 'SECURED_SERVER_SECRET' : undefined,
    });
    this.supportedMetricsList = supportedMetrics;
  }

  protected generateCorrelationId(): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 7);
    return `corr-ext-${ts}-${rand}`;
  }

  protected checkRateLimit(): void {
    const now = Date.now();
    const windowMs = 60 * 1000;
    this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < windowMs);

    const maxPerMin = this.config.rateLimit.maxRequestsPerMinute || 300;
    if (this.requestTimestamps.length >= maxPerMin) {
      throw new ExternalProviderError(
        'PROVIDER_RATE_LIMITED',
        `Rate limit exceeded for provider '${this.config.providerId}' (${maxPerMin} req/min).`,
        this.config.providerId,
        this.generateCorrelationId(),
        429
      );
    }
    this.requestTimestamps.push(now);
  }

  public getCapabilities(): ProviderCapabilitiesDto {
    return {
      providerId: this.config.providerId,
      providerName: this.config.providerName,
      supportedDomains: [this.config.domain],
      supportedMetrics: this.supportedMetricsList,
      updateFrequencySeconds: this.config.freshnessThresholdSeconds / 2,
      freshnessThresholdSeconds: this.config.freshnessThresholdSeconds,
      availabilityPercent: this.consecutiveFailuresCount === 0 ? 99.9 : 75.0,
      health: this.config.health.status,
      provenance: this.config.providerType === 'MOCK' ? 'LIVE' : this.config.providerType === 'DEMO' ? 'DEMO' : 'SIMULATION',
    };
  }

  public async fetchSignals(cityId: string): Promise<any> {
    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();

    try {
      this.checkRateLimit();
      const rawData = await super.fetchSignals(cityId);
      const durationMs = Date.now() - startTime;

      this.logRequest({
        correlationId,
        providerId: this.config.providerId,
        domain: this.config.domain,
        timestamp: new Date().toISOString(),
        durationMs,
        success: true,
        errorType: null,
        errorMessage: null,
      });

      return rawData;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      let errorCode: ExternalConnectorErrorCode = 'PROVIDER_UNKNOWN_ERROR';

      if (err instanceof ExternalProviderError) {
        errorCode = err.code;
      } else if (err.message?.includes('TIMEOUT')) {
        errorCode = 'PROVIDER_TIMEOUT';
      } else if (err.message?.includes('CIRCUIT_OPEN') || err.message?.includes('NOT_CONNECTED')) {
        errorCode = 'PROVIDER_UNAVAILABLE';
      } else if (err.message?.includes('INVALID_PAYLOAD') || err.message?.includes('SCHEMA')) {
        errorCode = 'PROVIDER_INVALID_RESPONSE';
      } else if (err.message?.includes('AUTH')) {
        errorCode = 'PROVIDER_AUTH_FAILURE';
      }

      this.logRequest({
        correlationId,
        providerId: this.config.providerId,
        domain: this.config.domain,
        timestamp: new Date().toISOString(),
        durationMs,
        success: false,
        errorType: errorCode,
        errorMessage: err.message,
      });

      throw new ExternalProviderError(errorCode, err.message, this.config.providerId, correlationId);
    }
  }

  protected logRequest(log: ExternalConnectorRequestLogDto): void {
    this.recentRequestLogs.unshift(log);
    if (this.recentRequestLogs.length > 50) this.recentRequestLogs.pop();
  }

  public getRequestLogs(): ExternalConnectorRequestLogDto[] {
    return [...this.recentRequestLogs];
  }
}
