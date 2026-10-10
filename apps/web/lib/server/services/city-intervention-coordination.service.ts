// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Multi-Domain Coordination Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionActionDto,
  CityInterventionDependencyDto,
  CityInterventionDependencyType,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export interface MultiDomainCoordinationResult {
  dependencies: CityInterventionDependencyDto[];
  conflictingActions: Array<{
    actionId1: string;
    actionId2: string;
    reason: string;
    suggestedResolution: string;
  }>;
  cascadingEffects: Array<{
    triggerActionId: string;
    affectedDomain: string;
    impactDescription: string;
  }>;
}

export class CityInterventionCoordinationService {
  public analyzeDependencies(actions: CityInterventionActionDto[]): MultiDomainCoordinationResult {
    const dependencies: CityInterventionDependencyDto[] = [];
    const conflictingActions: MultiDomainCoordinationResult['conflictingActions'] = [];
    const cascadingEffects: MultiDomainCoordinationResult['cascadingEffects'] = [];

    const climateActions = actions.filter((a) => a.domain === 'CLIMATE');
    const mobilityActions = actions.filter((a) => a.domain === 'MOBILITY');
    const utilityActions = actions.filter((a) => a.domain === 'UTILITY');
    const emergencyActions = actions.filter((a) => a.domain === 'EMERGENCY');

    // 1. Climate -> Mobility (Road drainage before traffic reroute)
    for (const climateAct of climateActions) {
      for (const mobAct of mobilityActions) {
        dependencies.push({
          dependencyId: `dep-${climateAct.actionId}-${mobAct.actionId}`,
          actionId: mobAct.actionId,
          dependsOnActionId: climateAct.actionId,
          dependencyType: 'TEMPORAL' as CityInterventionDependencyType,
          status: 'RESOLVED',
          explanation: `Drainage action '${climateAct.title}' must initiate before traffic reroute '${mobAct.title}' to clear road surface.`,
        });
      }
    }

    // 2. Mobility -> Utility (Road access corridor before utility crew deployment)
    for (const mobAct of mobilityActions) {
      for (const utilAct of utilityActions) {
        dependencies.push({
          dependencyId: `dep-${mobAct.actionId}-${utilAct.actionId}`,
          actionId: utilAct.actionId,
          dependsOnActionId: mobAct.actionId,
          dependencyType: 'OPERATIONAL' as CityInterventionDependencyType,
          status: 'RESOLVED',
          explanation: `Emergency traffic corridor '${mobAct.title}' ensures unhindered road access for electrical engineering crew in '${utilAct.title}'.`,
        });
      }
    }

    // 3. Mobility -> Emergency (Green corridor before emergency staging)
    for (const mobAct of mobilityActions) {
      for (const emerAct of emergencyActions) {
        dependencies.push({
          dependencyId: `dep-${mobAct.actionId}-${emerAct.actionId}`,
          actionId: emerAct.actionId,
          dependsOnActionId: mobAct.actionId,
          dependencyType: 'SPATIAL' as CityInterventionDependencyType,
          status: 'RESOLVED',
          explanation: `Rerouted traffic corridor '${mobAct.title}' clears spatial access route for pre-positioning '${emerAct.title}'.`,
        });
      }
    }

    // Check potential conflicts
    for (let i = 0; i < actions.length; i++) {
      for (let j = i + 1; j < actions.length; j++) {
        const a1 = actions[i];
        const a2 = actions[j];
        const sharedZone = a1.affectedZones.find((z) => a2.affectedZones.includes(z));
        if (sharedZone && a1.domain !== a2.domain) {
          cascadingEffects.push({
            triggerActionId: a1.actionId,
            affectedDomain: a2.domain,
            impactDescription: `Action '${a1.title}' in ${sharedZone} creates operational dependency for '${a2.title}'.`,
          });
        }
      }
    }

    // Check for circular dependencies
    const hasCycle = this.detectCircularDependencies(dependencies);
    if (hasCycle) {
      conflictingActions.push({
        actionId1: actions[0]?.actionId || 'act-1',
        actionId2: actions[1]?.actionId || 'act-2',
        reason: 'INVALID_DEPENDENCY_GRAPH: Circular dependency loop detected in action sequence.',
        suggestedResolution: 'Break cyclic dependency link to restore valid topological order.',
      });
      dependencies.forEach((d) => (d.status = 'CONFLICT'));
    }

    logger.info(`[CityInterventionCoordinationService] Coordinated ${actions.length} actions: built ${dependencies.length} dependencies, ${cascadingEffects.length} cascading links, circular=${hasCycle}.`);

    return {
      dependencies,
      conflictingActions,
      cascadingEffects,
    };
  }

  public detectCircularDependencies(dependencies: CityInterventionDependencyDto[]): boolean {
    const adj = new Map<string, string[]>();
    for (const dep of dependencies) {
      if (!adj.has(dep.dependsOnActionId)) adj.set(dep.dependsOnActionId, []);
      adj.get(dep.dependsOnActionId)!.push(dep.actionId);
    }
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);
      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
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

export const cityInterventionCoordinationService = new CityInterventionCoordinationService();
