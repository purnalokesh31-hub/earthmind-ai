// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture
// Mock Data Provider Implementation (Deterministic Mock Telemetry)
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

export class MockCityDataProvider implements CityDataProvider {
  public readonly providerId = 'provider-mock-default';
  public readonly providerName = 'Mock Local Sensor Telemetry Provider';
  public readonly providerType = 'MOCK';
  public readonly provenance: Phase8ProvenanceSource = 'LIVE';

  constructor(private customTimestamp?: string, private forceDataQuality?: DataQualityState) {}

  private createMetadata(source: Phase8ProvenanceSource = 'LIVE', confidence: number = 95): any {
    const ts = this.customTimestamp || new Date().toISOString();
    const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
    let quality: DataQualityState = this.forceDataQuality || (ageSeconds > 60 ? 'STALE' : 'FRESH');

    return {
      timestamp: ts,
      source,
      confidence,
      freshnessSeconds: ageSeconds,
      dataQuality: quality,
      metadata: { mockProviderVersion: '1.0.0-mock' },
    };
  }

  public async getEnvironmentalTelemetry(cityId: string): Promise<CityDataProviderResponse<EnvironmentalTelemetryDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('LIVE', 94),
      payload: [
        {
          sensorId: 'env-benz-01',
          stationName: 'Benz Circle Air & Noise Monitor',
          airQualityIndex: 42,
          noiseLevelDb: 68.5,
          ambientTemperatureCelsius: 28.4,
          humidityPercent: 88,
          co2Ppm: 412,
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
      metadata: this.createMetadata('LIVE', 96),
      payload: {
        feedId: 'wth-vja-main',
        stationName: 'Vijayawada Central Doppler Weather Station',
        rainfallAccumulationMmHr: 45.0,
        precipitationType: 'RAIN',
        windSpeedKmh: 34.2,
        pressureHpa: 1004.5,
        temperatureCelsius: 27.8,
        visibilityKm: 4.2,
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
      metadata: this.createMetadata('LIVE', 92),
      payload: [
        {
          corridorId: 'cor-nh9-benz',
          corridorName: 'NH-9 Benz Circle Corridor',
          congestionPercent: 78.5,
          averageSpeedKmh: 18.2,
          vehicleVolumePerHr: 3200,
          roadInundationDepthCm: 15.0,
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
      metadata: this.createMetadata('LIVE', 91),
      payload: {
        fleetId: 'flt-sec4-bus',
        fleetName: 'Sector 4 Bus Corridor Fleet',
        activeVehiclesCount: 42,
        delayedVehiclesCount: 18,
        averageDelayMinutes: 24.5,
        routeDisruptionCount: 3,
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
      metadata: this.createMetadata('LIVE', 95),
      payload: [
        {
          substationId: 'sub-4b',
          substationName: 'Substation 4B Electrical Grid',
          gridLoadPercent: 88.5,
          thermalSurgeCelsius: 74.2,
          waterPressurePsi: 45.0,
          outageRiskScore: 68.0,
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
      metadata: this.createMetadata('LIVE', 98),
      payload: {
        routeId: 'emg-hosp-route-01',
        routeName: 'General Hospital Response Route',
        hospitalAccessDelayMinutes: 18.5,
        activeDispatchesCount: 14,
        availableAmbulanceCount: 6,
        availableFireUnitsCount: 4,
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
      metadata: this.createMetadata('LIVE', 88),
      payload: [
        {
          reportId: 'rep-cit-901',
          category: 'WATER_LOGGING',
          description: 'Water accumulation near Benz Circle service road blocking pedestrian crossover.',
          urgency: 'HIGH',
          location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
          upvotesCount: 34,
          timestamp: ts,
        },
      ],
    };
  }

  public async getNormalizedSignals(cityId: string): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>> {
    const ts = this.customTimestamp || new Date().toISOString();
    const weather = (await this.getWeatherFeed(cityId)).payload;
    const mobility = (await this.getMobilityFeed(cityId)).payload[0];
    const transit = (await this.getTransitFeed(cityId)).payload;
    const utility = (await this.getUtilityTelemetry(cityId)).payload[0];
    const emergency = (await this.getEmergencyFeed(cityId)).payload;
    const citizen = (await this.getCitizenIntelligenceFeed(cityId)).payload[0];

    const signals: CrossDomainSignalDto[] = [
      {
        signalId: `sig-clm-${weather.feedId}`,
        domain: 'CLIMATE',
        entityId: weather.feedId,
        entityName: weather.stationName,
        eventType: 'HEAVY_RAINFALL',
        severity: weather.rainfallAccumulationMmHr > 100 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
        value: weather.rainfallAccumulationMmHr,
        unit: 'mm/hr',
        timestamp: ts,
        confidenceScore: 96,
      },
      {
        signalId: `sig-mob-${mobility.corridorId}`,
        domain: 'MOBILITY',
        entityId: mobility.corridorId,
        entityName: mobility.corridorName,
        eventType: 'ROAD_INUNDATION',
        severity: mobility.congestionPercent > 80 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.508, lng: 80.651, zoneId: 'zone-benz-circle' },
        value: mobility.congestionPercent,
        unit: '%',
        timestamp: ts,
        confidenceScore: 92,
      },
      {
        signalId: `sig-trn-${transit.fleetId}`,
        domain: 'TRANSIT',
        entityId: transit.fleetId,
        entityName: transit.fleetName,
        eventType: 'FLEET_DELAY',
        severity: transit.averageDelayMinutes > 30 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.51, lng: 80.655, zoneId: 'zone-benz-circle' },
        value: transit.averageDelayMinutes,
        unit: 'mins',
        timestamp: ts,
        confidenceScore: 91,
      },
      {
        signalId: `sig-utl-${utility.substationId}`,
        domain: 'UTILITY',
        entityId: utility.substationId,
        entityName: utility.substationName,
        eventType: 'THERMAL_SURGE',
        severity: utility.thermalSurgeCelsius > 70 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.504, lng: 80.642, zoneId: 'zone-benz-circle' },
        value: utility.thermalSurgeCelsius,
        unit: '°C',
        timestamp: ts,
        confidenceScore: 95,
      },
      {
        signalId: `sig-emg-${emergency.routeId}`,
        domain: 'EMERGENCY_RESPONSE',
        entityId: emergency.routeId,
        entityName: emergency.routeName,
        eventType: 'DISPATCH_ACCESS_DELAY',
        severity: emergency.hospitalAccessDelayMinutes > 20 ? 'CRITICAL' : 'HIGH',
        location: { lat: 16.502, lng: 80.64, zoneId: 'zone-benz-circle' },
        value: emergency.hospitalAccessDelayMinutes,
        unit: 'mins',
        timestamp: ts,
        confidenceScore: 98,
      },
      {
        signalId: `sig-cit-${citizen.reportId}`,
        domain: 'CITIZEN_INTELLIGENCE',
        entityId: citizen.reportId,
        entityName: 'Citizen Water Logging Report',
        eventType: citizen.category,
        severity: citizen.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
        location: citizen.location,
        value: citizen.upvotesCount,
        unit: 'upvotes',
        timestamp: ts,
        confidenceScore: 88,
      },
    ];

    return {
      providerId: this.providerId,
      providerType: this.providerType,
      provenance: this.provenance,
      metadata: this.createMetadata('LIVE', 94),
      payload: signals,
    };
  }
}
