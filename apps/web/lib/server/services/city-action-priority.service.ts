// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Action Priority Engine
// ──────────────────────────────────────────────────────────────

import { CityDecisionOptionDto, CityDecisionPriorityDto, PriorityLevel } from '../domain/digital-twin/city-decision.domain';
import { logger } from '../logger';

export class CityActionPriorityService {
  classifyPriority(score: number): PriorityLevel {
    if (score >= 90) return 'CRITICAL';
    if (score >= 80) return 'HIGH';
    if (score >= 70) return 'ELEVATED';
    if (score >= 50) return 'NORMAL';
    return 'LOW';
  }

  rankOptions(options: CityDecisionOptionDto[]): { option: CityDecisionOptionDto; priority: CityDecisionPriorityDto }[] {
    const ranked = options
      .map((option) => {
        const priorityClassification = this.classifyPriority(option.priorityScore);
        const priority: CityDecisionPriorityDto = {
          priorityScore: option.priorityScore,
          priorityClassification,
          timeToImpactHours: option.implementationTime,
          populationExposure: option.estimatedPopulationBenefit,
          criticalInfrastructureCount: option.affectedDomains.length,
          serviceDependencyScore: Math.round(option.estimatedRiskReduction * 2.5),
          cascadePotentialScore: Math.round(option.confidence * 0.9),
          reasoning: `Ranked ${priorityClassification} based on ${option.estimatedRiskReduction} pts risk reduction, ${option.estimatedPopulationBenefit.toLocaleString()} population benefit, and ${option.confidence}% confidence.`,
        };
        return { option, priority };
      })
      .sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

    logger.info(`[CityActionPriorityService] Ranked ${ranked.length} decision options by priority score`);
    return ranked;
  }
}

export const cityActionPriorityService = new CityActionPriorityService();
