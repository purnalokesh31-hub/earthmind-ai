// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.10 Predictive Risk Engine
// Weighted Multi-Factor Risk Forecasting & Pattern Analytics
// ──────────────────────────────────────────────────────────────

import { memoryPredictionRepository } from '../repositories/prediction.repository';
import { PredictionEntity, PredictionType, PredictionWindow } from '../domain/prediction.domain';

export interface AssessPredictionRequest {
  type: PredictionType;
  geographicScopeLevel: 'CITY' | 'ZONE' | 'DISTRICT' | 'REGION';
  geographicScopeId: string;
  geographicScopeName: string;
  predictionWindow?: PredictionWindow;
  historicalIncidentCount?: number;
  recentIncidentDensity?: number; // 0 - 100
  aiVisionConfidence?: number; // 0 - 100
  infrastructureAgeYears?: number; // 0 - 60
  sensorStressScore?: number; // 0 - 100
}

export class PredictiveRiskEngine {
  async generatePrediction(req: AssessPredictionRequest): Promise<PredictionEntity> {
    const window = req.predictionWindow || 'NEXT_24_HOURS';

    const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));

    // Dynamic Multi-Factor Inputs
    const historicalFactor = clamp((req.historicalIncidentCount ?? 8) * 5.5);
    const densityFactor = clamp(req.recentIncidentDensity ?? (req.sensorStressScore ? req.sensorStressScore * 0.9 : 65));
    const visionFactor = clamp(req.aiVisionConfidence ?? 78);
    const infraFactor = clamp((req.infrastructureAgeYears ?? 24) * 2.8);

    // Transparent weighted scoring calculation
    const historicalRecurrenceWeight = 35;
    const incidentDensityWeight = 25;
    const aiVisionConfidenceWeight = 20;
    const infrastructureAgeWeight = 20;

    const rawRisk =
      historicalFactor * (historicalRecurrenceWeight / 100) +
      densityFactor * (incidentDensityWeight / 100) +
      visionFactor * (aiVisionConfidenceWeight / 100) +
      infraFactor * (infrastructureAgeWeight / 100);

    const riskScore = clamp(Math.round(rawRisk), 5, 98);
    const confidenceScore = clamp(Math.round(visionFactor * 0.6 + (100 - Math.abs(densityFactor - historicalFactor) * 0.4) * 0.4), 25, 96);

    const hasLiveInputs = Boolean(
      req.historicalIncidentCount !== undefined ||
      req.recentIncidentDensity !== undefined ||
      req.sensorStressScore !== undefined ||
      req.infrastructureAgeYears !== undefined
    );

    const prediction: PredictionEntity = {
      id: `pred-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      predictionCode: `PRED-${req.type}-${Date.now().toString().slice(-4)}`,
      type: req.type,
      title: `${req.type.replace('_', ' ')} Forecast — ${req.geographicScopeName}`,
      description: `Predictive pattern analysis indicates ${riskScore >= 70 ? 'critically elevated' : riskScore >= 45 ? 'moderate' : 'low'} ${req.type.toLowerCase().replace('_', ' ')} probability (${riskScore}/100) within ${window.replace('_', ' ').toLowerCase()}.`,
      riskScore,
      confidenceScore,
      predictionWindow: window,
      predictionStart: new Date(),
      predictionEnd: new Date(Date.now() + 24 * 3600000),
      geographicScopeLevel: req.geographicScopeLevel,
      geographicScopeId: req.geographicScopeId,
      geographicScopeName: req.geographicScopeName,
      contributingFactors: [
        { name: 'Historical Incident Recurrence', weightPercentage: historicalRecurrenceWeight, description: `Pattern score: ${Math.round(historicalFactor)}/100 (${req.historicalIncidentCount ?? 8} recorded events)` },
        { name: 'Recent Incident Density', weightPercentage: incidentDensityWeight, description: `Telemetry density index: ${Math.round(densityFactor)}/100` },
        { name: 'AI Vision Detection Signal', weightPercentage: aiVisionConfidenceWeight, description: `Optical hazard signal confidence: ${Math.round(visionFactor)}%` },
        { name: 'Infrastructure Age', weightPercentage: infrastructureAgeWeight, description: `Decay index: ${Math.round(infraFactor)}/100 (${req.infrastructureAgeYears ?? 24} yr asset lifecycle)` },
      ],
      dataFreshness: hasLiveInputs ? 'FRESH' : 'STALE',
      modelName: 'WeightedRiskModel-v2.1',
      modelVersion: '2.1.0',
      status: 'GENERATED',
      recommendedActions: [
        `Pre-inspect vulnerable assets in ${req.geographicScopeName}`,
        `Alert sector duty officer for ${window.replace('_', ' ').toLowerCase()} monitoring`,
      ],
      uncertaintyLimitations: hasLiveInputs
        ? 'Computed from multi-factor telemetry inputs and historical recurrence curves.'
        : 'DEMO/ILLUSTRATIVE: Baseline simulation parameters used; connect live sensor telemetry for verified predictive analytics.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return memoryPredictionRepository.save(prediction);
  }
}

export const predictiveRiskEngine = new PredictiveRiskEngine();
