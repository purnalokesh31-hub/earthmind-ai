// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Resilience Action Conflict Service
// Cross-Domain Action Conflict & Constraint Evaluator
// ──────────────────────────────────────────────────────────────

import {
  ResilienceActionCandidateDto,
  ResilienceActionDependencyDto,
  ResilienceActionConflictDto,
} from '../domain/digital-twin/resilience-action-planning.domain';
import { logger } from '../logger';

export class ResilienceActionConflictService {
  detectConflicts(
    candidates: ResilienceActionCandidateDto[],
    dependencies: ResilienceActionDependencyDto[]
  ): ResilienceActionConflictDto[] {
    const conflicts: ResilienceActionConflictDto[] = [];
    const idMap = new Map(candidates.map((c) => [c.actionId, c]));

    // Check 1: Geographic & Road Access Conflict
    const roadClosure = idMap.get('act-rd-cls-1');
    const generatorDep = idMap.get('act-gen-dep-1');
    if (roadClosure && generatorDep) {
      conflicts.push({
        conflictId: 'cnf-1',
        conflictType: 'OPERATIONAL',
        severity: 'MEDIUM',
        actionsInvolved: [roadClosure.actionId, generatorDep.actionId],
        reason: 'Road closure on Benz Circle Eastbound may impede heavy generator transport vehicle routing.',
        resolutionSuggestion: 'Schedule generator transport arrival 15 minutes prior to establishing physical barricades.',
      });
    }

    // Check 2: Resource Demand Exceeding Crew Count
    const totalCrewsDemanded = candidates.reduce((acc, c) => acc + c.requiredResourcesCount, 0);
    if (totalCrewsDemanded > 15) {
      conflicts.push({
        conflictId: 'cnf-2',
        conflictType: 'RESOURCE',
        severity: 'HIGH',
        actionsInvolved: candidates.map((c) => c.actionId),
        reason: `Total candidate crew requirement (${totalCrewsDemanded}) exceeds available duty shift resources (15).`,
        resolutionSuggestion: 'Stagger crew deployment sequentially across Step 1 and Step 2 execution phases.',
      });
    }

    logger.info(`[ResilienceActionConflictService] Detected ${conflicts.length} action conflicts`);
    return conflicts;
  }
}

export const resilienceActionConflictService = new ResilienceActionConflictService();
