// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.3 Infrastructure Optimization Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryDigitalTwinOptimizationRepository } from '../../lib/server/repositories/digital-twin-optimization.repository';
import { digitalTwinOptimizationService } from '../../lib/server/services/digital-twin-optimization.service';
import { optimizationConstraintService } from '../../lib/server/services/optimization-constraint.service';
import { preventiveMaintenanceOptimizationService } from '../../lib/server/services/preventive-maintenance-optimization.service';
import { resourceAllocationOptimizationService } from '../../lib/server/services/resource-allocation-optimization.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.3 — Autonomous Infrastructure Optimization Suite', () => {
  // ── 1. Scenario Creation & Repository ──
  it('should create and retrieve optimization scenario by ID', async () => {
    const scenario = await digitalTwinOptimizationService.createScenario(
      'Test Vijayawada Optimization',
      'Multi-objective test',
      'city-vja',
      1500000,
      'dutycommander@earthmind.gov'
    );

    expect(scenario.scenarioId).toBeDefined();
    expect(scenario.status).toBe('CONFIGURED');

    const list = await memoryDigitalTwinOptimizationRepository.listByCityId('city-vja');
    expect(list.length).toBeGreaterThan(0);
  });

  // ── 2. Constraint Engine ──
  it('should detect infeasible plans that violate hard budget constraints', () => {
    const result = optimizationConstraintService.validatePlanConstraints(
      {
        planId: 'plan-overbudget',
        title: 'Overbudget Strategy',
        strategyName: 'OVERBUDGET',
        normalizedScore: 90,
        riskReductionPercent: 95,
        estimatedCostInr: 2000000,
        estimatedResponseTimeMinutes: 10,
        resourceUtilizationPercent: 80,
        feasibilityStatus: 'FEASIBLE',
        advantages: [],
        disadvantages: [],
        maintenancePlans: [],
        resourceAllocations: [],
      },
      [{ constraintId: 'c1', type: 'MAX_BUDGET', limitValue: 1500000, isHardConstraint: true }]
    );

    expect(result.isFeasible).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  // ── 3. Maintenance Priorities & Resource Allocations ──
  it('should calculate preventive maintenance priorities and resource allocations', async () => {
    const priorities = await preventiveMaintenanceOptimizationService.calculateMaintenancePriorities('city-vja');
    expect(priorities.length).toBeGreaterThan(0);
    expect(priorities[0].maintenancePriorityScore).toBeGreaterThan(0);

    const allocations = await resourceAllocationOptimizationService.calculateOptimalAllocations('city-vja');
    expect(allocations.length).toBeGreaterThan(0);
    expect(allocations[0].status).toBeDefined();
  });

  // ── 4. Full Optimization Run & Human Approval Safety ──
  it('should execute optimization algorithm and require human approval', async () => {
    const rec = await digitalTwinOptimizationService.runOptimization('opt-sc-101');
    expect(rec.recommendationId).toBeDefined();
    expect(rec.requiresHumanApproval).toBe(true);

    const approved = await digitalTwinOptimizationService.approveOptimization('opt-sc-101', 'usr-commander-101');
    expect(approved.status).toBe('APPROVED');
    expect(approved.approvedBy).toBe('usr-commander-101');
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered optimization tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const optTools = tools.filter((t) => t.toolId.startsWith('optimization_'));
    expect(optTools.length).toBeGreaterThan(0);
  });
});
