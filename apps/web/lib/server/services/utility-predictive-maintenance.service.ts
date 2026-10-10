// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Predictive Maintenance Recommendation Engine
// ──────────────────────────────────────────────────────────────

import { UtilityPredictiveMaintenanceDto } from '../domain/digital-twin/utility-prediction.domain';
import { memoryUtilityPredictionRepository } from '../repositories/utility-prediction.repository';

export class UtilityPredictiveMaintenanceService {
  async getRecommendations(cityId: string): Promise<UtilityPredictiveMaintenanceDto[]> {
    const predictions = await memoryUtilityPredictionRepository.listPredictionsByCityId(cityId);
    return predictions.map((p) => p.recommendation);
  }

  async approveRecommendation(predictionId: string): Promise<UtilityPredictiveMaintenanceDto> {
    const prediction = await memoryUtilityPredictionRepository.findPredictionById(predictionId);
    if (!prediction) throw new Error(`Utility prediction ${predictionId} not found`);

    prediction.recommendation.approvalStatus = 'APPROVED';
    prediction.status = 'APPROVED';
    await memoryUtilityPredictionRepository.savePrediction(prediction);
    return prediction.recommendation;
  }
}

export const utilityPredictiveMaintenanceService = new UtilityPredictiveMaintenanceService();
