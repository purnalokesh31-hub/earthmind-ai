// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Provider Health Service
// ──────────────────────────────────────────────────────────────

import { ProviderAdapter } from '../adapters/provider-adapter.interface';
import {
  ProviderHealthMetricsDto,
  ProviderHealthSnapshotDto,
  ProviderDomain,
} from '../domain/digital-twin/provider-gateway.domain';
import { logger } from '../logger';

export class ProviderHealthService {
  public async evaluateHealth(adapter: ProviderAdapter): Promise<ProviderHealthMetricsDto> {
    const health = await adapter.healthCheck();
    logger.info(`[ProviderHealthService] Evaluated health for '${adapter.config.providerId}': status=${health.status}, circuit=${health.circuitState}`);
    return health;
  }

  public generateSnapshot(adapters: ProviderAdapter[]): ProviderHealthSnapshotDto {
    const now = new Date().toISOString();
    let healthyCount = 0;
    let degradedCount = 0;
    let unavailableCount = 0;
    let unknownCount = 0;
    let openCircuitBreakersCount = 0;

    const domainCoverage: Record<ProviderDomain, number> = {
      WEATHER: 0,
      ENVIRONMENTAL: 0,
      MOBILITY: 0,
      TRANSIT: 0,
      UTILITY: 0,
      EMERGENCY: 0,
      CITIZEN: 0,
    };

    for (const adapter of adapters) {
      const h = adapter.config.health;
      if (h.status === 'HEALTHY') healthyCount++;
      if (h.status === 'DEGRADED') degradedCount++;
      if (h.status === 'UNAVAILABLE') unavailableCount++;
      if (h.status === 'UNKNOWN') unknownCount++;

      if (h.circuitState === 'OPEN') openCircuitBreakersCount++;

      if (adapter.config.enabled) {
        domainCoverage[adapter.config.domain] = (domainCoverage[adapter.config.domain] || 0) + 1;
      }
    }

    return {
      totalProviders: adapters.length,
      healthyCount,
      degradedCount,
      unavailableCount,
      unknownCount,
      openCircuitBreakersCount,
      activeDomainCoverage: domainCoverage,
      generatedAt: now,
    };
  }
}

export const providerHealthService = new ProviderHealthService();
