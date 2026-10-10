// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.1 City Prediction Repository
// ──────────────────────────────────────────────────────────────

import { CityPredictionEntity } from '../domain/digital-twin/city-prediction.domain';

export interface ICityPredictionRepository {
  findLatestPredictionByCity(cityId: string): Promise<CityPredictionEntity | null>;
  savePrediction(entity: CityPredictionEntity): Promise<CityPredictionEntity>;
}

export class MemoryCityPredictionRepository implements ICityPredictionRepository {
  private predictions: CityPredictionEntity[] = [
    {
      predictionId: 'pred-city-401',
      cityId: 'city-vja',
      summary: {
        cityId: 'city-vja',
        cityName: 'Vijayawada Municipal Corporation',
        citywideForecast: {
          forecastId: 'fc-401',
          cityId: 'city-vja',
          targetDomain: 'CITYWIDE',
          horizon: '6h',
          riskScore: 82.5,
          classification: 'CRITICAL',
          confidence: {
            overallConfidenceScore: 94.2,
            dataQualityScore: 96.0,
            historicalAccuracyPercent: 93.8,
            confidenceInterval: { lowerBound: 78.0, upperBound: 87.0 },
          },
          supportingSignals: [
            {
              signalId: 'sig-clm-101',
              domain: 'CLIMATE',
              entityId: 'ast-clm-flood-01',
              entityName: 'Benz Circle Inundation Zone',
              metricName: 'Rainfall Intensity',
              currentValue: 145.0,
              unit: 'mm/hr',
              timestamp: new Date().toISOString(),
            },
            {
              signalId: 'sig-utl-104',
              domain: 'UTILITY',
              entityId: 'ast-pow-tx-102',
              entityName: 'Ward 12 Substation Transformer TX-4',
              metricName: 'Transformer Temperature',
              currentValue: 92.4,
              unit: 'Celsius',
              timestamp: new Date().toISOString(),
            },
          ],
          fusedFeatures: [
            { featureId: 'f1', featureName: 'Precipitation Accumulation Rate', domain: 'CLIMATE', normalizedScore: 92.0, weight: 0.3, trend: 'INCREASING' },
            { featureId: 'f2', featureName: 'Substation Thermal Stress Index', domain: 'UTILITY', normalizedScore: 88.0, weight: 0.3, trend: 'INCREASING' },
            { featureId: 'f3', featureName: 'Arterial Road Congestion Multiplier', domain: 'MOBILITY', normalizedScore: 78.0, weight: 0.2, trend: 'STABLE' },
          ],
          causalExplanation: 'Simulated 6-hour predictive model indicates high likelihood of extreme urban flooding cascading into Ward 12 transformer thermal failure and emergency response delay.',
          affectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
          requiresHumanApproval: true,
        },
        horizonForecasts: [
          { horizon: '1h', forecastRiskScore: 64.0, classification: 'HIGH', expectedAffectedPopulation: 12000, primaryRiskFactor: 'Flash Inundation' },
          { horizon: '6h', forecastRiskScore: 82.5, classification: 'CRITICAL', expectedAffectedPopulation: 28500, primaryRiskFactor: 'Substation Outage & Transit Delay' },
          { horizon: '24h', forecastRiskScore: 52.0, classification: 'ELEVATED', expectedAffectedPopulation: 8500, primaryRiskFactor: 'Water Drainage Slower Recovery' },
          { horizon: '7d', forecastRiskScore: 30.0, classification: 'GUARDED', expectedAffectedPopulation: 1000, primaryRiskFactor: 'Post-Storm Maintenance' },
        ],
        predictiveAlerts: [
          {
            alertId: 'alt-401',
            title: 'CRITICAL: Ward 12 Transformer Thermal Runaway & Flooding Overlap',
            domain: 'UTILITY',
            severity: 'CRITICAL',
            predictedTimeWindow: 'Next 2-4 hours',
            description: 'Transformer TX-4 temperature predicted to cross 98 C threshold within 3 hours under current storm load.',
            causalExplanation: 'Heavy rainfall forcing auxiliary pump load while radiator cooling is impaired.',
            requiresHumanApproval: true,
          },
        ],
        trends: [
          {
            metricName: 'Citywide Cascade Risk Score',
            domain: 'CLIMATE',
            historyWindow: '24h',
            direction: 'INCREASING',
            rateOfChangePercent: 34.5,
            historicalDataPoints: [
              { timestamp: '2026-08-09T18:00:00Z', value: 48.0 },
              { timestamp: '2026-08-09T21:00:00Z', value: 64.0 },
              { timestamp: '2026-08-10T00:00:00Z', value: 82.5 },
            ],
          },
        ],
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findLatestPredictionByCity(cityId: string): Promise<CityPredictionEntity | null> {
    return this.predictions.find((p) => p.cityId === cityId) || null;
  }

  async savePrediction(entity: CityPredictionEntity): Promise<CityPredictionEntity> {
    const idx = this.predictions.findIndex((p) => p.predictionId === entity.predictionId);
    if (idx >= 0) this.predictions[idx] = entity;
    else this.predictions.push(entity);
    return entity;
  }
}

export const memoryCityPredictionRepository = new MemoryCityPredictionRepository();
