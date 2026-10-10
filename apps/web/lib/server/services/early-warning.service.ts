// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Early Warning & Threshold Notification Service
// ──────────────────────────────────────────────────────────────

import { memoryWarningRepository, memoryPredictionRepository } from '../repositories/prediction.repository';
import { EarlyWarningEntity, WarningLevel, PredictionEntity } from '../domain/prediction.domain';

export class EarlyWarningService {
  async evaluateAndCreateWarning(prediction: PredictionEntity): Promise<EarlyWarningEntity | null> {
    let warningLevel: WarningLevel = 'INFO';
    if (prediction.riskScore >= 80) warningLevel = 'CRITICAL';
    else if (prediction.riskScore >= 60) warningLevel = 'WARNING';
    else if (prediction.riskScore >= 40) warningLevel = 'WATCH';

    const warning: EarlyWarningEntity = {
      id: `warn-${Date.now()}`,
      warningCode: `WARN-${warningLevel}-${Date.now().toString().slice(-4)}`,
      predictionId: prediction.id,
      warningLevel,
      title: `${warningLevel} EARLY WARNING: ${prediction.title}`,
      message: `${prediction.type.replace('_', ' ')} predicted for ${prediction.geographicScopeName} within ${prediction.predictionWindow.replace('_', ' ').toLowerCase()}. Confidence: ${prediction.confidenceScore}%. Main factor: ${prediction.contributingFactors[0]?.name || 'Historical patterns'}.`,
      geographicScopeName: prediction.geographicScopeName,
      predictionWindow: prediction.predictionWindow,
      confidenceScore: prediction.confidenceScore,
      recommendedPreventiveActions: prediction.recommendedActions,
      createdAt: new Date(),
    };

    return memoryWarningRepository.save(warning);
  }
}

export const earlyWarningService = new EarlyWarningService();
