// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.1 Smart Utility Infrastructure Domain
// ──────────────────────────────────────────────────────────────

export type UtilityType = 'ELECTRICITY' | 'WATER';

export type UtilityAssetType =
  | 'POWER_SUBSTATION'
  | 'DISTRIBUTION_TRANSFORMER'
  | 'FEEDER_LINE'
  | 'ELECTRICAL_POLE'
  | 'WATER_TREATMENT_PLANT'
  | 'WATER_PUMP_STATION'
  | 'WATER_STORAGE_TANK'
  | 'DISTRIBUTION_PIPELINE'
  | 'CONTROL_VALVE';

export type UtilityAssetState =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'CRITICAL'
  | 'OFFLINE'
  | 'UNDER_MAINTENANCE';

export interface UtilityNetworkEntity {
  networkId: string;
  name: string;
  utilityType: UtilityType;
  cityId: string;
  totalAssetsCount: number;
}

export interface UtilityZoneEntity {
  zoneId: string;
  name: string;
  cityId: string;
  utilityType: UtilityType;
  overallHealthScore: number; // 0 - 100
  criticalAssetsCount: number;
  offlineAssetsCount: number;
}

export interface UtilityAssetEntity {
  assetId: string;
  name: string;
  utilityType: UtilityType;
  assetType: UtilityAssetType;
  cityId: string;
  zoneId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  state: UtilityAssetState;
  conditionScore: number; // 0 - 100
  installationDate: string;
  lastMaintenanceDate: string;
  responsibleDepartment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UtilitySensorEntity {
  sensorId: string;
  assetId: string;
  sensorType: 'VOLTAGE' | 'CURRENT' | 'TEMPERATURE' | 'PRESSURE' | 'FLOW_RATE' | 'WATER_LEVEL' | 'LEAKAGE';
  unit: string;
  status: 'ONLINE' | 'OFFLINE' | 'FAULT';
}

export interface UtilityTelemetryDto {
  telemetryId: string;
  assetId: string;
  sensorId: string;
  utilityType: UtilityType;
  metricName: string;
  metricValue: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  dataSource: 'SIMULATION' | 'OBSERVED_PROXICAL';
  timestamp: string;
}

export interface UtilityAssetHealthDto {
  assetId: string;
  assetName: string;
  utilityType: UtilityType;
  state: UtilityAssetState;
  conditionScore: number;
  contributingFactors: string[];
  recommendedAction?: string;
}

export interface UtilityOverviewDto {
  cityId: string;
  electricityHealthScore: number;
  waterHealthScore: number;
  totalUtilityAssets: number;
  criticalAssetsCount: number;
  offlineAssetsCount: number;
  activeZoneSummaries: UtilityZoneEntity[];
}

export interface UtilityEventDto {
  eventId: string;
  assetId: string;
  assetName: string;
  utilityType: UtilityType;
  eventType: 'STATE_CHANGED' | 'TELEMETRY_ANOMALY' | 'OUTAGE_DETECTED' | 'MAINTENANCE_LOGGED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  timestamp: string;
}
