// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Base Provider Adapter Implementation
// Implements Timeout, Bounded Retry, Circuit Breaker State Machine, and Isolation
// ──────────────────────────────────────────────────────────────

import { ProviderAdapter } from './provider-adapter.interface';
import {
  ProviderConfigDto,
  ProviderHealthMetricsDto,
  CircuitBreakerState,
  ProviderHealthStatus,
} from '../domain/digital-twin/provider-gateway.domain';
import { DataFreshnessMetadataDto, Phase8ProvenanceSource } from '../domain/digital-twin/city-data-provider.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { logger } from '../logger';

export abstract class BaseProviderAdapter implements ProviderAdapter {
  public config: ProviderConfigDto;
  protected isConnected: boolean = false;
  protected lastSuccessfulFetchTime: number | null = null;
  protected lastFailedFetchTime: number | null = null;
  protected consecutiveFailuresCount: number = 0;
  protected totalFailuresCount: number = 0;
  protected circuitState: CircuitBreakerState = 'CLOSED';
  protected circuitOpenTimestamp: number | null = null;
  protected circuitResetTimeoutMs: number = 5000; // 5 seconds recovery timeout to HALF_OPEN

  constructor(config: ProviderConfigDto) {
    this.config = JSON.parse(JSON.stringify(config));
  }

  public async connect(): Promise<void> {
    this.isConnected = true;
    logger.info(`[ProviderAdapter:${this.config.providerId}] Connected adapter '${this.config.providerName}'`);
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    logger.info(`[ProviderAdapter:${this.config.providerId}] Disconnected adapter '${this.config.providerName}'`);
  }

  public async healthCheck(): Promise<ProviderHealthMetricsDto> {
    this.evaluateCircuitState();
    const now = Date.now();
    const freshnessSeconds = this.lastSuccessfulFetchTime
      ? Math.max(0, Math.floor((now - this.lastSuccessfulFetchTime) / 1000))
      : 999999;

    let status: ProviderHealthStatus = 'HEALTHY';
    if (this.circuitState === 'OPEN') {
      status = 'UNAVAILABLE';
    } else if (this.consecutiveFailuresCount > 0 || freshnessSeconds > this.config.freshnessThresholdSeconds) {
      status = 'DEGRADED';
    } else if (!this.lastSuccessfulFetchTime) {
      status = 'UNKNOWN';
    }

    this.config.health = {
      status,
      lastSuccessfulFetch: this.lastSuccessfulFetchTime ? new Date(this.lastSuccessfulFetchTime).toISOString() : null,
      lastFailedFetch: this.lastFailedFetchTime ? new Date(this.lastFailedFetchTime).toISOString() : null,
      latencyMs: this.config.health.latencyMs || 0,
      failureCount: this.totalFailuresCount,
      consecutiveFailures: this.consecutiveFailuresCount,
      freshnessSeconds,
      errorReason: this.config.health.errorReason,
      circuitState: this.circuitState,
    };

    return this.config.health;
  }

  protected evaluateCircuitState(): void {
    if (this.circuitState === 'OPEN' && this.circuitOpenTimestamp) {
      const timeInOpen = Date.now() - this.circuitOpenTimestamp;
      if (timeInOpen >= this.circuitResetTimeoutMs) {
        this.circuitState = 'HALF_OPEN';
        logger.warn(`[CircuitBreaker:${this.config.providerId}] Transitioned from OPEN to HALF_OPEN (Trial recovery mode)`);
      }
    }
  }

  protected recordSuccess(latencyMs: number): void {
    this.lastSuccessfulFetchTime = Date.now();
    this.consecutiveFailuresCount = 0;
    this.circuitState = 'CLOSED';
    this.circuitOpenTimestamp = null;
    this.config.health.latencyMs = latencyMs;
    this.config.health.errorReason = null;
  }

  protected recordFailure(errorMsg: string): void {
    this.lastFailedFetchTime = Date.now();
    this.consecutiveFailuresCount++;
    this.totalFailuresCount++;
    this.config.health.errorReason = errorMsg;

    // Circuit Breaker Trigger: 3 consecutive failures trips breaker to OPEN
    if (this.consecutiveFailuresCount >= 3 && this.circuitState !== 'OPEN') {
      this.circuitState = 'OPEN';
      this.circuitOpenTimestamp = Date.now();
      logger.error(`[CircuitBreaker:${this.config.providerId}] TRIP! Circuit Breaker OPEN after ${this.consecutiveFailuresCount} consecutive failures. Error: ${errorMsg}`);
    }
  }

  public async fetchSignals(cityId: string): Promise<any> {
    if (!this.config.enabled) {
      throw new Error(`PROVIDER_DISABLED: Provider '${this.config.providerId}' is disabled.`);
    }

    this.evaluateCircuitState();

    if (this.circuitState === 'OPEN') {
      throw new Error(`CIRCUIT_OPEN: Provider '${this.config.providerId}' circuit breaker is OPEN due to repeated failures.`);
    }

    const startTime = Date.now();
    let attempt = 0;
    const maxRetries = this.config.retryPolicy.maxRetries || 2;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        const rawPayload = await this.executeWithTimeout(cityId);
        const latencyMs = Date.now() - startTime;

        if (!this.validatePayload(rawPayload)) {
          throw new Error(`INVALID_PAYLOAD: Raw payload validation failed for provider '${this.config.providerId}'.`);
        }

        this.recordSuccess(latencyMs);
        return rawPayload;
      } catch (err: any) {
        attempt++;
        lastError = err;

        if (attempt <= maxRetries) {
          const backoff = (this.config.retryPolicy.backoffFactorMs || 100) * Math.pow(2, attempt - 1);
          logger.warn(`[ProviderAdapter:${this.config.providerId}] Attempt ${attempt} failed: ${err.message}. Retrying in ${backoff}ms...`);
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    const finalErrMsg = lastError ? lastError.message : 'Unknown execution failure';
    this.recordFailure(finalErrMsg);
    throw new Error(`PROVIDER_FETCH_FAILED: Execution failed after ${attempt} attempts (${finalErrMsg})`);
  }

  private async executeWithTimeout(cityId: string): Promise<any> {
    const timeoutMs = this.config.timeoutMs || 3000;
    return Promise.race([
      this.fetchRawData(cityId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`TIMEOUT_EXCEEDED: Data fetch timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  protected abstract fetchRawData(cityId: string): Promise<any>;

  public abstract validatePayload(rawPayload: any): boolean;

  public abstract normalize(rawPayload: any, cityId: string): CrossDomainSignalDto[];

  public getMetadata(): DataFreshnessMetadataDto {
    const ts = this.lastSuccessfulFetchTime ? new Date(this.lastSuccessfulFetchTime).toISOString() : new Date().toISOString();
    const ageSeconds = this.lastSuccessfulFetchTime ? Math.max(0, Math.floor((Date.now() - this.lastSuccessfulFetchTime) / 1000)) : 999999;

    let provenance: Phase8ProvenanceSource = 'SIMULATION';
    if (this.config.providerType === 'MOCK') provenance = 'LIVE';
    if (this.config.providerType === 'DEMO') provenance = 'DEMO';

    return {
      timestamp: ts,
      source: provenance,
      confidence: this.config.health.status === 'HEALTHY' ? 95 : 70,
      freshnessSeconds: ageSeconds,
      dataQuality: ageSeconds > this.config.freshnessThresholdSeconds ? 'STALE' : 'FRESH',
      metadata: {
        providerId: this.config.providerId,
        providerType: this.config.providerType,
        circuitState: this.circuitState,
      },
    };
  }
}
