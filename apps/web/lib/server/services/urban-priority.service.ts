// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 Urban Priority Service
// ──────────────────────────────────────────────────────────────

import {
  CrossDomainCorrelationDto,
  UrbanPriorityQueueDto,
  UrbanPriorityItemDto,
} from '../domain/digital-twin/cross-domain.domain';

export class UrbanPriorityService {
  calculatePriorityQueue(cityId: string, correlations: CrossDomainCorrelationDto[]): UrbanPriorityQueueDto {
    if (!correlations || correlations.length === 0) {
      return {
        cityId,
        updatedAt: new Date().toISOString(),
        totalActiveItems: 0,
        items: [],
      };
    }

    const items: UrbanPriorityItemDto[] = correlations.map((corr, idx) => {
      const isCritical = corr.severity === 'CRITICAL';
      const isHigh = corr.severity === 'HIGH';

      const priorityScore = Math.min(
        100,
        (isCritical ? 90 : isHigh ? 75 : 55) + Math.min(10, corr.affectedDomains.length * 3)
      );

      return {
        priorityRank: idx + 1,
        correlationId: corr.correlationId,
        primaryDomain: corr.affectedDomains[0] || 'CLIMATE',
        title: `[PRIORITY ${idx + 1}] ${corr.explanation}`,
        priorityScore,
        severity: corr.severity,
        affectedPopulation: corr.affectedPopulation,
        serviceCriticalityScore: isCritical ? 95 : 82,
        cascadeRiskScore: isCritical ? 88.5 : 74.0,
        timeSensitivityMinutes: isCritical ? 15 : 45,
        recommendedAdvisoryAction: `Deploy Cross-Domain Mitigation Plan for ${corr.affectedDomains.join(' & ')} corridors.`,
        requiresHumanApproval: true, // Always true
      };
    });

    items.sort((a, b) => b.priorityScore - a.priorityScore);
    items.forEach((item, index) => {
      item.priorityRank = index + 1;
    });

    return {
      cityId,
      updatedAt: new Date().toISOString(),
      totalActiveItems: items.length,
      items,
    };
  }
}

export const urbanPriorityService = new UrbanPriorityService();
