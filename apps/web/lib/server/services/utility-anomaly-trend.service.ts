// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility Anomaly Trend Engine
// ──────────────────────────────────────────────────────────────

import { UtilityAnomalyTrendDto } from '../domain/digital-twin/utility-prediction.domain';

export class UtilityAnomalyTrendService {
  async detectAnomalyTrends(assetId: string): Promise<UtilityAnomalyTrendDto[]> {
    return [
      {
        assetId,
        assetName: 'Ward 12 Distribution Transformer TX-4',
        metricName: 'Core Temperature',
        trendDirection: 'INCREASING',
        anomalySeverity: 'CRITICAL',
        supportingObservations: [
          'Sustained temperature above 85°C threshold over 6 consecutive hours.',
          'Thermal dissipation efficiency dropped by 34%.',
        ],
      },
    ];
  }
}

export const utilityAnomalyTrendService = new UtilityAnomalyTrendService();
