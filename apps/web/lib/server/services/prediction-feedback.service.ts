// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Prediction Feedback & Accuracy Verification Service
// ──────────────────────────────────────────────────────────────

import { memoryPredictionFeedbackRepository, memoryPredictionRepository } from '../repositories/prediction.repository';
import { PredictionFeedbackEntity } from '../domain/prediction.domain';

export interface SubmitFeedbackRequest {
  predictionId: string;
  actualIncidentsCount: number;
  reviewedBy: string;
  notes?: string;
}

export class PredictionFeedbackService {
  async recordFeedback(req: SubmitFeedbackRequest): Promise<PredictionFeedbackEntity> {
    const prediction = await memoryPredictionRepository.findById(req.predictionId);
    const predictedRisk = prediction?.riskScore || 50;

    // Actual Risk calculation based on verified occurrences
    const actualRisk = Math.min(100, req.actualIncidentsCount * 25);
    const error = Math.abs(predictedRisk - actualRisk);
    const predictionAccuracy = Math.max(0, 100 - error);

    const falsePositive = predictedRisk >= 70 && req.actualIncidentsCount === 0;
    const falseNegative = predictedRisk < 40 && req.actualIncidentsCount >= 2;

    const fb: PredictionFeedbackEntity = {
      id: `fb-${Date.now()}`,
      predictionId: req.predictionId,
      predictedRisk,
      actualIncidentsCount: req.actualIncidentsCount,
      actualRisk,
      predictionAccuracy,
      falsePositive,
      falseNegative,
      reviewedBy: req.reviewedBy,
      notes: req.notes,
      createdAt: new Date(),
    };

    return memoryPredictionFeedbackRepository.save(fb);
  }
}

export const predictionFeedbackService = new PredictionFeedbackService();
