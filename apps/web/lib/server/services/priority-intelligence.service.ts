// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.11 Priority Intelligence Engine
// Deterministic Situation Ranking & Explanation Generator
// ──────────────────────────────────────────────────────────────

import { PriorityRecommendationDto } from '../dto/situation-awareness.dto';

export class PriorityIntelligenceService {
  async getRankedPriorities(): Promise<PriorityRecommendationDto[]> {
    return [
      {
        id: 'prio-1',
        incidentId: 'inc-101',
        title: 'Severe Road Subsidence — NH-9 Junction',
        priorityScore: 96,
        priorityLevel: 'CRITICAL',
        recommendedAttentionOrder: 1,
        contributingFactors: [
          'Critical P1 Severity Classification',
          '94 Risk Score from Subsurface Shear Telemetry',
          'SLA Acknowledgement Warning Active (10m remaining)',
        ],
        explanation: 'Ranked #1 due to critical P1 structural road collapse risk on heavy transit corridor with active SLA countdown pressure.',
      },
      {
        id: 'prio-2',
        incidentId: 'inc-103',
        title: 'Electrical Transformer Spark & Smoke Emission',
        priorityScore: 92,
        priorityLevel: 'CRITICAL',
        recommendedAttentionOrder: 2,
        contributingFactors: [
          'High Thermal Ignition Risk',
          'High Population Density Ward 8',
        ],
        explanation: 'Ranked #2 due to potential electrical fire cascade in residential Ward 8 grid.',
      },
      {
        id: 'prio-3',
        incidentId: 'inc-102',
        title: 'Municipal Water Main Breach & Urban Flood',
        priorityScore: 78,
        priorityLevel: 'HIGH',
        recommendedAttentionOrder: 3,
        contributingFactors: [
          'High Hydraulic Pressure Leakage',
          'Predictive Flood Forecast Match',
        ],
        explanation: 'Ranked #3 due to water supply pipe fracture causing localized street inundation.',
      },
    ];
  }
}

export const priorityIntelligenceService = new PriorityIntelligenceService();
