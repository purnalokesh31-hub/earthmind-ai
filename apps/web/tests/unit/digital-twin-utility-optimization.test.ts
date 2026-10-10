// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.3 Utility Optimization Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilityOptimizationRepository } from '../../lib/server/repositories/utility-optimization.repository';
import { gridLoadBalancingService } from '../../lib/server/services/grid-load-balancing.service';
import { transformerThermalMitigationService } from '../../lib/server/services/transformer-thermal-mitigation.service';
import { waterPressureRegulationService } from '../../lib/server/services/water-pressure-regulation.service';
import { emergencyLoadSheddingService } from '../../lib/server/services/emergency-load-shedding.service';
import { masterUtilityOptimizationService } from '../../lib/server/services/utility-optimization.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.3 — Smart Utility Autonomous Grid Optimization Suite', () => {
  // ── 1. Grid Load Balancing & Thermal Mitigation ──
  it('should calculate transformer load transfer and thermal mitigation override options', async () => {
    const loadBalance = await gridLoadBalancingService.calculateLoadBalance('ast-pow-tx-102', 'ast-pow-tx-105');
    expect(loadBalance.percentageTransfer).toBe(30);
    expect(loadBalance.loadTransferredKw).toBe(450);

    const cooling = await transformerThermalMitigationService.calculateThermalMitigation('ast-pow-tx-102');
    expect(cooling.fanSpeedOverridePercent).toBe(100);
    expect(cooling.auxiliaryPumpStatus).toBe('ACTIVE');
  });

  // ── 2. Pressure Regulation & Emergency Load Shedding ──
  it('should calculate water pressure regulation and emergency non-critical load shedding', async () => {
    const regulation = await waterPressureRegulationService.calculatePressureRegulation('ast-wtr-pipe-202');
    expect(regulation.expectedBurstRiskReductionPercent).toBeGreaterThan(70);

    const loadShedding = await emergencyLoadSheddingService.calculateEmergencyLoadShedding('city-vja', 'zone-w12');
    expect(loadShedding.criticalFacilityProtectionStatus).toBe('PROTECTED');
    expect(loadShedding.powerSavedMw).toBeGreaterThan(0);
  });

  // ── 3. Optimization Recommendation & Human Approval Workflow ──
  it('should list optimization plans and record human approval for grid load transfer', async () => {
    const plans = await masterUtilityOptimizationService.getPlansByCity('city-vja');
    expect(plans.length).toBeGreaterThan(0);

    const approved = await masterUtilityOptimizationService.approveOptimizationPlan('opt-utl-101');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.requiresHumanApproval).toBe(true);

    const plan = await memoryUtilityOptimizationRepository.findPlanById('opt-utl-101');
    expect(plan?.status).toBe('APPROVED');
  });

  // ── 4. AI Agent Tool Registry Integration ──
  it('should possess registered utility optimization tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const optTools = tools.filter((t) => t.toolId.startsWith('utility_optimization_') || t.toolId.startsWith('grid_load_') || t.toolId.startsWith('transformer_thermal_') || t.toolId.startsWith('water_pressure_') || t.toolId.startsWith('emergency_load_'));
    expect(optTools.length).toBeGreaterThanOrEqual(6);
  });
});
