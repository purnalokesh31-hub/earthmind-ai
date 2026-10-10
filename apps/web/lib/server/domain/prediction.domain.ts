// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.10 Predictive Intelligence Domain
// ──────────────────────────────────────────────────────────────

export type PredictionStatus = 'GENERATED' | 'REVIEWING' | 'CONFIRMED' | 'DISMISSED' | 'EXPIRED';

export type PredictionType =
  | 'FLOOD_RISK'
  | 'FIRE_RISK'
  | 'ROAD_DAMAGE_RISK'
  | 'WATER_LEAKAGE_RISK'
  | 'GARBAGE_OVERFLOW_RISK'
  | 'POWER_FAILURE_RISK'
  | 'INFRASTRUCTURE_DAMAGE_RISK'
  | 'CROPLAND_STRESS_RISK'
  | 'MULTI_HAZARD_RISK';

export type PredictionWindow = 'NEXT_6_HOURS' | 'NEXT_24_HOURS' | 'NEXT_72_HOURS' | 'NEXT_7_DAYS' | 'NEXT_30_DAYS';

export type DataFreshnessStatus = 'FRESH' | 'AGING' | 'STALE';

export type WarningLevel = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface PredictionFactor {
  name: string;
  weightPercentage: number;
  description: string;
}

export interface PredictionEntity {
  id: string;
  predictionCode: string;
  type: PredictionType;
  title: string;
  description: string;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100 %
  predictionWindow: PredictionWindow;
  predictionStart: Date;
  predictionEnd: Date;
  geographicScopeLevel: 'CITY' | 'ZONE' | 'DISTRICT' | 'REGION';
  geographicScopeId: string;
  geographicScopeName: string;
  contributingFactors: PredictionFactor[];
  dataFreshness: DataFreshnessStatus;
  modelName: string;
  modelVersion: string;
  status: PredictionStatus;
  recommendedActions: string[];
  uncertaintyLimitations: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EarlyWarningEntity {
  id: string;
  warningCode: string;
  predictionId: string;
  warningLevel: WarningLevel;
  title: string;
  message: string;
  geographicScopeName: string;
  predictionWindow: PredictionWindow;
  confidenceScore: number;
  recommendedPreventiveActions: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface PredictionFeedbackEntity {
  id: string;
  predictionId: string;
  predictedRisk: number;
  actualIncidentsCount: number;
  actualRisk: number;
  predictionAccuracy: number; // %
  falsePositive: boolean;
  falseNegative: boolean;
  reviewedBy: string;
  notes?: string;
  createdAt: Date;
}
