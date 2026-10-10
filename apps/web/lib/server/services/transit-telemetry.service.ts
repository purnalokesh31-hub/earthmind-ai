// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.6 Transit Telemetry Provider Abstraction
// ──────────────────────────────────────────────────────────────

import { TransitTelemetryDto } from '../domain/digital-twin/transit.domain';

export interface ITransitTelemetryProvider {
  getVehicleTelemetry(vehicleId: string): Promise<TransitTelemetryDto>;
}

export class SimulationTransitTelemetryProvider implements ITransitTelemetryProvider {
  async getVehicleTelemetry(vehicleId: string): Promise<TransitTelemetryDto> {
    return {
      telemetryId: `trn-tel-${Date.now()}`,
      vehicleId,
      routeId: 'rt-bus-12',
      speedKmh: 12.5,
      currentPassengerCount: 58,
      occupancyPercent: 96.6,
      delayMinutes: 24.5,
      stopDwellTimeSeconds: 110,
      dataSource: 'SIMULATION',
      timestamp: new Date().toISOString(),
    };
  }
}

export const transitTelemetryService = new SimulationTransitTelemetryProvider();
