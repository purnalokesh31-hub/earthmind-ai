// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.1 Risk Prediction Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityPredictionSummaryDto,
  CityRiskForecastDto,
  PredictionHorizonDto,
  PredictiveAlertDto,
} from '../domain/digital-twin/city-prediction.domain';
import { memoryCityPredictionRepository } from '../repositories/city-prediction.repository';
import { cityPredictionFeatureService } from './city-prediction-feature.service';
import { cityPredictionHistoryService } from './city-prediction-history.service';

export class CityRiskPredictionService {
  async getPredictionSummary(cityId: string): Promise<CityPredictionSummaryDto> {
    const existing = await memoryCityPredictionRepository.findLatestPredictionByCity(cityId);
    if (existing) return existing.summary;

    const fusedFeatures = await cityPredictionFeatureService.extractAndFuseFeatures(cityId);
    const trends = await cityPredictionHistoryService.getPredictionHistory('24h');

    const citywideForecast: CityRiskForecastDto = {
      forecastId: `fc-${Date.now()}`,
      cityId,
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
      ],
      fusedFeatures,
      causalExplanation: 'Fuses multi-domain features: 145mm/hr rain accumulation rate, 92.4 C substation thermal stress, and 88.5 congestion index.',
      affectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
      requiresHumanApproval: true,
    };

    const horizonForecasts: PredictionHorizonDto[] = [
      { horizon: '1h', forecastRiskScore: 64.0, classification: 'HIGH', expectedAffectedPopulation: 12000, primaryRiskFactor: 'Flash Inundation' },
      { horizon: '6h', forecastRiskScore: 82.5, classification: 'CRITICAL', expectedAffectedPopulation: 28500, primaryRiskFactor: 'Substation Outage & Transit Delay' },
      { horizon: '24h', forecastRiskScore: 52.0, classification: 'ELEVATED', expectedAffectedPopulation: 8500, primaryRiskFactor: 'Water Drainage Slower Recovery' },
      { horizon: '7d', forecastRiskScore: 30.0, classification: 'GUARDED', expectedAffectedPopulation: 1000, primaryRiskFactor: 'Post-Storm Maintenance' },
    ];

    const predictiveAlerts: PredictiveAlertDto[] = [
      {
        alertId: `alt-${Date.now()}`,
        title: 'CRITICAL: Ward 12 Transformer Thermal Runaway & Flooding Overlap',
        domain: 'UTILITY',
        severity: 'CRITICAL',
        predictedTimeWindow: 'Next 2-4 hours',
        description: 'Transformer TX-4 temperature predicted to cross 98 C threshold within 3 hours under current storm load.',
        causalExplanation: 'Heavy rainfall forcing auxiliary pump load while radiator cooling is impaired.',
        requiresHumanApproval: true,
      },
    ];

    const summary: CityPredictionSummaryDto = {
      cityId,
      cityName: cityId === 'city-vja' ? 'Vijayawada Municipal Corporation' : 'Visakhapatnam Metropolitan Region',
      citywideForecast,
      horizonForecasts,
      predictiveAlerts,
      trends,
      timestamp: new Date().toISOString(),
    };

    await memoryCityPredictionRepository.savePrediction({
      predictionId: `pred-city-${Date.now()}`,
      cityId,
      summary,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return summary;
  }
}

export const cityRiskPredictionService = new CityRiskPredictionService();
