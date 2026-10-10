// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.10 Prediction Repositories
// ──────────────────────────────────────────────────────────────

import {
  PredictionEntity,
  EarlyWarningEntity,
  PredictionFeedbackEntity,
} from '../domain/prediction.domain';

export interface IPredictionRepository {
  findById(id: string): Promise<PredictionEntity | null>;
  listActive(scopeId?: string): Promise<PredictionEntity[]>;
  save(prediction: PredictionEntity): Promise<PredictionEntity>;
}

export interface IWarningRepository {
  findById(id: string): Promise<EarlyWarningEntity | null>;
  listActive(): Promise<EarlyWarningEntity[]>;
  save(warning: EarlyWarningEntity): Promise<EarlyWarningEntity>;
}

export interface IPredictionFeedbackRepository {
  save(feedback: PredictionFeedbackEntity): Promise<PredictionFeedbackEntity>;
  listByPredictionId(predictionId: string): Promise<PredictionFeedbackEntity[]>;
}

export class MemoryPredictionRepository implements IPredictionRepository {
  private predictions: PredictionEntity[] = [
    {
      id: 'pred-101',
      predictionCode: 'PRED-FLOOD-2026-01',
      type: 'FLOOD_RISK',
      title: 'High Hydro-Surge Risk Forecast — Benz Circle Ward 12 Corridor',
      description: 'Statistical recurrence analysis indicates 78% probability of localized urban drainage breach within 24h.',
      riskScore: 82,
      confidenceScore: 78,
      predictionWindow: 'NEXT_24_HOURS',
      predictionStart: new Date(),
      predictionEnd: new Date(Date.now() + 24 * 3600000),
      geographicScopeLevel: 'ZONE',
      geographicScopeId: 'zone-w12',
      geographicScopeName: 'Vijayawada Ward 12',
      contributingFactors: [
        { name: 'Historical Recurrence', weightPercentage: 35, description: 'Repeated drainage surcharge in monsoon cycles' },
        { name: 'Recent Incident Surge', weightPercentage: 25, description: '2 incidents reported in past 6 hours' },
        { name: 'Infrastructure Age', weightPercentage: 20, description: 'Cast-iron main aging factor' },
        { name: 'Regional Water Accumulation', weightPercentage: 20, description: 'Surrounding upstream sector saturation' },
      ],
      dataFreshness: 'FRESH',
      modelName: 'StatisticalPatternModel-v2.1',
      modelVersion: '2.1.0',
      status: 'CONFIRMED',
      recommendedActions: [
        'Inspect drainage culverts at Benz Circle Junction',
        'Pre-position 2 mobile hydraulic pumps at Ward 12 response station',
        'Alert Public Works Duty Commander for 24h watch standby',
      ],
      uncertaintyLimitations: 'Based on historical incident recurrence and telemetry; unmonitored private drains excluded.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'pred-102',
      predictionCode: 'PRED-ROAD-2026-02',
      type: 'ROAD_DAMAGE_RISK',
      title: 'Asphalt Subsidence Risk Forecast — Bandar Road Sector 4',
      description: 'Subsurface shear telemetry predicts high road deformation likelihood within 72h.',
      riskScore: 68,
      confidenceScore: 84,
      predictionWindow: 'NEXT_72_HOURS',
      predictionStart: new Date(),
      predictionEnd: new Date(Date.now() + 72 * 3600000),
      geographicScopeLevel: 'ZONE',
      geographicScopeId: 'zone-w14',
      geographicScopeName: 'Vijayawada Ward 14',
      contributingFactors: [
        { name: 'AI Vision Telemetry', weightPercentage: 40, description: 'YOLOv8 detected minor crack expansion' },
        { name: 'Heavy Vehicle Traffic', weightPercentage: 30, description: 'High transit volume on NH-9 feeder' },
        { name: 'Historical Surface Shear', weightPercentage: 30, description: 'Prior pothole repair record' },
      ],
      dataFreshness: 'FRESH',
      modelName: 'RuleBasedRiskModel-v1.4',
      modelVersion: '1.4.2',
      status: 'GENERATED',
      recommendedActions: [
        'Schedule road inspection crew within 24 hours',
        'Verify weight limits for heavy transit vehicles',
      ],
      uncertaintyLimitations: 'Visual surface telemetry indicates sub-surface stress; ground penetrating radar scan recommended.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<PredictionEntity | null> {
    return this.predictions.find((p) => p.id === id) || null;
  }

  async listActive(scopeId?: string): Promise<PredictionEntity[]> {
    if (scopeId) return this.predictions.filter((p) => p.geographicScopeId === scopeId);
    return this.predictions;
  }

  async save(prediction: PredictionEntity): Promise<PredictionEntity> {
    const idx = this.predictions.findIndex((p) => p.id === prediction.id);
    if (idx >= 0) this.predictions[idx] = prediction;
    else this.predictions.push(prediction);
    return prediction;
  }
}

export class MemoryWarningRepository implements IWarningRepository {
  private warnings: EarlyWarningEntity[] = [
    {
      id: 'warn-101',
      warningCode: 'WARN-CRIT-2026-01',
      predictionId: 'pred-101',
      warningLevel: 'CRITICAL',
      title: 'CRITICAL HAZARD WATCH: Vijayawada Ward 12 Urban Flood Forecast',
      message: 'High flood risk predicted for Ward 12 within the next 24 hours. Confidence: 78%. Main factors: recurring flooding and drainage surcharge.',
      geographicScopeName: 'Vijayawada Ward 12',
      predictionWindow: 'NEXT_24_HOURS',
      confidenceScore: 78,
      recommendedPreventiveActions: [
        'Deploy Public Works emergency response unit',
        'Pre-position heavy hydraulic pumps',
      ],
      createdAt: new Date(),
    },
  ];

  async findById(id: string): Promise<EarlyWarningEntity | null> {
    return this.warnings.find((w) => w.id === id) || null;
  }

  async listActive(): Promise<EarlyWarningEntity[]> {
    return this.warnings;
  }

  async save(warning: EarlyWarningEntity): Promise<EarlyWarningEntity> {
    const idx = this.warnings.findIndex((w) => w.id === warning.id);
    if (idx >= 0) this.warnings[idx] = warning;
    else this.warnings.push(warning);
    return warning;
  }
}

export class MemoryPredictionFeedbackRepository implements IPredictionFeedbackRepository {
  private feedback: PredictionFeedbackEntity[] = [];

  async save(fb: PredictionFeedbackEntity): Promise<PredictionFeedbackEntity> {
    this.feedback.push(fb);
    return fb;
  }

  async listByPredictionId(predictionId: string): Promise<PredictionFeedbackEntity[]> {
    return this.feedback.filter((f) => f.predictionId === predictionId);
  }
}

export const memoryPredictionRepository = new MemoryPredictionRepository();
export const memoryWarningRepository = new MemoryWarningRepository();
export const memoryPredictionFeedbackRepository = new MemoryPredictionFeedbackRepository();
