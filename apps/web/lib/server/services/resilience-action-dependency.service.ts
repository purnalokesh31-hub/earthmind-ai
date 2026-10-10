// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Resilience Action Dependency Service
// Directed Action Graph Builder & Circular Dependency Validator
// ──────────────────────────────────────────────────────────────

import {
  ResilienceActionCandidateDto,
  ResilienceActionDependencyDto,
} from '../domain/digital-twin/resilience-action-planning.domain';
import { logger } from '../logger';

export class ResilienceActionDependencyService {
  buildActionDependencies(candidates: ResilienceActionCandidateDto[]): ResilienceActionDependencyDto[] {
    const dependencies: ResilienceActionDependencyDto[] = [];
    const idMap = new Map(candidates.map((c) => [c.actionId, c]));

    // Rule A: UTILITY_ISOLATION must precede GENERATOR_DEPLOYMENT
    if (idMap.has('act-util-iso-1') && idMap.has('act-gen-dep-1')) {
      dependencies.push({
        dependencyId: 'act-dep-1',
        prerequisiteActionId: 'act-util-iso-1',
        successorActionId: 'act-gen-dep-1',
        relationType: 'PREREQUISITE',
        rationale: 'Substation sub-bus isolation must occur before safely connecting mobile generators.',
      });
    }

    // Rule B: ROAD_CLOSURE must precede TRANSIT_REROUTING
    if (idMap.has('act-rd-cls-1') && idMap.has('act-trns-rerout-1')) {
      dependencies.push({
        dependencyId: 'act-dep-2',
        prerequisiteActionId: 'act-rd-cls-1',
        successorActionId: 'act-trns-rerout-1',
        relationType: 'PREREQUISITE',
        rationale: 'Road closure barricades must be established before executing public transit rerouting.',
      });
    }

    // Rule C: ROAD_CLOSURE must precede EMERGENCY_RESOURCE_STAGING
    if (idMap.has('act-rd-cls-1') && idMap.has('act-emg-stg-1')) {
      dependencies.push({
        dependencyId: 'act-dep-3',
        prerequisiteActionId: 'act-rd-cls-1',
        successorActionId: 'act-emg-stg-1',
        relationType: 'PREREQUISITE',
        rationale: 'Clearing arterial road bottlenecks ensures ambulances reach high-ground staging.',
      });
    }

    // Rule D: FLOOD_RESPONSE de-watering happens in parallel with GENERATOR_DEPLOYMENT
    if (idMap.has('act-fld-rsp-1') && idMap.has('act-gen-dep-1')) {
      dependencies.push({
        dependencyId: 'act-dep-4',
        prerequisiteActionId: 'act-fld-rsp-1',
        successorActionId: 'act-gen-dep-1',
        relationType: 'PARALLEL_OK',
        rationale: 'De-watering mobilization can occur simultaneously with generator positioning.',
      });
    }

    logger.info(`[ResilienceActionDependencyService] Built ${dependencies.length} action dependency relations`);
    return dependencies;
  }

  detectCircularDependencies(dependencies: ResilienceActionDependencyDto[]): boolean {
    const adj = new Map<string, string[]>();

    for (const d of dependencies) {
      if (d.relationType === 'PREREQUISITE' || d.relationType === 'BLOCKING') {
        const list = adj.get(d.prerequisiteActionId) || [];
        list.push(d.successorActionId);
        adj.set(d.prerequisiteActionId, list);
      }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adj.get(node) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          if (dfs(n)) return true;
        } else if (recStack.has(n)) {
          return true; // Cycle found!
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of Array.from(adj.keys())) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }

    return false;
  }
}

export const resilienceActionDependencyService = new ResilienceActionDependencyService();
