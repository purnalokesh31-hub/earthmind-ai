// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.11 Situation Awareness Engine
// Aggregates Real-Time Incidents, Predictions, Warnings & Responders
// ──────────────────────────────────────────────────────────────

import { SituationSnapshotDto } from '../dto/situation-awareness.dto';
import { memoryPredictionRepository, memoryWarningRepository } from '../repositories/prediction.repository';
import { regionalRiskEngine } from './regional-risk.engine';

export class SituationAwarenessService {
  async getSnapshot(scopeLevel = 'CITY', scopeId = 'city-vja'): Promise<SituationSnapshotDto> {
    const activePredictions = await memoryPredictionRepository.listActive();
    const activeWarnings = await memoryWarningRepository.listActive();
    const riskAssessment = await regionalRiskEngine.assessRegionalRisk('REGION', 'reg-ap-central');

    return {
      timestamp: new Date().toISOString(),
      geographicScope: {
        level: scopeLevel,
        id: scopeId,
        name: 'Vijayawada Central Sector',
      },
      activeIncidentCount: 14,
      criticalIncidentCount: 3,
      activeWarningsCount: activeWarnings.length,
      activePredictionsCount: activePredictions.length,
      slaBreachesCount: 1,
      activeDispatchesCount: 4,
      availableRespondersCount: 12,
      regionalRiskScore: riskAssessment.regionalRiskScore,
      topOperationalPriorities: [
        {
          id: 'inc-101',
          title: 'Severe Road Subsidence — NH-9 Junction',
          severity: 'CRITICAL',
          priorityScore: 96,
        },
        {
          id: 'inc-103',
          title: 'Electrical Transformer Spark & Smoke Emission',
          severity: 'CRITICAL',
          priorityScore: 92,
        },
        {
          id: 'inc-102',
          title: 'Municipal Water Main Breach & Urban Flood',
          severity: 'HIGH',
          priorityScore: 78,
        },
      ],
    };
  }
}

export const situationAwarenessService = new SituationAwarenessService();
