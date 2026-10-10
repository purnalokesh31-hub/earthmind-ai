// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 1/6 Unit & Integration Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { resilienceOrchestrationService } from '@/lib/server/services/resilience-orchestration.service';
import { resilienceOrchestrationRepository } from '@/lib/server/repositories/resilience-orchestration.repository';
import { toolRegistry } from '@/lib/server/ai-agents/tool-registry';

describe('Phase 7.10 Citywide Resilience Orchestration Foundation', () => {
  describe('Resilience State Calculation & Score Determinism', () => {
    it('should compute deterministic resilience state and classification', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      expect(state.cityId).toBe('city-vja');
      expect(state.overallResilienceScore).toBeGreaterThanOrEqual(0);
      expect(state.overallResilienceScore).toBeLessThanOrEqual(100);
      expect(state.classification).toBeDefined();
      expect(state.domainStates.length).toBe(7);
      expect(state.dataSource).toBe('SIMULATION');
    });

    it('should evaluate structural multi-hop dependencies between domains', () => {
      const deps = resilienceOrchestrationService.evaluateStructuralDependencies('city-vja');
      expect(deps.length).toBeGreaterThanOrEqual(4);
      const climateToUtil = deps.find((d) => d.upstreamDomain === 'CLIMATE' && d.downstreamDomain === 'UTILITY');
      expect(climateToUtil).toBeDefined();
      expect(climateToUtil?.dependencyType).toBe('CASCADE_VECTOR');
    });

    it('should calculate KPIs and action priorities', () => {
      const state = resilienceOrchestrationService.calculateResilienceState('city-vja');
      const kpis = resilienceOrchestrationService.calculateKpis(state);
      const prios = resilienceOrchestrationService.generatePriorities(state);

      expect(kpis.length).toBeGreaterThanOrEqual(4);
      expect(prios.length).toBeGreaterThanOrEqual(3);
      expect(prios[0].priorityClass).toBe('CRITICAL');
    });
  });

  describe('Resilience Orchestration Repository', () => {
    it('should create, retrieve, update status, and manage state history', async () => {
      const entity = await resilienceOrchestrationService.createOrchestration({
        cityId: 'city-guntur',
        objectives: ['LIFE_SAFETY', 'SERVICE_CONTINUITY'],
      });

      expect(entity.id).toBeDefined();
      expect(entity.cityId).toBe('city-guntur');
      expect(entity.requiresHumanApproval).toBe(true);

      const fetched = await resilienceOrchestrationRepository.getById(entity.id);
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(entity.id);

      const updated = await resilienceOrchestrationRepository.updateStatus(entity.id, 'PLANNING');
      expect(updated?.status).toBe('PLANNING');
    });
  });

  describe('Phase 7.10 AI Agent Tool Registry Integration', () => {
    const resilienceTools = [
      'resilience_orchestration_overview',
      'resilience_state_analysis',
      'resilience_domain_analysis',
      'resilience_dependency_analysis',
      'resilience_vulnerability_analysis',
      'resilience_orchestration_status',
    ];

    it('should have all 6 Phase 7.10 tools registered', () => {
      for (const toolId of resilienceTools) {
        const tool = toolRegistry.getTool(toolId);
        expect(tool).toBeDefined();
        expect(tool?.readOnly).toBe(true);
      }
    });

    it('should invoke tools and return structured data with human governance flags', async () => {
      for (const toolId of resilienceTools) {
        const res = await toolRegistry.invokeTool(toolId, { cityId: 'city-vja' });
        expect(res.status).toBe('SUCCESS');
        const output = JSON.parse(res.outputSummary);
        expect(output.dataSource).toBe('SIMULATION');
        expect(output.requiresHumanApproval).toBe(true);
      }
    });
  });
});
