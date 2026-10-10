// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.3 Utility Simulation Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilitySimulationRepository } from '../../lib/server/repositories/utility-simulation.repository';
import { utilityNetworkGraphService } from '../../lib/server/services/utility-network-graph.service';
import { utilityFailurePropagationService } from '../../lib/server/services/utility-failure-propagation.service';
import { utilityServiceImpactService } from '../../lib/server/services/utility-service-impact.service';
import { utilityResilienceService } from '../../lib/server/services/utility-resilience.service';
import { utilitySimulationComparisonService } from '../../lib/server/services/utility-simulation-comparison.service';
import { utilityRecoveryService } from '../../lib/server/services/utility-recovery.service';
import { utilityResilienceOptimizationService } from '../../lib/server/services/utility-resilience-optimization.service';
import { masterUtilitySimulationService } from '../../lib/server/services/utility-simulation.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.3 — Smart Utility Network Simulation & Resilience Suite', () => {
  // ── 1. Network Graph & Failure Propagation ──
  it('should analyze network graph dependencies and propagate failure cascading depth', async () => {
    const deps = await utilityNetworkGraphService.getNetworkDependencies('ast-pow-tx-102');
    expect(deps.upstreamDependencies.length).toBeGreaterThan(0);
    expect(deps.criticalFacilities.length).toBeGreaterThan(0);

    const propagation = await utilityFailurePropagationService.propagateFailure('ast-pow-tx-102');
    expect(propagation.propagationDepth).toBe(3);
    expect(propagation.cascadingRiskScore).toBeGreaterThan(80);
  });

  // ── 2. Service Impact & Resilience Scoring ──
  it('should simulate service impact and evaluate network resilience score', async () => {
    const impact = await utilityServiceImpactService.calculateServiceImpact('ast-pow-tx-102');
    expect(impact.dataSource).toBe('SIMULATION');
    expect(impact.affectedPopulation).toBe(14200);

    const resilience = await utilityResilienceService.calculateResilienceScore('ast-pow-tx-102');
    expect(resilience.resilienceScore).toBeLessThan(50);
    expect(resilience.classification).toBe('VULNERABLE');
  });

  // ── 3. Recovery Plans & Resilience Optimization Approval ──
  it('should generate recovery plans, compare scenario vs baseline, and record human approval', async () => {
    const comparison = await utilitySimulationComparisonService.compareBaselineVsScenario('sim-utl-101');
    expect(comparison.resilienceDelta).toBeLessThan(0);

    const plans = await utilityRecoveryService.generateRecoveryPlans('ast-pow-tx-102');
    expect(plans.length).toBeGreaterThan(0);
    expect(plans[0].strategies[0].requiresHumanApproval).toBe(true);

    const approved = await masterUtilitySimulationService.approveSimulationPlan('sim-utl-101');
    expect(approved.approvalStatus).toBe('APPROVED');

    const scenario = await memoryUtilitySimulationRepository.findScenarioById('sim-utl-101');
    expect(scenario?.status).toBe('APPROVED');
  });

  // ── 4. AI Agent Tool Registry Integration ──
  it('should possess registered utility simulation tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const simTools = tools.filter((t) => t.toolId.startsWith('utility_simulation_') || t.toolId.startsWith('utility_network_') || t.toolId.startsWith('utility_service_') || t.toolId.startsWith('utility_recovery_'));
    expect(simTools.length).toBeGreaterThanOrEqual(5);
  });
});
