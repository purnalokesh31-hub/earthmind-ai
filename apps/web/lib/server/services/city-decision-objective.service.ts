// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Decision Objective & Normalization Service
// Configurable Multi-Objective Weighting & Metric Normalization Engine
// ──────────────────────────────────────────────────────────────

export type OptimizationStrategy =
  | 'MINIMIZE_RISK'
  | 'MINIMIZE_COST'
  | 'MINIMIZE_DOWNTIME'
  | 'MINIMIZE_POPULATION_IMPACT'
  | 'MAXIMIZE_SERVICE_RESTORATION'
  | 'MAXIMIZE_RESILIENCE'
  | 'BALANCED';

export interface ObjectiveWeightConfig {
  riskReductionWeight: number; // 0.0 to 1.0
  costWeight: number;
  downtimeWeight: number;
  populationImpactWeight: number;
  resilienceWeight: number;
  serviceRestorationWeight: number;
}

export interface RawCandidateMetrics {
  optionId: string;
  title: string;
  riskReduction: number; // pts (higher = better)
  costUsd: number; // USD (lower = better)
  downtimeHours: number; // hours (lower = better)
  populationImpact: number; // exposed citizens (lower = better)
  serviceRestorationPercent: number; // % (higher = better)
  resilienceImprovementPercent: number; // % (higher = better)
  resourceUtilizationCount: number;
  confidencePercent: number;
  feasibilityScore: number; // 0-100 (higher = better)
}

export interface NormalizedCandidateMetrics {
  optionId: string;
  normRiskReduction: number; // 0.0 to 1.0
  normCostEfficiency: number; // 0.0 to 1.0
  normDowntimeMinimization: number; // 0.0 to 1.0
  normPopulationSafety: number; // 0.0 to 1.0
  normServiceRestoration: number; // 0.0 to 1.0
  normResilienceImprovement: number; // 0.0 to 1.0
}

export class CityDecisionObjectiveService {
  /**
   * Returns pre-configured objective weight presets for different strategies.
   */
  getWeightsForStrategy(strategy: OptimizationStrategy): ObjectiveWeightConfig {
    switch (strategy) {
      case 'MINIMIZE_RISK':
        return { riskReductionWeight: 0.50, costWeight: 0.10, downtimeWeight: 0.10, populationImpactWeight: 0.15, resilienceWeight: 0.10, serviceRestorationWeight: 0.05 };
      case 'MINIMIZE_COST':
        return { riskReductionWeight: 0.20, costWeight: 0.45, downtimeWeight: 0.15, populationImpactWeight: 0.10, resilienceWeight: 0.05, serviceRestorationWeight: 0.05 };
      case 'MINIMIZE_DOWNTIME':
        return { riskReductionWeight: 0.20, costWeight: 0.10, downtimeWeight: 0.45, populationImpactWeight: 0.10, resilienceWeight: 0.05, serviceRestorationWeight: 0.10 };
      case 'MINIMIZE_POPULATION_IMPACT':
        return { riskReductionWeight: 0.25, costWeight: 0.05, downtimeWeight: 0.10, populationImpactWeight: 0.45, resilienceWeight: 0.05, serviceRestorationWeight: 0.10 };
      case 'MAXIMIZE_SERVICE_RESTORATION':
        return { riskReductionWeight: 0.20, costWeight: 0.05, downtimeWeight: 0.15, populationImpactWeight: 0.10, resilienceWeight: 0.10, serviceRestorationWeight: 0.40 };
      case 'MAXIMIZE_RESILIENCE':
        return { riskReductionWeight: 0.25, costWeight: 0.05, downtimeWeight: 0.10, populationImpactWeight: 0.10, resilienceWeight: 0.40, serviceRestorationWeight: 0.10 };
      case 'BALANCED':
      default:
        return { riskReductionWeight: 0.25, costWeight: 0.15, downtimeWeight: 0.15, populationImpactWeight: 0.20, resilienceWeight: 0.15, serviceRestorationWeight: 0.10 };
    }
  }

  /**
   * Normalizes raw metrics into 0.0 - 1.0 range across candidates using Min-Max scaling.
   */
  normalizeMetrics(candidates: RawCandidateMetrics[]): NormalizedCandidateMetrics[] {
    if (candidates.length === 0) return [];

    const maxRisk = Math.max(...candidates.map((c) => c.riskReduction), 1);
    const minCost = Math.min(...candidates.map((c) => c.costUsd));
    const maxCost = Math.max(...candidates.map((c) => c.costUsd), minCost + 1);
    const minDowntime = Math.min(...candidates.map((c) => c.downtimeHours));
    const maxDowntime = Math.max(...candidates.map((c) => c.downtimeHours), minDowntime + 0.1);
    const minPop = Math.min(...candidates.map((c) => c.populationImpact));
    const maxPop = Math.max(...candidates.map((c) => c.populationImpact), minPop + 1);

    return candidates.map((c) => {
      // Risk reduction: higher is better
      const normRiskReduction = c.riskReduction / maxRisk;

      // Cost efficiency: lower cost is better -> (maxCost - cost) / (maxCost - minCost)
      const normCostEfficiency = (maxCost - c.costUsd) / (maxCost - minCost || 1);

      // Downtime minimization: lower downtime is better
      const normDowntimeMinimization = (maxDowntime - c.downtimeHours) / (maxDowntime - minDowntime || 1);

      // Population safety: lower exposed population is better
      const normPopulationSafety = (maxPop - c.populationImpact) / (maxPop - minPop || 1);

      // Service restoration: higher is better
      const normServiceRestoration = c.serviceRestorationPercent / 100.0;

      // Resilience improvement: higher is better
      const normResilienceImprovement = c.resilienceImprovementPercent / 100.0;

      return {
        optionId: c.optionId,
        normRiskReduction: Math.max(0, Math.min(1, normRiskReduction)),
        normCostEfficiency: Math.max(0, Math.min(1, normCostEfficiency)),
        normDowntimeMinimization: Math.max(0, Math.min(1, normDowntimeMinimization)),
        normPopulationSafety: Math.max(0, Math.min(1, normPopulationSafety)),
        normServiceRestoration: Math.max(0, Math.min(1, normServiceRestoration)),
        normResilienceImprovement: Math.max(0, Math.min(1, normResilienceImprovement)),
      };
    });
  }

  /**
   * Calculates weighted multi-objective score (0-100) for a candidate.
   */
  computeWeightedScore(
    norm: NormalizedCandidateMetrics,
    weights: ObjectiveWeightConfig
  ): number {
    const rawScore =
      norm.normRiskReduction * weights.riskReductionWeight +
      norm.normCostEfficiency * weights.costWeight +
      norm.normDowntimeMinimization * weights.downtimeWeight +
      norm.normPopulationSafety * weights.populationImpactWeight +
      norm.normResilienceImprovement * weights.resilienceWeight +
      norm.normServiceRestoration * weights.serviceRestorationWeight;

    return Math.round(rawScore * 1000) / 10; // Convert 0-1 to 0-100 with 1 decimal place
  }
}

export const cityDecisionObjectiveService = new CityDecisionObjectiveService();
