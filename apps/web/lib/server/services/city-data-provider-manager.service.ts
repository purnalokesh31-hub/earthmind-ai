// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture
// Master City Data Provider Manager Service
// ──────────────────────────────────────────────────────────────

import {
  CityDataProvider,
  CityDataProviderResponse,
  DataQualityState,
  DataFreshnessMetadataDto,
} from '../domain/digital-twin/city-data-provider.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { MockCityDataProvider } from '../providers/mock-city-data-provider';
import { DemoCityDataProvider } from '../providers/demo-city-data-provider';
import { ExternalCityDataProviderContract } from '../providers/external-city-data-provider.contract';
import { logger } from '../logger';

export class CityDataProviderManagerService {
  private activeProvider: CityDataProvider;
  private fallbackProvider: CityDataProvider;
  private maxAllowedAgeSeconds: number = 60;

  constructor(initialProvider?: CityDataProvider) {
    this.fallbackProvider = new MockCityDataProvider();
    this.activeProvider = initialProvider || this.fallbackProvider;
  }

  public setProvider(provider: CityDataProvider): void {
    logger.info(`[CityDataProviderManager] Switched active provider to '${provider.providerName}' (${provider.providerId}, Type: ${provider.providerType})`);
    this.activeProvider = provider;
  }

  public setProviderByType(type: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT'): void {
    switch (type) {
      case 'MOCK':
        this.setProvider(new MockCityDataProvider());
        break;
      case 'DEMO':
        this.setProvider(new DemoCityDataProvider());
        break;
      case 'EXTERNAL_CONTRACT':
        this.setProvider(new ExternalCityDataProviderContract());
        break;
      default:
        throw new Error(`UNKNOWN_PROVIDER_TYPE: Provider type '${type}' is invalid.`);
    }
  }

  public getActiveProvider(): CityDataProvider {
    return this.activeProvider;
  }

  public evaluateDataQuality(response: CityDataProviderResponse<any>): DataFreshnessMetadataDto {
    const now = Date.now();
    const payloadTime = new Date(response.metadata.timestamp).getTime();

    if (isNaN(payloadTime)) {
      logger.warn(`[CityDataProviderManager] Invalid timestamp '${response.metadata.timestamp}'. Setting dataQuality=INVALID.`);
      return {
        ...response.metadata,
        dataQuality: 'INVALID',
        freshnessSeconds: 999999,
      };
    }

    const ageSeconds = Math.max(0, Math.floor((now - payloadTime) / 1000));
    let quality: DataQualityState = response.metadata.dataQuality || 'FRESH';

    if (!response.payload || (Array.isArray(response.payload) && response.payload.length === 0)) {
      quality = 'UNKNOWN';
    } else if (ageSeconds > this.maxAllowedAgeSeconds) {
      quality = 'STALE';
    }

    return {
      ...response.metadata,
      freshnessSeconds: ageSeconds,
      dataQuality: quality,
    };
  }

  public validateSignalPayload(signals: CrossDomainSignalDto[]): boolean {
    if (!Array.isArray(signals)) return false;
    for (const sig of signals) {
      if (!sig.signalId || !sig.domain || !sig.eventType || typeof sig.value !== 'number') {
        return false;
      }
      if (isNaN(sig.value)) return false;
    }
    return true;
  }

  public async getCitywideSignals(cityId: string = 'city-vja'): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>> {
    try {
      logger.info(`[CityDataProviderManager] Fetching normalized signals from '${this.activeProvider.providerName}' for city '${cityId}'`);
      const response = await this.activeProvider.getNormalizedSignals(cityId);

      // Validate Payload Integrity
      const isValid = this.validateSignalPayload(response.payload);
      if (!isValid) {
        logger.warn(`[CityDataProviderManager] Invalid signal payload received from '${this.activeProvider.providerId}'. Falling back to MockProvider.`);
        return this.getFallbackSignals(cityId, 'INVALID');
      }

      // Evaluate Freshness & Quality
      const evaluatedMetadata = this.evaluateDataQuality(response);
      return {
        ...response,
        metadata: evaluatedMetadata,
      };
    } catch (error) {
      logger.error(`[CityDataProviderManager] Active provider '${this.activeProvider.providerId}' failed: ${String(error)}. Activating fallback resilience provider.`);
      return this.getFallbackSignals(cityId, 'STALE');
    }
  }

  private async getFallbackSignals(cityId: string, overrideQuality?: DataQualityState): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>> {
    const fallbackResponse = await this.fallbackProvider.getNormalizedSignals(cityId);
    return {
      ...fallbackResponse,
      metadata: {
        ...fallbackResponse.metadata,
        dataQuality: overrideQuality || 'STALE',
        source: 'SIMULATION',
        metadata: {
          ...fallbackResponse.metadata.metadata,
          fallbackTriggered: true,
          originalProviderId: this.activeProvider.providerId,
        },
      },
    };
  }
}

export const cityDataProviderManagerService = new CityDataProviderManagerService();
