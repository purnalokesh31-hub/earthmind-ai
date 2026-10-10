// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 3/6)
// City Response Execution Checklist Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessChecklistDto,
  CityResponseReadinessChecklistItem,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseChecklistService {
  private repo = memoryCityResponseReadinessRepository;

  public generateChecklist(readinessId: string): CityResponseReadinessChecklistDto {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response readiness assessment '${readinessId}' not found.`);
    }

    const items: CityResponseReadinessChecklistItem[] = [
      // PRE_ACTION_CHECKS
      {
        itemId: `chk-pre-1`,
        category: 'PRE_ACTION_CHECKS',
        title: 'Human approval confirmed',
        description: 'Verify explicit operator or commander authorization.',
        isCompleted: entity.status === 'APPROVED' || entity.status === 'HANDOFF_READY',
        requiredForReadiness: true,
      },
      {
        itemId: `chk-pre-2`,
        category: 'PRE_ACTION_CHECKS',
        title: 'Action scope confirmed',
        description: 'Verify targeted sector boundaries and intervention duration limits.',
        isCompleted: true,
        requiredForReadiness: true,
      },
      {
        itemId: `chk-pre-3`,
        category: 'PRE_ACTION_CHECKS',
        title: 'Geographic area confirmed',
        description: 'Confirm spatial coordinates and affected zone boundaries.',
        isCompleted: true,
        requiredForReadiness: true,
      },
      {
        itemId: `chk-pre-4`,
        category: 'PRE_ACTION_CHECKS',
        title: 'Required resources identified',
        description: 'Verify required equipment allocation status.',
        isCompleted: entity.actions.every((a) => a.resources.every((r) => r.availabilityStatus === 'AVAILABLE')),
        requiredForReadiness: true,
      },

      // HANDOFF_CHECKS
      {
        itemId: `chk-hand-1`,
        category: 'HANDOFF_CHECKS',
        title: 'Authorized intervention identified',
        description: 'Ensure intervention ID mapping is validated.',
        isCompleted: !!entity.interventionId,
        requiredForReadiness: true,
      },
      {
        itemId: `chk-hand-2`,
        category: 'HANDOFF_CHECKS',
        title: 'Assigned operational owner identified',
        description: 'Confirm operational owner for handoff receipt.',
        isCompleted: !!entity.handoffPackage?.assignedOperationalOwner,
        requiredForReadiness: true,
      },
      {
        itemId: `chk-hand-3`,
        category: 'HANDOFF_CHECKS',
        title: 'Safety requirements reviewed',
        description: 'Ensure safety protocols and risk factors are acknowledged.',
        isCompleted: true,
        requiredForReadiness: true,
      },

      // POST_ACTION_CHECKS
      {
        itemId: `chk-post-1`,
        category: 'POST_ACTION_CHECKS',
        title: 'Actual completion status recorded',
        description: 'Record human operator completion confirmation.',
        isCompleted: entity.status === 'COMPLETED' || entity.status === 'VALIDATED',
        requiredForReadiness: false,
      },
      {
        itemId: `chk-post-2`,
        category: 'POST_ACTION_CHECKS',
        title: 'Evidence attached',
        description: 'Attach photo/sensor telemetry evidence.',
        isCompleted: !!entity.outcome?.evidenceId,
        requiredForReadiness: false,
      },
    ];

    const completedCount = items.filter((i) => i.isCompleted).length;
    const requiredItems = items.filter((i) => i.requiredForReadiness);
    const isFullySatisfied = requiredItems.every((i) => i.isCompleted);

    const checklist: CityResponseReadinessChecklistDto = {
      readinessId,
      items,
      totalCount: items.length,
      completedCount,
      isFullySatisfied,
      requiresHumanApproval: true,
    };

    entity.checklist = checklist;
    logger.info(`[CityResponseChecklistService] Generated checklist for '${readinessId}': ${completedCount}/${items.length} items satisfied.`);
    return checklist;
  }
}

export const cityResponseChecklistService = new CityResponseChecklistService();
