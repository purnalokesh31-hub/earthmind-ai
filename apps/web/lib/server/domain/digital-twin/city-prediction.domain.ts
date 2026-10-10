// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.1 Citywide Predictive Intelligence Domain
// ──────────────────────────────────────────────────────────────

import { DomainType, CascadeRiskClassification } from './cross-domain.domain';

export type PredictionHorizonWindow = '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
export type TrendDirection = 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE';

export interface PredictionSignalDto {
  signalId: string;
  domain: DomainType;
  entityId: string;
  entityName: string;
  metricName: string;
  currentValue: number;
  unit: string;
  timestamp: string;
}

export interface PredictionFeatureDto {
  featureId: string;
  featureName: string;
  domain: DomainType;
  normalizedScore: number; // 0 - 100
  weight: number; // 0 - 1.0
  trend: TrendDirection;
}

export interface PredictionConfidenceDto {
  overallConfidenceScore: number; // 0 - 100
  dataQualityScore: number;
  historicalAccuracyPercent: number;
  confidenceInterval: {
    lowerBound: number;
    upperBound: number;
  };
}

export interface PredictionHorizonDto {
  horizon: PredictionHorizonWindow;
  forecastRiskScore: number; // 0 - 100
  classification: CascadeRiskClassification;
  expectedAffectedPopulation: number;
  primaryRiskFactor: string;
}

export interface PredictionTrendDto {
  metricName: string;
  domain: DomainType;
  historyWindow: PredictionHorizonWindow;
  direction: TrendDirection;
  rateOfChangePercent: number;
  historicalDataPoints: Array<{ timestamp: string; value: number }>;
}

export interface PredictiveAlertDto {
  alertId: string;
  title: string;
  domain: DomainType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedTimeWindow: string; // e.g. "Next 2-4 hours"
  description: string;
  causalExplanation: string;
  requiresHumanApproval: boolean; // Always true
}

export interface CityRiskForecastDto {
  forecastId: string;
  cityId: string;
  targetDomain: DomainType | 'CITYWIDE';
  horizon: PredictionHorizonWindow;
  riskScore: number; // 0 - 100
  classification: CascadeRiskClassification;
  confidence: PredictionConfidenceDto;
  supportingSignals: PredictionSignalDto[];
  fusedFeatures: PredictionFeatureDto[];
  causalExplanation: string;
  affectedDomains: DomainType[];
  requiresHumanApproval: boolean; // Always true
}

export interface CityPredictionSummaryDto {
  cityId: string;
  cityName: string;
  citywideForecast: CityRiskForecastDto;
  horizonForecasts: PredictionHorizonDto[];
  predictiveAlerts: PredictiveAlertDto[];
  trends: PredictionTrendDto[];
  timestamp: string;
}

export interface CityPredictionEntity {
  predictionId: string;
  cityId: string;
  summary: CityPredictionSummaryDto;
  createdAt: Date;
  updatedAt: Date;
}
