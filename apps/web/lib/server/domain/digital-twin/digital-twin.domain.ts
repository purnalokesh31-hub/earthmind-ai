// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.1 Urban Digital Twin Domain
// ──────────────────────────────────────────────────────────────

export type TwinEntityType =
  | 'INFRASTRUCTURE_ASSET'
  | 'ROAD_SEGMENT'
  | 'BUILDING'
  | 'BRIDGE'
  | 'DRAINAGE_SYSTEM'
  | 'WATER_INFRASTRUCTURE'
  | 'ELECTRICAL_INFRASTRUCTURE'
  | 'PUBLIC_FACILITY'
  | 'TRAFFIC_INFRASTRUCTURE'
  | 'ENVIRONMENTAL_SENSOR'
  | 'IOT_SENSOR';

export type AssetCategory =
  | 'ROAD'
  | 'BRIDGE'
  | 'BUILDING'
  | 'DRAINAGE'
  | 'WATER_PIPELINE'
  | 'ELECTRICAL_POLE'
  | 'TRANSFORMER'
  | 'STREET_LIGHT'
  | 'PUBLIC_FACILITY'
  | 'TRAFFIC_SIGNAL'
  | 'WASTE_INFRASTRUCTURE'
  | 'EMERGENCY_FACILITY';

export type TwinOperationalStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'DAMAGED'
  | 'CRITICAL'
  | 'OFFLINE'
  | 'UNDER_MAINTENANCE'
  | 'UNKNOWN';

export type TelemetryType =
  | 'TEMPERATURE'
  | 'WATER_LEVEL'
  | 'RAINFALL'
  | 'VIBRATION'
  | 'ELECTRICAL_LOAD'
  | 'POWER_STATUS'
  | 'TRAFFIC_DENSITY'
  | 'AIR_QUALITY'
  | 'PIPELINE_PRESSURE'
  | 'STRUCTURAL_HEALTH'
  | 'SENSOR_HEALTH';

export interface TwinTelemetryDto {
  telemetryId: string;
  sensorId: string;
  assetId: string;
  type: TelemetryType;
  value: number;
  unit: string;
  timestamp: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface TwinRelationshipDto {
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: 'CONTAINS' | 'AFFECTED_BY' | 'MONITORED_BY' | 'MAINTAINED_BY' | 'CONNECTED_TO';
  createdAt: string;
}

export interface TwinEventDto {
  eventId: string;
  entityId: string;
  eventType:
    | 'ASSET_CREATED'
    | 'ASSET_UPDATED'
    | 'ASSET_DAMAGED'
    | 'ASSET_REPAIRED'
    | 'SENSOR_ONLINE'
    | 'SENSOR_OFFLINE'
    | 'TELEMETRY_UPDATED'
    | 'INCIDENT_LINKED'
    | 'INCIDENT_RESOLVED'
    | 'RISK_CHANGED'
    | 'PREDICTION_CHANGED'
    | 'MAINTENANCE_STARTED'
    | 'MAINTENANCE_COMPLETED';
  timestamp: string;
  source: string;
  details: string;
}

export interface InfrastructureAssetEntity {
  assetId: string;
  assetType: AssetCategory;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  cityId: string;
  zoneId: string;
  installationDate: string;
  operationalStatus: TwinOperationalStatus;
  conditionScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  maintenanceStatus: 'GOOD' | 'INSPECTION_DUE' | 'REPAIR_REQUIRED' | 'UNDER_REPAIR';
  responsibleDepartment: string;
  linkedIncidentIds: string[];
  linkedPredictionIds: string[];
  linkedEvidenceIds: string[];
  linkedSensorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalTwinOverviewDto {
  twinId: string;
  cityName: string;
  totalAssetsCount: number;
  operationalAssetsCount: number;
  degradedAssetsCount: number;
  criticalAssetsCount: number;
  averageConditionScore: number;
  activeSensorsCount: number;
  linkedIncidentsCount: number;
  lastUpdated: string;
}
