// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.5 Urban Mobility & Traffic Intelligence Domain
// ──────────────────────────────────────────────────────────────

export type CongestionLevel =
  | 'FREE_FLOW'
  | 'NORMAL'
  | 'SLOW'
  | 'CONGESTED'
  | 'SEVERELY_CONGESTED'
  | 'GRIDLOCK';

export type TransportAssetType =
  | 'ROAD_SEGMENT'
  | 'BRIDGE'
  | 'INTERSECTION'
  | 'TRAFFIC_SIGNAL'
  | 'PEDESTRIAN_CROSSING'
  | 'TRANSIT_CORRIDOR'
  | 'PARKING_ZONE';

export type TrafficPredictionHorizon =
  | 'NEXT_30_MINUTES'
  | 'NEXT_1_HOUR'
  | 'NEXT_3_HOURS'
  | 'NEXT_6_HOURS'
  | 'NEXT_24_HOURS';

export interface TrafficSegmentEntity {
  segmentId: string;
  name: string;
  cityId: string;
  zoneId: string;
  startIntersectionId: string;
  endIntersectionId: string;
  lengthMeters: number;
  speedLimitKmh: number;
  averageSpeedKmh: number;
  vehicleCount: number;
  occupancyPercent: number; // 0 - 100
  congestionLevel: CongestionLevel;
  roadConditionScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntersectionEntity {
  intersectionId: string;
  name: string;
  cityId: string;
  zoneId: string;
  signalId?: string;
  connectedSegmentIds: string[];
  averageDelaySeconds: number;
  queueLengthVehicles: number;
  congestionLevel: CongestionLevel;
}

export interface TrafficSignalEntity {
  signalId: string;
  intersectionId: string;
  mode: 'FIXED_TIMING' | 'ADAPTIVE' | 'MANUAL_OVERRIDE' | 'EMERGENCY_PREEMPTION';
  cycleTimeSeconds: number;
  greenPhaseDurationSeconds: number;
  operationalStatus: 'OPERATIONAL' | 'DEGRADED' | 'FAULT';
}

export interface MobilityTelemetryDto {
  telemetryId: string;
  segmentId: string;
  vehicleCount: number;
  averageSpeedKmh: number;
  occupancyPercent: number;
  travelTimeSeconds: number;
  queueLengthVehicles: number;
  dataSource: 'SIMULATION' | 'OBSERVED_PROXICAL';
  timestamp: string;
}

export interface CongestionEventDto {
  eventId: string;
  segmentId: string;
  segmentName: string;
  congestionLevel: CongestionLevel;
  severityScore: number; // 0 - 100
  estimatedDelayMinutes: number;
  causeSummary: string;
  timestamp: string;
}

export interface TrafficFlowDto {
  segmentId: string;
  flowRateVehiclesPerHour: number;
  densityVehiclesPerKm: number;
  congestionScore: number;
}

export interface MobilityRiskDto {
  segmentId: string;
  predictedCongestion: CongestionLevel;
  riskScore: number; // 0 - 100
  predictionHorizon: TrafficPredictionHorizon;
  contributingFactors: string[];
}

export interface RouteOptimizationDto {
  routeId: string;
  origin: string;
  destination: string;
  recommendedPathSegmentIds: string[];
  estimatedTravelTimeMinutes: number;
  baselineTravelTimeMinutes: number;
  timeSavedMinutes: number;
  confidenceScore: number;
}

export interface TrafficScenarioDto {
  scenarioId: string;
  title: string;
  description: string;
  cityId: string;
  disruptionType: 'ROAD_CLOSURE' | 'SIGNAL_FAILURE' | 'ACCIDENT' | 'FLOOD_INUNDATION';
  targetSegmentId: string;
  simulatedCongestion: CongestionLevel;
  estimatedDelayDeltaMinutes: number;
  status: 'COMPLETED';
}

export interface MobilityRecommendationDto {
  recommendationId: string;
  title: string;
  description: string;
  targetIntersectionId?: string;
  targetSegmentId?: string;
  actionType: 'SIGNAL_TIMING_ADJUSTMENT' | 'TRAFFIC_DIVERSION' | 'EMERGENCY_LANE_ACTIVATION';
  expectedCongestionReductionPercent: number;
  requiresHumanApproval: boolean; // Always true
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
}
