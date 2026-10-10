// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Utility Prediction Service
// ──────────────────────────────────────────────────────────────

import { UtilityPredictionEntity } from '../domain/digital-twin/utility-prediction.domain';
import { memoryUtilityPredictionRepository } from '../repositories/utility-prediction.repository';

export class MasterUtilityPredictionService {
  async getPredictionsByCity(cityId: string): Promise<UtilityPredictionEntity[]> {
    return memoryUtilityPredictionRepository.listPredictionsByCityId(cityId);
  }

  async getPredictionById(predictionId: string): Promise<UtilityPredictionEntity | null> {
    return memoryUtilityPredictionRepository.findPredictionById(predictionId);
  }
}

export const masterUtilityPredictionService = new MasterUtilityPredictionService();
