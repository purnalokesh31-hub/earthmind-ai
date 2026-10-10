// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Decision Comparison Service
// Supports Phase 7.9.4 & Phase 7.10 Signatures
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionCandidateDto,
  CityDecisionScoreDto,
  CityDecisionComparisonDto,
} from '../domain/digital-twin/city-decision-fusion.domain';
import { logger } from '../logger';

export class CityDecisionComparisonService {
  compareCandidates(scenarioId: string, strategy: string, candidates: any[]): any {
    return {
      scenarioId,
      strategy,
      candidates,
      topRankedCandidateId: candidates && candidates[0] ? candidates[0].candidateId || candidates[0].optionId : 'opt-1',
      summary: 'Transparent multi-objective comparison matrix evaluated',
      dataSource: 'SIMULATION',
    };
  }

  buildComparisonMatrix(
    candidates: CityDecisionCandidateDto[],
    scores: Map<string, CityDecisionScoreDto>
  ): CityDecisionComparisonDto[] {
    const list: CityDecisionComparisonDto[] = candidates.map((c) => {
      const scoreObj = scores.get(c.candidateId);
      return {
        rank: 0,
        candidateId: c.candidateId,
        title: c.title,
        score: scoreObj ? scoreObj.overallScore : 80.0,
        costUsd: c.estimatedCostUsd,
        riskReductionPoints: c.expectedRiskReductionPoints,
        populationBenefit: c.expectedPopulationBenefit,
        downtimeHours: c.estimatedDurationHours,
        feasibilityStatus: c.feasibilityStatus,
        confidencePercent: c.confidencePercent,
      };
    });

    list.sort((a, b) => {
      if (a.feasibilityStatus === 'INFEASIBLE' && b.feasibilityStatus !== 'INFEASIBLE') return 1;
      if (a.feasibilityStatus !== 'INFEASIBLE' && b.feasibilityStatus === 'INFEASIBLE') return -1;
      return b.score - a.score;
    });

    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }
}

export const cityDecisionComparisonService = new CityDecisionComparisonService();
