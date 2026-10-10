// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.2 Utility Prediction Repository
// ──────────────────────────────────────────────────────────────

import { UtilityPredictionEntity, UtilityPredictiveMaintenanceDto } from '../domain/digital-twin/utility-prediction.domain';

export interface IUtilityPredictionRepository {
  listPredictionsByCityId(cityId: string): Promise<UtilityPredictionEntity[]>;
  findPredictionById(predictionId: string): Promise<UtilityPredictionEntity | null>;
  findPredictionByAssetId(assetId: string): Promise<UtilityPredictionEntity | null>;
  savePrediction(prediction: UtilityPredictionEntity): Promise<UtilityPredictionEntity>;
}

export class MemoryUtilityPredictionRepository implements IUtilityPredictionRepository {
  private predictions: UtilityPredictionEntity[] = [
    {
      predictionId: 'pred-utl-101',
      assetId: 'ast-pow-tx-102',
      assetName: 'Ward 12 Distribution Transformer TX-4',
      utilityType: 'ELECTRICITY',
      assetType: 'DISTRIBUTION_TRANSFORMER',
      cityId: 'city-vja',
      status: 'RECOMMENDED',
      failureProbability: {
        assetId: 'ast-pow-tx-102',
        assetName: 'Ward 12 Distribution Transformer TX-4',
        utilityType: 'ELECTRICITY',
        failureProbabilityPercent: 88.4,
        riskClassification: 'CRITICAL',
        dominantFailureIndicators: [
          'Abnormal core temperature rise (+24°C above baseline)',
          'High thermal overload during peak cooling hours',
          'Oil dielectric degradation indicator',
        ],
        confidenceScore: 94.2,
      },
      remainingLife: {
        assetId: 'ast-pow-tx-102',
        assetName: 'Ward 12 Distribution Transformer TX-4',
        estimatedRemainingLifeDays: 8,
        expectedFailureWindow: '5 - 10 Days',
        confidenceScore: 91.0,
      },
      outageImpact: {
        predictionId: 'pred-utl-101',
        sourceAssetId: 'ast-pow-tx-102',
        sourceAssetName: 'Ward 12 Distribution Transformer TX-4',
        utilityType: 'ELECTRICITY',
        downstreamAffectedAssets: ['ast-pow-feeder-12A', 'ast-pow-feeder-12B'],
        affectedZones: ['zone-w12'],
        estimatedOutageDurationHours: 6.5,
        estimatedServiceImpactPopulation: 14200,
        cascadingRiskLevel: 'CRITICAL',
        explanation: 'Transformer winding insulation burnout will cause localized grid trip across Ward 12 residential feeders.',
      },
      recommendation: {
        recommendationId: 'maint-rec-101',
        assetId: 'ast-pow-tx-102',
        assetName: 'Ward 12 Distribution Transformer TX-4',
        utilityType: 'ELECTRICITY',
        actionTitle: 'Schedule Emergency Transformer Coolant Flush & Load Shedding Reroute',
        actionDescription: 'Perform oil dielectric testing, clean radiator fins, and transfer 30% load to adjacent TX-5 transformer.',
        predictedRiskLevel: 'CRITICAL',
        urgency: 'IMMEDIATE',
        estimatedMaintenanceWindowDays: 2,
        requiresHumanApproval: true,
        approvalStatus: 'PENDING',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async listPredictionsByCityId(cityId: string): Promise<UtilityPredictionEntity[]> {
    return this.predictions.filter((p) => p.cityId === cityId);
  }

  async findPredictionById(predictionId: string): Promise<UtilityPredictionEntity | null> {
    return this.predictions.find((p) => p.predictionId === predictionId) || null;
  }

  async findPredictionByAssetId(assetId: string): Promise<UtilityPredictionEntity | null> {
    return this.predictions.find((p) => p.assetId === assetId) || null;
  }

  async savePrediction(prediction: UtilityPredictionEntity): Promise<UtilityPredictionEntity> {
    const idx = this.predictions.findIndex((p) => p.predictionId === prediction.predictionId);
    if (idx >= 0) this.predictions[idx] = prediction;
    else this.predictions.push(prediction);
    return prediction;
  }
}

export const memoryUtilityPredictionRepository = new MemoryUtilityPredictionRepository();
