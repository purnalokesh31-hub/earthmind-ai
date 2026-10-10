// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.9 Multi-Tenant Geographic Domain Hierarchy
// ──────────────────────────────────────────────────────────────

export type GeographicScopeLevel = 'NATIONAL' | 'REGION' | 'DISTRICT' | 'CITY' | 'ZONE';

export interface BoundingBoxCoordinates {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface GeographicPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // GeoJSON format [[lng, lat]]
}

export interface CountryDomainEntity {
  id: string;
  code: string;
  name: string;
  iso2: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StateDomainEntity {
  id: string;
  countryId: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionDomainEntity {
  id: string;
  stateId: string;
  code: string;
  name: string;
  bounds?: BoundingBoxCoordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistrictDomainEntity {
  id: string;
  regionId: string;
  code: string;
  name: string;
  bounds?: BoundingBoxCoordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityDomainEntity {
  id: string;
  districtId: string;
  code: string;
  name: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
  bounds?: BoundingBoxCoordinates;
  emergencyContacts?: Record<string, string>;
  slaPolicyOverrides?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationalZoneDomainEntity {
  id: string;
  cityId: string;
  code: string;
  name: string;
  wardNumber?: string;
  bounds?: BoundingBoxCoordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolvedJurisdiction {
  countryId: string;
  stateId: string;
  regionId: string;
  districtId: string;
  cityId: string;
  zoneId?: string;
  countryName: string;
  stateName: string;
  regionName: string;
  districtName: string;
  cityName: string;
  zoneName?: string;
}

export interface RegionalEventDomainEntity {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCities: string[];
  affectedDistricts: string[];
  incidentIds: string[];
  bounds: BoundingBoxCoordinates;
  riskScore: number;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionalDispatchRecommendation {
  incidentId: string;
  sourceCityId: string;
  recommendedSupportCityId: string;
  agencyName: string;
  estimatedTravelTimeMinutes: number;
  resourceType: string;
  confidence: number;
  reasoning: string;
}
