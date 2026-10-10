// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture
// Demo Data Provider Implementation (Exhibition Crisis Cascade Telemetry)
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
  DataQualityState,
} from '../domain/digital-twin/city-data-provider.domain';
import { CrossDomainSignalDto } from '../domain/digital-twin/cross-domain.domain';
import { cityCrisisDemoService } from '../demo/city-crisis-demo.service';

export class DemoCityDataProvider implements CityDataProvider {
  public readonly providerId = 'provider-demo-crisis-001';
  public readonly providerName = 'City Flood Cascade Expo Demo Provider';
  public readonly providerType = 'DEMO';
  public readonly provenance: Phase8ProvenanceSource = 'DEMO';

  constructor(private customTimestamp?: string, private forceDataQuality?: DataQualityState) {}

  private createMetadata(source: Phase8ProvenanceSource = 'DEMO', confidence: number = 98): any {
    const ts = this.customTimestamp || new Date().toISOString();
    const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
    let quality: DataQualityState = this.forceDataQuality || (ageSeconds > 60 ? 'STALE' : 'FRESH');

    return {
      timestamp: ts,
      source,
      confidence,
      freshnessSeconds: ageSeconds,
      dataQuality: quality,
      metadata: { demoScenarioId: 'DEMO_CITY_CRISIS_001', dataSource: 'SIMULATION' },
    };
  }

  public async getEnvironmentalTelemetry(cityId: string): Promise<CityDataProviderResponse<EnvironmentalTelemetryDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 98),
      payload: [
        {
          sensorId: 'env-demo-benz-01',
          stationName: 'Benz Circle Catchment Environmental Station',
          airQualityIndex: 58,
          noiseLevelDb: 72.4,
          ambientTemperatureCelsius: 26.5,
          humidityPercent: 94,
          co2Ppm: 430,
          timestamp: ts,
        },
      ],
    };
  }

  public async getWeatherFeed(cityId: string): Promise<CityDataProviderResponse<WeatherFeedDto>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 99),
      payload: {
        feedId: 'wth-demo-rain-001',
        stationName: 'Vijayawada Extreme Weather Doppler Radar',
        rainfallAccumulationMmHr: 145.0,
        precipitationType: 'THUNDERSTORM',
        windSpeedKmh: 48.5,
        pressureHpa: 998.2,
        temperatureCelsius: 25.4,
        visibilityKm: 1.2,
        timestamp: ts,
      },
    };
  }

  public async getMobilityFeed(cityId: string): Promise<CityDataProviderResponse<MobilityFeedDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 97),
      payload: [
        {
          corridorId: 'ast-mob-arterial-nh9',
          corridorName: 'NH-9 Main Arterial Corridor',
          congestionPercent: 92.4,
          averageSpeedKmh: 6.5,
          vehicleVolumePerHr: 5400,
          roadInundationDepthCm: 42.0,
          timestamp: ts,
        },
      ],
    };
  }

  public async getTransitFeed(cityId: string): Promise<CityDataProviderResponse<TransitFeedDto>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 95),
      payload: {
        fleetId: 'ast-trn-fleet-sec4',
        fleetName: 'Sector 4 Bus Corridor Fleet',
        activeVehiclesCount: 65,
        delayedVehiclesCount: 48,
        averageDelayMinutes: 48.5,
        routeDisruptionCount: 8,
        timestamp: ts,
      },
    };
  }

  public async getUtilityTelemetry(cityId: string): Promise<CityDataProviderResponse<UtilityTelemetryDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 96),
      payload: [
        {
          substationId: 'substation-4b',
          substationName: 'Substation 4B Primary Power Node',
          gridLoadPercent: 94.2,
          thermalSurgeCelsius: 78.2,
          waterPressurePsi: 58.0,
          outageRiskScore: 88.5,
          timestamp: ts,
        },
      ],
    };
  }

  public async getEmergencyFeed(cityId: string): Promise<CityDataProviderResponse<EmergencyFeedDto>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 98),
      payload: {
        routeId: 'ast-emg-hosp-route',
        routeName: 'General Hospital Response Route',
        hospitalAccessDelayMinutes: 22.0,
        activeDispatchesCount: 28,
        availableAmbulanceCount: 3,
        availableFireUnitsCount: 2,
        timestamp: ts,
      },
    };
  }

  public async getCitizenIntelligenceFeed(cityId: string): Promise<CityDataProviderResponse<CitizenIntelligenceDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 90),
      payload: [
        {
          reportId: 'rep-demo-cit-101',
          category: 'FLOOD_CASCADE',
          description: 'Flash flooding on NH-9 underpass near Benz Circle junction.',
          urgency: 'CRITICAL',
          location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
          upvotesCount: 142,
          timestamp: ts,
        },
      ],
    };
  }

  public async getNormalizedSignals(cityId: string): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>> {
    const demoScenario = await cityCrisisDemoService.runDemoScenario();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('DEMO', 98),
      payload: demoScenario.pipelineChain.stage1_signals,
    };
  }
}
