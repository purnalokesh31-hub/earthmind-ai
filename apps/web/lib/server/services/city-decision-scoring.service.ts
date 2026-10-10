// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Multi-Objective Decision Scoring Engine
// Evaluates candidate intervention options against competing municipal objectives
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionInputDto,
  CityInterventionOptionDto,
  CityDecisionScoreDto,
} from '../domain/digital-twin/city-decision-optimization.domain';

export class CityDecisionScoringService {
  /**
   * Evaluates and scores intervention options against multi-objective weights and constraints.
   * Returns ranked array of CityDecisionScoreDto.
   */
  async scoreAndRankOptions(
    options: CityInterventionOptionDto[],
    input: CityDecisionInputDto
  ): Promise<CityDecisionScoreDto[]> {
    const scoredList: CityDecisionScoreDto[] = options.map((opt) => {
      // 1. Risk Reduction Sub-score (0-40 pts)
      const riskReductionScore = Math.min(40, (opt.expectedRiskReduction / 40.0) * 40.0);

      // 2. Population Safety Sub-score (0-30 pts)
      const populationSafetyScore = Math.min(30, (opt.populationImpact / 35000.0) * 30.0);

      // 3. Cost Efficiency Sub-score (0-15 pts, lower cost = higher score)
      const costEfficiencyScore = Math.max(0, 15.0 - (opt.estimatedCostUsd / 300000.0) * 15.0);

      // 4. Downtime Minimization Sub-score (0-15 pts, lower downtime = higher score)
      const downtimeMinimizationScore = Math.max(0, 15.0 - (opt.estimatedDowntimeHours / 8.0) * 15.0);

      // 5. Operational Feasibility Score (0-20 pts)
      const operationalFeasibilityScore = (opt.operationalFeasibilityScore / 100.0) * 20.0;

      // 6. Constraint Penalty (-15 pts for each hard constraint violation)
      const constraintCompliancePenalty = opt.constraintsViolated.length * 15.0;

      // Aggregated Raw Score (0 - 100)
      const rawScore =
        riskReductionScore * 0.35 +
        populationSafetyScore * 0.25 +
        costEfficiencyScore +
        downtimeMinimizationScore +
        operationalFeasibilityScore -
        constraintCompliancePenalty;

      const finalScore = Math.max(0.0, Math.min(100.0, Math.round(rawScore * 10) / 10));

      return {
        optionId: opt.optionId,
        optionTitle: opt.title,
        finalScore,
        rank: 0, // Assigned after sorting
        breakdown: {
          riskReductionScore: Math.round(riskReductionScore * 10) / 10,
          populationSafetyScore: Math.round(populationSafetyScore * 10) / 10,
          costEfficiencyScore: Math.round(costEfficiencyScore * 10) / 10,
          downtimeMinimizationScore: Math.round(downtimeMinimizationScore * 10) / 10,
          operationalFeasibilityScore: Math.round(operationalFeasibilityScore * 10) / 10,
          constraintCompliancePenalty,
          finalAggregatedScore: finalScore,
        },
      };
    });

    // Sort descending by finalScore
    scoredList.sort((a, b) => b.finalScore - a.finalScore);

    // Assign rank 1..N
    scoredList.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    // Update options with calculated decision scores
    options.forEach((opt) => {
      const match = scoredList.find((s) => s.optionId === opt.optionId);
      if (match) {
        opt.decisionScore = match.finalScore;
      }
    });

    return scoredList;
  }
}

export const cityDecisionScoringService = new CityDecisionScoringService();
