// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// City Command Prioritized Human Review Queue Service
// ──────────────────────────────────────────────────────────────

import { CityCommandQueueItemDto } from '../domain/digital-twin/city-command.domain';
import { memoryCityCommandRepository } from '../repositories/city-command.repository';
import { logger } from '../logger';

export class CityCommandQueueService {
  private repo = memoryCityCommandRepository;

  public getPrioritizedQueue(cityId?: string): CityCommandQueueItemDto[] {
    const activeCases = this.repo
      .listCases(cityId)
      .filter((c) => ['PENDING_REVIEW', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 'READY_FOR_DECISION'].includes(c.status));

    const now = Date.now();
    const queueItems: CityCommandQueueItemDto[] = activeCases.map((c) => {
      const createdTime = new Date(c.createdAt).getTime();
      const ageMinutes = Math.floor((now - createdTime) / 60000);

      const priorityFactors: string[] = [];
      let priorityScore = 0;

      // 1. Risk Tier Weighting
      if (c.riskTier === 'CRITICAL') {
        priorityScore += 50;
        priorityFactors.push('CRITICAL risk tier (+50)');
      } else if (c.riskTier === 'HIGH') {
        priorityScore += 35;
        priorityFactors.push('HIGH risk tier (+35)');
      } else if (c.riskTier === 'ELEVATED') {
        priorityScore += 20;
        priorityFactors.push('ELEVATED risk tier (+20)');
      } else {
        priorityScore += 10;
        priorityFactors.push('Standard risk tier (+10)');
      }

      // 2. Population & Financial Impact
      if (c.populationImpact > 20000) {
        priorityScore += 20;
        priorityFactors.push(`High population exposure (${c.populationImpact.toLocaleString()} residents) (+20)`);
      }
      if (c.financialImpactUsd > 50000) {
        priorityScore += 15;
        priorityFactors.push(`High financial impact ($${c.financialImpactUsd.toLocaleString()}) (+15)`);
      }

      // 3. Confidence Uncertainty
      if (c.confidenceLevel === 'LOW_CONFIDENCE' || c.confidenceLevel === 'INSUFFICIENT_CONFIDENCE') {
        priorityScore += 15;
        priorityFactors.push('Uncertain intelligence confidence requiring manual verification (+15)');
      }

      // 4. Queue Age Boost
      if (ageMinutes > 30) {
        priorityScore += 10;
        priorityFactors.push(`Pending queue age (${ageMinutes}m) (+10)`);
      }

      return {
        queueId: `queue-${c.caseId}`,
        caseId: c.caseId,
        title: c.title,
        cityId: c.cityId,
        queuePriority: 0, // Assigned after sorting
        priorityScore,
        priorityFactors,
        riskTier: c.riskTier,
        confidenceLevel: c.confidenceLevel,
        requiredAuthorizationLevel: c.requiredAuthorizationLevel,
        ageMinutes,
        escalationLevel: c.requiredAuthorizationLevel,
        status: c.status,
        requiresHumanApproval: true,
      };
    });

    // Sort by priorityScore descending
    queueItems.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign rank 1..N
    queueItems.forEach((item, idx) => {
      item.queuePriority = idx + 1;
    });

    logger.info(`[CityCommandQueueService] Generated prioritized queue with ${queueItems.length} active items.`);
    return queueItems;
  }
}

export const cityCommandQueueService = new CityCommandQueueService();
