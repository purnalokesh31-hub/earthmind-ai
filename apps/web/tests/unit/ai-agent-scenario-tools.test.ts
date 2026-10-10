// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 AI Agent Scenario Tools Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.9.2 — AI Agent Scenario Intelligence Tools Suite', () => {
  const targetTools = [
    'city_prediction_scenario_overview',
    'city_prediction_scenario_create',
    'city_prediction_scenario_run',
    'city_prediction_scenario_result',
    'city_prediction_scenario_cascade',
    'city_prediction_scenario_impact',
    'city_prediction_scenario_compare',
    'city_prediction_scenario_recommendation',
    'city_prediction_scenario_history',
    'city_prediction_scenario_explanation',
  ];

  it('should have all 10 predictive scenario tools registered in tool registry', () => {
    targetTools.forEach((toolId) => {
      const def = toolRegistry.getTool(toolId);
      expect(def).toBeDefined();
      expect(def?.toolId).toBe(toolId);
    });
  });

  it('should execute handlers for all 10 scenario tools returning SIMULATION data source & requiresHumanApproval: true', async () => {
    for (const toolId of targetTools) {
      const def = toolRegistry.getTool(toolId);
      expect(def).toBeDefined();

      const result = await def!.handler({ cityId: 'city-vja', scenarioId: 'sim-scen-501' });
      expect(result).toBeDefined();
      expect(result.dataSource).toBe('SIMULATION');
      expect(result.requiresHumanApproval).toBe(true);
    }
  });

  it('should provide explainability metadata in city_prediction_scenario_explanation tool', async () => {
    const def = toolRegistry.getTool('city_prediction_scenario_explanation');
    const result = await def!.handler({});

    expect(result.scenarioAssumptions.length).toBeGreaterThan(0);
    expect(result.causalRelationships.length).toBeGreaterThan(0);
    expect(result.confidencePercent).toBe(94.5);
    expect(result.limitations).toBeDefined();
  });
});
