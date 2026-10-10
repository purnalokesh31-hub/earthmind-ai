// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.1 Utility Telemetry Provider Abstraction
// ──────────────────────────────────────────────────────────────

import { UtilityTelemetryDto, UtilityType } from '../domain/digital-twin/utility.domain';

export interface IUtilityTelemetryProvider {
  getLatestTelemetry(assetId: string): Promise<UtilityTelemetryDto[]>;
}

export class SimulationUtilityTelemetryProvider implements IUtilityTelemetryProvider {
  async getLatestTelemetry(assetId: string): Promise<UtilityTelemetryDto[]> {
    const isElectricity = assetId.includes('pow');
    const utilityType: UtilityType = isElectricity ? 'ELECTRICITY' : 'WATER';

    if (isElectricity) {
      return [
        {
          telemetryId: `utl-tel-${Date.now()}-1`,
          assetId,
          sensorId: `sns-${assetId}-volt`,
          utilityType,
          metricName: 'Voltage',
          metricValue: 11.2,
          unit: 'kV',
          status: 'NORMAL',
          dataSource: 'SIMULATION',
          timestamp: new Date().toISOString(),
        },
        {
          telemetryId: `utl-tel-${Date.now()}-2`,
          assetId,
          sensorId: `sns-${assetId}-temp`,
          utilityType,
          metricName: 'Core Temperature',
          metricValue: 88.5,
          unit: '°C',
          status: 'CRITICAL',
          dataSource: 'SIMULATION',
          timestamp: new Date().toISOString(),
        },
      ];
    }

    return [
      {
        telemetryId: `utl-tel-${Date.now()}-1`,
        assetId,
        sensorId: `sns-${assetId}-press`,
        utilityType,
        metricName: 'Pipeline Pressure',
        metricValue: 1.8,
        unit: 'bar',
        status: 'WARNING',
        dataSource: 'SIMULATION',
        timestamp: new Date().toISOString(),
      },
      {
        telemetryId: `utl-tel-${Date.now()}-2`,
        assetId,
        sensorId: `sns-${assetId}-flow`,
        utilityType,
        metricName: 'Water Flow Rate',
        metricValue: 420,
        unit: 'L/sec',
        status: 'NORMAL',
        dataSource: 'SIMULATION',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

export const utilityTelemetryService = new SimulationUtilityTelemetryProvider();
