// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Resilience Action Sequencing Service
// Action Sequence & Parallel Execution Group Generator
// ──────────────────────────────────────────────────────────────

import {
  ResilienceActionCandidateDto,
  ResilienceActionDependencyDto,
  ResilienceActionStepDto,
  ResilienceActionSequenceDto,
  ResilienceActionParallelGroupDto,
} from '../domain/digital-twin/resilience-action-planning.domain';
import { logger } from '../logger';

export class ResilienceActionSequencingService {
  generateSequence(
    candidates: ResilienceActionCandidateDto[],
    dependencies: ResilienceActionDependencyDto[]
  ): ResilienceActionSequenceDto {
    const steps: ResilienceActionStepDto[] = [];
    const idMap = new Map(candidates.map((c) => [c.actionId, c]));

    // Step 1: Initial Hazard Mitigation & Isolation
    if (idMap.has('act-util-iso-1')) {
      const c = idMap.get('act-util-iso-1')!;
      steps.push({
        stepNumber: 1,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'SEQUENTIAL',
        estimatedStartHours: 0.0,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: [],
        requiredResources: ['Utility High-Voltage Crew (2)'],
        expectedOutcome: 'Substation 4B isolated from flood submergence short circuits.',
        riskLevel: 'HIGH',
      });
    }

    if (idMap.has('act-pub-alrt-1')) {
      const c = idMap.get('act-pub-alrt-1')!;
      steps.push({
        stepNumber: 2,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'PARALLEL',
        estimatedStartHours: 0.0,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: [],
        requiredResources: ['Public Safety Broadcast System'],
        expectedOutcome: 'Citizens notified to avoid Benz Circle underpass.',
        riskLevel: 'LOW',
      });
    }

    // Step 2: Generator Positioning & Traffic Diverting
    if (idMap.has('act-gen-dep-1')) {
      const c = idMap.get('act-gen-dep-1')!;
      steps.push({
        stepNumber: 3,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'PARALLEL',
        estimatedStartHours: 0.5,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: ['act-util-iso-1'],
        requiredResources: ['Mobile Diesel Generator Unit', 'Utility Transport Crew (3)'],
        expectedOutcome: 'Auxiliary power restored to Ward 12 storm pumps.',
        riskLevel: 'MEDIUM',
      });
    }

    if (idMap.has('act-rd-cls-1')) {
      const c = idMap.get('act-rd-cls-1')!;
      steps.push({
        stepNumber: 4,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'PARALLEL',
        estimatedStartHours: 0.5,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: [],
        requiredResources: ['Traffic Police Crew (2)'],
        expectedOutcome: 'Submerged lanes closed to civilian traffic.',
        riskLevel: 'LOW',
      });
    }

    // Step 3: Transit Rerouting & Emergency Ambulance Staging
    if (idMap.has('act-trns-rerout-1')) {
      const c = idMap.get('act-trns-rerout-1')!;
      steps.push({
        stepNumber: 5,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'SEQUENTIAL',
        estimatedStartHours: 1.0,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: ['act-rd-cls-1'],
        requiredResources: ['Transit Operations Control'],
        expectedOutcome: 'BRT Line 3 buses rerouted to High-Road Corridor.',
        riskLevel: 'LOW',
      });
    }

    if (idMap.has('act-emg-stg-1')) {
      const c = idMap.get('act-emg-stg-1')!;
      steps.push({
        stepNumber: 6,
        actionId: c.actionId,
        domain: c.domain,
        category: c.category,
        title: c.title,
        executionMode: 'PARALLEL',
        estimatedStartHours: 1.0,
        estimatedDurationHours: c.estimatedDurationHours,
        dependencies: ['act-rd-cls-1'],
        requiredResources: ['ALS Ambulances (6)', 'Medical Responders (12)'],
        expectedOutcome: 'Ambulance response SLA preserved under 12 minutes.',
        riskLevel: 'LOW',
      });
    }

    const parallelGroups: ResilienceActionParallelGroupDto[] = [
      {
        groupId: 'grp-1',
        groupName: 'Initial Hazard Isolation & Broadcast',
        stepNumbers: [1, 2],
        actionsInvolved: ['act-util-iso-1', 'act-pub-alrt-1'],
      },
      {
        groupId: 'grp-2',
        groupName: 'Auxiliary Power & Traffic Diversion',
        stepNumbers: [3, 4],
        actionsInvolved: ['act-gen-dep-1', 'act-rd-cls-1'],
      },
      {
        groupId: 'grp-3',
        groupName: 'Transit Rerouting & Ambulance Staging',
        stepNumbers: [5, 6],
        actionsInvolved: ['act-trns-rerout-1', 'act-emg-stg-1'],
      },
    ];

    const totalDurationHours = steps.reduce((max, s) => Math.max(max, s.estimatedStartHours + s.estimatedDurationHours), 0);

    logger.info(`[ResilienceActionSequencingService] Generated sequence with ${steps.length} steps across ${parallelGroups.length} parallel groups (${totalDurationHours}h duration)`);

    return {
      sequenceId: `seq-${Date.now()}`,
      totalStepsCount: steps.length,
      totalDurationHours,
      steps,
      parallelGroups,
    };
  }
}

export const resilienceActionSequencingService = new ResilienceActionSequencingService();
