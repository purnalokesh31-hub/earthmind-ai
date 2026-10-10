// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.1 Master Provider Registry Service
// ──────────────────────────────────────────────────────────────

import { ProviderAdapter } from '../adapters/provider-adapter.interface';
import { MockProviderAdapter } from '../adapters/mock-provider-adapter';
import { DemoProviderAdapter } from '../adapters/demo-provider-adapter';
import { ExternalProviderAdapterContract } from '../adapters/external-provider-adapter.contract';
import {
  ProviderConfigDto,
  SanitizedProviderConfigDto,
  ProviderDomain,
  ProviderHealthSnapshotDto,
} from '../domain/digital-twin/provider-gateway.domain';
import { providerHealthService, ProviderHealthService } from './provider-health.service';
import { logger } from '../logger';

export class ProviderRegistryService {
  private registry: Map<string, ProviderAdapter> = new Map();
  private fallbackAdapter: ProviderAdapter;

  constructor(private healthService: ProviderHealthService = providerHealthService) {
    this.fallbackAdapter = new MockProviderAdapter({
      providerId: 'provider-fallback-default',
      providerName: 'Default System Fallback Mock Provider',
    });
    this.seedDefaultProviders();
  }

  private seedDefaultProviders(): void {
    const mock = new MockProviderAdapter();
    const demo = new DemoProviderAdapter();
    const external = new ExternalProviderAdapterContract();

    this.registerProviderAdapter(mock);
    this.registerProviderAdapter(demo);
    this.registerProviderAdapter(external);
  }

  public registerProviderAdapter(adapter: ProviderAdapter): void {
    const id = adapter.config.providerId;
    if (this.registry.has(id)) {
      throw new Error(`DUPLICATE_PROVIDER_REGISTRATION: Provider '${id}' is already registered in registry.`);
    }
    this.registry.set(id, adapter);
    logger.info(`[ProviderRegistry] Registered provider adapter '${adapter.config.providerName}' (${id})`);
  }

  public unregisterProvider(providerId: string): boolean {
    if (!this.registry.has(providerId)) {
      return false;
    }
    this.registry.delete(providerId);
    logger.info(`[ProviderRegistry] Unregistered provider '${providerId}'`);
    return true;
  }

  public getProviderAdapter(providerId: string): ProviderAdapter | undefined {
    return this.registry.get(providerId);
  }

  public listProviderAdapters(): ProviderAdapter[] {
    return Array.from(this.registry.values());
  }

  public enableProvider(providerId: string, enabled: boolean): ProviderConfigDto {
    const adapter = this.registry.get(providerId);
    if (!adapter) {
      throw new Error(`PROVIDER_NOT_FOUND: Provider '${providerId}' not found.`);
    }
    adapter.config.enabled = enabled;
    logger.info(`[ProviderRegistry] ${enabled ? 'Enabled' : 'Disabled'} provider '${providerId}'`);
    return adapter.config;
  }

  public sanitizeConfig(config: ProviderConfigDto): SanitizedProviderConfigDto {
    const { apiKeySecret, bearerTokenSecret, ...rest } = config;
    return {
      ...rest,
      hasSecretConfigured: Boolean(apiKeySecret || bearerTokenSecret),
    };
  }

  public listSanitizedConfigs(): SanitizedProviderConfigDto[] {
    return this.listProviderAdapters().map((adapter) => this.sanitizeConfig(adapter.config));
  }

  public getSanitizedConfig(providerId: string): SanitizedProviderConfigDto | undefined {
    const adapter = this.getProviderAdapter(providerId);
    return adapter ? this.sanitizeConfig(adapter.config) : undefined;
  }

  public async getProviderHealth(providerId: string) {
    const adapter = this.getProviderAdapter(providerId);
    if (!adapter) {
      throw new Error(`PROVIDER_NOT_FOUND: Provider '${providerId}' not found.`);
    }
    return this.healthService.evaluateHealth(adapter);
  }

  public getOverallHealthSnapshot(): ProviderHealthSnapshotDto {
    return this.healthService.generateSnapshot(this.listProviderAdapters());
  }

  public listDomains(): { domain: ProviderDomain; providerCount: number; activeProviders: string[] }[] {
    const domains: ProviderDomain[] = ['WEATHER', 'ENVIRONMENTAL', 'MOBILITY', 'TRANSIT', 'UTILITY', 'EMERGENCY', 'CITIZEN'];
    return domains.map((domain) => {
      const active = this.listProviderAdapters().filter((a) => a.config.domain === domain && a.config.enabled);
      return {
        domain,
        providerCount: active.length,
        activeProviders: active.map((a) => a.config.providerId),
      };
    });
  }

  public async fetchSignalsIsolated(providerId: string, cityId: string = 'city-vja'): Promise<{ signals: any[]; metadata: any; fallbackTriggered: boolean }> {
    const adapter = this.registry.get(providerId) || this.fallbackAdapter;

    try {
      const rawPayload = await adapter.fetchSignals(cityId);
      const signals = adapter.normalize(rawPayload, cityId);
      const metadata = adapter.getMetadata();

      return {
        signals,
        metadata,
        fallbackTriggered: false,
      };
    } catch (err: any) {
      logger.warn(`[ProviderRegistry ISOLATION] Fetch failed for provider '${providerId}': ${err.message}. Activating resilient fallback.`);
      const rawFallback = await this.fallbackAdapter.fetchSignals(cityId);
      const fallbackSignals = this.fallbackAdapter.normalize(rawFallback, cityId);
      const fallbackMeta = this.fallbackAdapter.getMetadata();

      return {
        signals: fallbackSignals,
        metadata: {
          ...fallbackMeta,
          source: 'SIMULATION',
          dataQuality: 'STALE',
          metadata: {
            fallbackTriggered: true,
            originalProviderId: providerId,
            errorReason: err.message,
          },
        },
        fallbackTriggered: true,
      };
    }
  }
}

export const providerRegistryService = new ProviderRegistryService();
