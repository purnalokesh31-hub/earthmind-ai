// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 2/6 Unit & Integration Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { resilienceActionPlanningService } from '@/lib/server/services/resilience-action-planning.service';
import { resilienceActionCandidateService } from '@/lib/server/services/resilience-action-candidate.service';
import { resilienceActionDependencyService } from '@/lib/server/services/resilience-action-dependency.service';
import { resilienceActionConflictService } from '@/lib/server/services/resilience-action-conflict.service';
import { resilienceActionSequencingService } from '@/lib/server/services/resilience-action-sequencing.service';
import { resilienceActionComparisonService } from '@/lib/server/services/resilience-action-comparison.service';
import { resilienceActionPlanningRepository } from '@/lib/server/repositories/resilience-action-planning.repository';
import { resilienceOrchestrationService } from '@/lib/server/services/resilience-orchestration.service';
import { toolRegistry } from '@/lib/server/ai-agents/tool-registry';

describe('Phase 7.10 Mega Prompt 2/6 Cross-Domain Resilience Action Planning', () => {
  describe('Candidate Generation & Determinism', () => {
    it('should generate candidate actions based on resilience state', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      const candidates = resilienceActionCandidateService.generateCandidates(state);

      expect(candidates.length).toBeGreaterThanOrEqual(6);
      expect(candidates[0].dataSource).toBe('SIMULATION');
      const utilCandidate = candidates.find((c) => c.category === 'UTILITY_ISOLATION');
      expect(utilCandidate).toBeDefined();
    });
  });

  describe('Dependency Graph & Cycle Detection', () => {
    it('should build action dependency relations and verify non-circularity', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      const candidates = resilienceActionCandidateService.generateCandidates(state);
      const dependencies = resilienceActionDependencyService.buildActionDependencies(candidates);

      expect(dependencies.length).toBeGreaterThanOrEqual(3);
      const hasCycle = resilienceActionDependencyService.detectCircularDependencies(dependencies);
      expect(hasCycle).toBe(false);
    });

    it('should detect circular dependency when cycle is present', () => {
      const cyclicDeps = [
        { dependencyId: '1', prerequisiteActionId: 'A', successorActionId: 'B', relationType: 'PREREQUISITE' as const, rationale: '' },
        { dependencyId: '2', prerequisiteActionId: 'B', successorActionId: 'C', relationType: 'PREREQUISITE' as const, rationale: '' },
        { dependencyId: '3', prerequisiteActionId: 'C', successorActionId: 'A', relationType: 'PREREQUISITE' as const, rationale: '' },
      ];

      const hasCycle = resilienceActionDependencyService.detectCircularDependencies(cyclicDeps);
      expect(hasCycle).toBe(true);
    });
  });

  describe('Conflict Detection & Action Sequencing', () => {
    it('should detect operational and resource conflicts', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      const candidates = resilienceActionCandidateService.generateCandidates(state);
      const dependencies = resilienceActionDependencyService.buildActionDependencies(candidates);
      const conflicts = resilienceActionConflictService.detectConflicts(candidates, dependencies);

      expect(conflicts.length).toBeGreaterThanOrEqual(1);
      expect(conflicts[0].severity).toBeDefined();
    });

    it('should generate ordered action sequence and parallel execution groups', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      const candidates = resilienceActionCandidateService.generateCandidates(state);
      const dependencies = resilienceActionDependencyService.buildActionDependencies(candidates);
      const sequence = resilienceActionSequencingService.generateSequence(candidates, dependencies);

      expect(sequence.steps.length).toBeGreaterThanOrEqual(6);
      expect(sequence.parallelGroups.length).toBeGreaterThanOrEqual(3);
      expect(sequence.totalDurationHours).toBeGreaterThan(0);
    });
  });

  describe('Plan Comparison & Recommendation Pipeline', () => {
    it('should run end-to-end action planning pipeline and enforce human approval', async () => {
      const plan = await resilienceActionPlanningService.generateActionPlan('orch-test-1', 'BALANCED');

      expect(plan.id).toBeDefined();
      expect(plan.requiresHumanApproval).toBe(true);
      expect(plan.dataSource).toBe('SIMULATION');
      expect(plan.classification).toBe('OPTIMAL');
      expect(plan.impact.resilienceImprovementDelta).toBe(33.5);

      const recommendation = await resilienceActionPlanningService.getRecommendation('orch-test-1');
      expect(recommendation.recommendedPlanId).toBe(plan.id);
      expect(recommendation.requiresHumanApproval).toBe(true);
    });

    it('should generate transparent plan comparisons across strategies', () => {
      const comparisons = resilienceActionComparisonService.generatePlanComparisons([], 48.5);
      expect(comparisons.length).toBe(3);
      expect(comparisons[0].classification).toBe('OPTIMAL');
    });
  });

  describe('Mega Prompt 2/6 AI Agent Tools', () => {
    const actionTools = [
      'resilience_action_plan_overview',
      'resilience_action_candidate_analysis',
      'resilience_action_dependency_analysis',
      'resilience_action_conflict_analysis',
      'resilience_action_sequence_analysis',
      'resilience_action_comparison',
      'resilience_action_impact_analysis',
      'resilience_action_recommendation',
    ];

    it('should have all 8 Mega Prompt 2/6 AI tools registered', () => {
      for (const toolId of actionTools) {
        const tool = toolRegistry.getTool(toolId);
        expect(tool).toBeDefined();
        expect(tool?.readOnly).toBe(true);
      }
    });

    it('should invoke AI tools and verify simulation safety flags', async () => {
      for (const toolId of actionTools) {
        const res = await toolRegistry.invokeTool(toolId, { planId: 'plan-101' });
        expect(res.status).toBe('SUCCESS');
        const output = JSON.parse(res.outputSummary);
        expect(output.dataSource).toBe('SIMULATION');
        expect(output.requiresHumanApproval).toBe(true);
      }
    });
  });
});
