// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Real-Time Telemetry Service
// Provider Abstraction Layer (Simulated & Future IoT Ingestion)
// ──────────────────────────────────────────────────────────────

import { TwinTelemetryDto, TelemetryType } from '../domain/digital-twin/digital-twin.domain';

export interface ITelemetryProvider {
  fetchTelemetry(assetId: string): Promise<TwinTelemetryDto[]>;
}

export class SimulationTelemetryProvider implements ITelemetryProvider {
  async fetchTelemetry(assetId: string): Promise<TwinTelemetryDto[]> {
    return [
      {
        telemetryId: `tlm-${Date.now()}-1`,
        sensorId: 'sns-wtr-101',
        assetId,
        type: 'WATER_LEVEL',
        value: 4.8,
        unit: 'meters',
        timestamp: new Date().toISOString(),
        status: 'WARNING',
      },
      {
        telemetryId: `tlm-${Date.now()}-2`,
        sensorId: 'sns-wtr-101',
        assetId,
        type: 'RAINFALL',
        value: 42.5,
        unit: 'mm/h',
        timestamp: new Date().toISOString(),
        status: 'WARNING',
      },
      {
        telemetryId: `tlm-${Date.now()}-3`,
        sensorId: 'sns-str-101',
        assetId,
        type: 'STRUCTURAL_HEALTH',
        value: 68.5,
        unit: 'index',
        timestamp: new Date().toISOString(),
        status: 'NORMAL',
      },
    ];
  }
}

export class TwinTelemetryService {
  constructor(private readonly provider: ITelemetryProvider = new SimulationTelemetryProvider()) {}

  async getAssetTelemetry(assetId: string): Promise<TwinTelemetryDto[]> {
    return this.provider.fetchTelemetry(assetId);
  }
}

export const twinTelemetryService = new TwinTelemetryService();
