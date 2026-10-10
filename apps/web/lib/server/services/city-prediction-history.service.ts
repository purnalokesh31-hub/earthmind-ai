// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.1 Historical Intelligence Service
// ──────────────────────────────────────────────────────────────

import { PredictionHorizonWindow, PredictionTrendDto } from '../domain/digital-twin/city-prediction.domain';

export class CityPredictionHistoryService {
  async getPredictionHistory(window: PredictionHorizonWindow): Promise<PredictionTrendDto[]> {
    return [
      {
        metricName: 'Citywide Cascade Risk Score',
        domain: 'CLIMATE',
        historyWindow: window,
        direction: 'INCREASING',
        rateOfChangePercent: 34.5,
        historicalDataPoints: [
          { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), value: 48.0 },
          { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), value: 64.0 },
          { timestamp: new Date().toISOString(), value: 82.5 },
        ],
      },
      {
        metricName: 'Utility Network Resilience Index',
        domain: 'UTILITY',
        historyWindow: window,
        direction: 'DECREASING',
        rateOfChangePercent: -22.0,
        historicalDataPoints: [
          { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), value: 78.5 },
          { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), value: 58.0 },
          { timestamp: new Date().toISOString(), value: 48.5 },
        ],
      },
    ];
  }
}

export const cityPredictionHistoryService = new CityPredictionHistoryService();
