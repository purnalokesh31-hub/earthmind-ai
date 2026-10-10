// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Sensor Telemetry Service
// ──────────────────────────────────────────────────────────────
// Sensor telemetry stream ingestion, threshold anomaly detection,
// piezometric pressure surge evaluation & auto-dispatch.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type { SensorTelemetry } from '../../types';

const mockDelay = (ms = 150): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class SensorService {
  /**
   * Ingests a telemetry sensor stream packet and checks for threshold anomalies.
   */
  static async ingestSensorStream(
    sensorId: string,
    sensorType: string,
    value: number,
    normalMin: number,
    normalMax: number,
    unit: string
  ): Promise<SensorTelemetry> {
    await mockDelay(100);

    const isAnomaly = value < normalMin || value > normalMax;

    const telemetry: SensorTelemetry = {
      sensorId,
      sensorType,
      unit,
      value,
      normalRange: { min: normalMin, max: normalMax },
      isAnomaly,
      rawPayload: {
        timestamp: new Date().toISOString(),
        gridSector: 'Ward 12',
        telemetryGateway: 'GW-BENZ-04',
      },
    };

    const store = useAppStore.getState();

    if (isAnomaly) {
      store.logAuditEvent({
        event: 'SENSOR_ANOMALY_DETECTED',
        actor: `Autonomous Sensor [${sensorId}]`,
        details: `Telemetry anomaly detected! ${sensorType}: ${value} ${unit} (Normal: ${normalMin}-${normalMax} ${unit}).`,
      });

      store.addToast({
        title: 'Sensor Anomaly Alert',
        message: `${sensorType} breach on ${sensorId}: ${value} ${unit}.`,
        type: 'warning',
      });
    }

    return telemetry;
  }

  /**
   * Evaluates hydro-piezometric pressure collapse packet.
   */
  static async evaluateHydroPiezometer(sensorId: string = 'PIEZO-4B'): Promise<SensorTelemetry> {
    return this.ingestSensorStream(sensorId, 'Hydro-Piezometric Pressure', 14.2, 50.0, 80.0, 'PSI');
  }
}

export default SensorService;
