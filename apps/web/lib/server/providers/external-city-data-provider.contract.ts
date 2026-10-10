// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture
// External Provider Interface Contract (Future Integration Placeholder)
// ──────────────────────────────────────────────────────────────

import {
  CityDataProvider,
  CityDataProviderResponse,
  EnvironmentalTelemetryDto,
  WeatherFeedDto,
  MobilityFeedDto,
  TransitFeedDto,
  UtilityTelemetryDto,
  EmergencyFeedDto,
  CitizenIntelligenceDto,
  Phase8ProvenanceSource,
} from '../domain/digital-twin/city-data-provider.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';

export class ExternalCityDataProviderContract implements CityDataProvider {
  public readonly providerId = 'provider-external-contract';
  public readonly providerName = 'External Municipal API Provider Contract';
  public readonly providerType = 'EXTERNAL_CONTRACT';
  public readonly provenance: Phase8ProvenanceSource = 'LIVE';

  constructor(private isDryRunContractMode: boolean = true) {}

  private throwNotImplementedError(feature: string): never {
    throw new Error(
      `PHASE_8_EXTERNAL_CONTRACT_NOT_CONNECTED: Feature '${feature}' represents a Phase 8 external municipal provider contract interface. No real external credentials or municipal live endpoints are connected in Phase 8 Foundation.`
    );
  }

  public async getEnvironmentalTelemetry(cityId: string): Promise<CityDataProviderResponse<EnvironmentalTelemetryDto[]>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getEnvironmentalTelemetry');
    }
    throw new Error('Unreachable code');
  }

  public async getWeatherFeed(cityId: string): Promise<CityDataProviderResponse<WeatherFeedDto>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getWeatherFeed');
    }
    throw new Error('Unreachable code');
  }

  public async getMobilityFeed(cityId: string): Promise<CityDataProviderResponse<MobilityFeedDto[]>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getMobilityFeed');
    }
    throw new Error('Unreachable code');
  }

  public async getTransitFeed(cityId: string): Promise<CityDataProviderResponse<TransitFeedDto>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getTransitFeed');
    }
    throw new Error('Unreachable code');
  }

  public async getUtilityTelemetry(cityId: string): Promise<CityDataProviderResponse<UtilityTelemetryDto[]>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getUtilityTelemetry');
    }
    throw new Error('Unreachable code');
  }

  public async getEmergencyFeed(cityId: string): Promise<CityDataProviderResponse<EmergencyFeedDto>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getEmergencyFeed');
    }
    throw new Error('Unreachable code');
  }

  public async getCitizenIntelligenceFeed(cityId: string): Promise<CityDataProviderResponse<CitizenIntelligenceDto[]>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getCitizenIntelligenceFeed');
    }
    throw new Error('Unreachable code');
  }

  public async getNormalizedSignals(cityId: string): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>> {
    if (this.isDryRunContractMode) {
      this.throwNotImplementedError('getNormalizedSignals');
    }
    throw new Error('Unreachable code');
  }
}
