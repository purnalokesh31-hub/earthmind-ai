// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.4 Climate Data Provider Abstraction
// ──────────────────────────────────────────────────────────────

export interface ClimateIndicatorsDto {
  cityId: string;
  rainfallIntensityMmHr: number;
  temperatureAnomalyCelsius: number;
  windSpeedKmh: number;
  floodRiskIndex: number; // 0 - 100
  heatStressIndex: number; // 0 - 100
  dataSource: 'SIMULATION' | 'OBSERVED_PROXICAL';
  timestamp: string;
}

export interface IClimateDataProvider {
  getClimateIndicators(cityId: string): Promise<ClimateIndicatorsDto>;
}

export class SimulationClimateDataProvider implements IClimateDataProvider {
  async getClimateIndicators(cityId: string): Promise<ClimateIndicatorsDto> {
    return {
      cityId,
      rainfallIntensityMmHr: 84.5,
      temperatureAnomalyCelsius: +3.2,
      windSpeedKmh: 68.0,
      floodRiskIndex: 88.0,
      heatStressIndex: 72.0,
      dataSource: 'SIMULATION',
      timestamp: new Date().toISOString(),
    };
  }
}

export const climateDataService = new SimulationClimateDataProvider();
