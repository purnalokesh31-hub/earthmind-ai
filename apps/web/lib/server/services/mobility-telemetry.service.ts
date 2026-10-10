// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.5 Mobility Telemetry Provider Abstraction
// ──────────────────────────────────────────────────────────────

import { MobilityTelemetryDto } from '../domain/digital-twin/mobility.domain';

export interface IMobilityTelemetryProvider {
  getSegmentTelemetry(segmentId: string): Promise<MobilityTelemetryDto>;
}

export class SimulationMobilityTelemetryProvider implements IMobilityTelemetryProvider {
  async getSegmentTelemetry(segmentId: string): Promise<MobilityTelemetryDto> {
    return {
      telemetryId: `mob-tel-${Date.now()}`,
      segmentId,
      vehicleCount: 420,
      averageSpeedKmh: 14.2,
      occupancyPercent: 88.5,
      travelTimeSeconds: 355,
      queueLengthVehicles: 38,
      dataSource: 'SIMULATION',
      timestamp: new Date().toISOString(),
    };
  }
}

export const mobilityTelemetryService = new SimulationMobilityTelemetryProvider();
