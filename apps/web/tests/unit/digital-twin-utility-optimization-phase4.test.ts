// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.4 Utility Autonomous Recovery Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilityOptimizationRepository } from '../../lib/server/repositories/utility-optimization.repository';
import { utilityOptimizationConstraintService } from '../../lib/server/services/utility-optimization-constraint.service';
import { utilityRecoverySequenceService } from '../../lib/server/services/utility-recovery-sequence.service';
import { utilityResourceAllocationService } from '../../lib/server/services/utility-resource-allocation.service';
import { utilityResilienceOptimizationService } from '../../lib/server/services/utility-resilience-optimization.service';
import { utilityOptimizationComparisonService } from '../../lib/server/services/utility-optimization-comparison.service';
import { utilityRecoveryOptimizationService } from '../../lib/server/services/utility-recovery-optimization.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.4 — Smart Utility Autonomous Recovery & Resilience Optimization Suite', () => {
  // ── 1. Constraint Evaluation & Feasibility ──
  it('should evaluate operational constraints and classify candidates as FEASIBLE or INFEASIBLE', () => {
    const result = utilityOptimizationConstraintService.evaluateFeasibility(3200, 1.5, 0, 3, 2, {
      maxBudgetUsd: 15000,
      maxDowntimeHours: 4.0,
      maxPopulationImpact: 20000,
      maxCrewUsageCount: 10,
      maxEquipmentUsageCount: 5,
    });
    expect(result.feasibility).toBe('FEASIBLE');
    expect(result.notes.length).toBeGreaterThan(0);
  });

  // ── 2. Recovery Sequence & Resource Allocation ──
  it('should calculate ordered recovery steps and optimize resource allocation', async () => {
    const seq = await utilityRecoverySequenceService.calculateSequence('opt-utl-201');
    expect(seq.orderedSteps.length).toBeGreaterThan(0);
    expect(seq.orderedSteps[0].requiresHumanApproval).toBe(true);

    const alloc = await utilityResourceAllocationService.calculateResourceAllocation('ast-pow-tx-102');
    expect(alloc.electricalCrewsCount).toBeGreaterThan(0);
    expect(alloc.generatorsDeployedCount).toBeGreaterThanOrEqual(1);
  });

  // ── 3. Candidate Comparison & Resilience Improvement ──
  it('should compare candidate plans and evaluate resilience score improvement', async () => {
    const comp = await utilityOptimizationComparisonService.compareCandidates('opt-utl-201');
    expect(comp.candidates.length).toBeGreaterThan(0);

    const resImp = await utilityResilienceOptimizationService.calculateResilienceImprovement('ast-pow-tx-102');
    expect(resImp.resilienceImprovementDelta).toBe(40.0);
    expect(resImp.postRecoveryResilienceScore).toBe(88.5);
  });

  // ── 4. Master Optimization Service & Human Approval Workflow ──
  it('should approve recovery strategy with operator user audit and preserve approval state', async () => {
    const approved = await utilityRecoveryOptimizationService.approveRecommendation('opt-utl-201', 'usr-grid-director');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.approvedBy).toBe('usr-grid-director');
    expect(approved.requiresHumanApproval).toBe(true);

    const scenario = await memoryUtilityOptimizationRepository.findScenarioById('opt-utl-201');
    expect(scenario?.status).toBe('APPROVED');
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered utility optimization tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const optTools = tools.filter(
      (t) =>
        t.toolId.startsWith('utility_recovery_') ||
        t.toolId.startsWith('utility_resource_') ||
        t.toolId.startsWith('utility_optimization_') ||
        t.toolId.startsWith('utility_service_restoration_')
    );
    expect(optTools.length).toBeGreaterThanOrEqual(8);
  });
});
