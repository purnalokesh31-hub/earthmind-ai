// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8 Foundation Architecture
// Real-World Data Integration & Live City Intelligence Domain
// ──────────────────────────────────────────────────────────────

import { CrossDomainSignalDto, DomainType } from './cross-domain.domain';

export type Phase8ProvenanceSource =
  | 'LIVE'
  | 'SIMULATION'
  | 'DEMO'
  | 'PREDICTION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING';

export type DataQualityState =
  | 'FRESH'
  | 'DEGRADED'
  | 'STALE'
  | 'UNKNOWN'
  | 'INVALID'
  | 'UNAVAILABLE';

export interface DataFreshnessMetadataDto {
  timestamp: string; // ISO 8601
  source: Phase8ProvenanceSource | string;
  confidence: number; // 0 - 100
  freshnessSeconds: number; // Latency/age in seconds
  dataQuality: DataQualityState;
  metadata?: Record<string, any>;
}

export interface CityDataProviderResponse<T> {
  providerId: string;
  providerType: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';
  provenance: Phase8ProvenanceSource;
  metadata: DataFreshnessMetadataDto;
  payload: T;
}

// ── 7 Domain Telemetry Capabilities DTOs ──

export interface EnvironmentalTelemetryDto {
  sensorId: string;
  stationName: string;
  airQualityIndex: number;
  noiseLevelDb: number;
  ambientTemperatureCelsius: number;
  humidityPercent: number;
  co2Ppm: number;
  timestamp: string;
}

export interface WeatherFeedDto {
  feedId: string;
  stationName: string;
  rainfallAccumulationMmHr: number;
  precipitationType: 'NONE' | 'RAIN' | 'THUNDERSTORM' | 'CYCLONE';
  windSpeedKmh: number;
  pressureHpa: number;
  temperatureCelsius: number;
  visibilityKm: number;
  timestamp: string;
}

export interface MobilityFeedDto {
  corridorId: string;
  corridorName: string;
  congestionPercent: number;
  averageSpeedKmh: number;
  vehicleVolumePerHr: number;
  roadInundationDepthCm: number;
  timestamp: string;
}

export interface TransitFeedDto {
  fleetId: string;
  fleetName: string;
  activeVehiclesCount: number;
  delayedVehiclesCount: number;
  averageDelayMinutes: number;
  routeDisruptionCount: number;
  timestamp: string;
}

export interface UtilityTelemetryDto {
  substationId: string;
  substationName: string;
  gridLoadPercent: number;
  thermalSurgeCelsius: number;
  waterPressurePsi: number;
  outageRiskScore: number;
  timestamp: string;
}

export interface EmergencyFeedDto {
  routeId: string;
  routeName: string;
  hospitalAccessDelayMinutes: number;
  activeDispatchesCount: number;
  availableAmbulanceCount: number;
  availableFireUnitsCount: number;
  timestamp: string;
}

export interface CitizenIntelligenceDto {
  reportId: string;
  category: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: { lat: number; lng: number; zoneId?: string };
  upvotesCount: number;
  timestamp: string;
}

// ── Master CityDataProvider Contract Interface ──

export interface CityDataProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly providerType: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';
  readonly provenance: Phase8ProvenanceSource;

  getEnvironmentalTelemetry(cityId: string): Promise<CityDataProviderResponse<EnvironmentalTelemetryDto[]>>;
  getWeatherFeed(cityId: string): Promise<CityDataProviderResponse<WeatherFeedDto>>;
  getMobilityFeed(cityId: string): Promise<CityDataProviderResponse<MobilityFeedDto[]>>;
  getTransitFeed(cityId: string): Promise<CityDataProviderResponse<TransitFeedDto>>;
  getUtilityTelemetry(cityId: string): Promise<CityDataProviderResponse<UtilityTelemetryDto[]>>;
  getEmergencyFeed(cityId: string): Promise<CityDataProviderResponse<EmergencyFeedDto>>;
  getCitizenIntelligenceFeed(cityId: string): Promise<CityDataProviderResponse<CitizenIntelligenceDto[]>>;

  getNormalizedSignals(cityId: string): Promise<CityDataProviderResponse<CrossDomainSignalDto[]>>;
}
