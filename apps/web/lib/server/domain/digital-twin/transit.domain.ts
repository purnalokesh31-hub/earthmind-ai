// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.6 Multimodal Transport Domain
// ──────────────────────────────────────────────────────────────

export type TransportMode =
  | 'BUS'
  | 'PUBLIC_TRANSIT'
  | 'EMERGENCY_TRANSPORT'
  | 'PEDESTRIAN'
  | 'BICYCLE'
  | 'MULTIMODAL';

export type TransitState =
  | 'ON_TIME'
  | 'MINOR_DELAY'
  | 'DELAYED'
  | 'SEVERELY_DELAYED'
  | 'CANCELLED'
  | 'DISRUPTED';

export type DemandLevel = 'HIGH_DEMAND' | 'NORMAL_DEMAND' | 'LOW_DEMAND' | 'OVERCAPACITY';

export type TransitPredictionHorizon =
  | 'NEXT_15_MINUTES'
  | 'NEXT_30_MINUTES'
  | 'NEXT_1_HOUR'
  | 'NEXT_3_HOURS'
  | 'NEXT_6_HOURS'
  | 'NEXT_24_HOURS';

export interface TransitRouteEntity {
  routeId: string;
  routeNumber: string;
  name: string;
  cityId: string;
  mode: TransportMode;
  startStopId: string;
  endStopId: string;
  totalStopsCount: number;
  lengthKm: number;
  averageFrequencyMinutes: number;
  operationalStatus: TransitState;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransitStopEntity {
  stopId: string;
  name: string;
  cityId: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  passengerAccumulationCount: number;
  hasShelter: boolean;
  status: 'NORMAL' | 'CROWDED' | 'OVERCROWDED' | 'OUT_OF_SERVICE';
}

export interface TransitVehicleEntity {
  vehicleId: string;
  routeId: string;
  vehicleNumber: string;
  capacityPassengers: number;
  currentPassengerCount: number;
  occupancyPercentage: number;
  averageSpeedKmh: number;
  status: TransitState;
}

export interface TransitTelemetryDto {
  telemetryId: string;
  vehicleId: string;
  routeId: string;
  speedKmh: number;
  currentPassengerCount: number;
  occupancyPercent: number;
  delayMinutes: number;
  stopDwellTimeSeconds: number;
  dataSource: 'SIMULATION' | 'OBSERVED_PROXICAL';
  timestamp: string;
}

export interface PassengerDemandDto {
  stopId: string;
  stopName: string;
  demandScore: number; // 0 - 100
  demandLevel: DemandLevel;
  passengerCount: number;
}

export interface TransitDisruptionDto {
  disruptionId: string;
  routeId: string;
  routeName: string;
  state: TransitState;
  delayMinutes: number;
  cause: string;
  affectedPassengersEst: number;
  timestamp: string;
}

export interface MultimodalRouteDto {
  routeId: string;
  origin: string;
  destination: string;
  modesUsed: TransportMode[];
  estimatedTimeMinutes: number;
  timeSavedMinutes: number;
  confidenceScore: number;
}

export interface TransitRecommendationDto {
  recommendationId: string;
  title: string;
  description: string;
  targetRouteId: string;
  actionType: 'FLEET_REALLOCATION' | 'ROUTE_DIVERSION' | 'EXPRESS_SERVICE_DISPATCH';
  expectedDelayReductionPercent: number;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}
