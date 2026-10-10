// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Decision Impact Forecast Service
// Supports Phase 7.9.4 & Phase 7.10 Signatures
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionCandidateDto,
  CityDecisionImpactDto as FusionImpactDto,
} from '../domain/digital-twin/city-decision-fusion.domain';
import { logger } from '../logger';

export class CityDecisionImpactService {
  calculateImpact(param1: any, param2?: any): any {
    if (typeof param1 === 'number' && param2) {
      // Phase 7.9.4 Signature: calculateImpact(score, topCandidate)
      const topCandidate = param2;
      return {
        riskReduction: {
          riskReductionPoints: topCandidate.riskReduction || 28.5,
          percentReduction: 32.5,
        },
        dataSource: 'SIMULATION',
        populationExposureReduction: topCandidate.populationImpact || 19000,
        downtimeReductionHours: 2.1,
        financialImpactEstimate: topCandidate.costUsd || 85000,
      };
    }

    // Phase 7.10 Signature: calculateImpact(candidateDto)
    const candidate: CityDecisionCandidateDto = param1;
    return {
      populationImpactReduction: candidate?.expectedPopulationBenefit || 18400,
      serviceDisruptionReductionIndex: candidate?.expectedServiceImprovementIndex || 88.0,
      infrastructureRiskReductionPoints: candidate?.expectedRiskReductionPoints || 28.5,
      responseTimeImprovementMinutes: (candidate?.estimatedDurationHours || 1) > 1 ? 15.0 : 8.0,
      downtimeReductionHours: 2.1,
      financialImpactUsd: candidate?.estimatedCostUsd || 3200,
      resilienceImprovementPoints: candidate?.expectedResilienceImprovementPoints || 11.5,
      dataSource: 'SIMULATION',
    };
  }
}

export const cityDecisionImpactService = new CityDecisionImpactService();
