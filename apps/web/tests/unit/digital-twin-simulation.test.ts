// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.2 Digital Twin Simulation Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryDigitalTwinSimulationRepository } from '../../lib/server/repositories/digital-twin-simulation.repository';
import { digitalTwinSimulationService } from '../../lib/server/services/digital-twin-simulation.service';
import { digitalTwinImpactPropagationService } from '../../lib/server/services/digital-twin-impact-propagation.service';
import { digitalTwinComparisonService } from '../../lib/server/services/digital-twin-comparison.service';

describe('Phase 7.2 — Digital Twin Simulation & What-If Scenario Suite', () => {
  // ── 1. Scenario Creation & Repository ──
  it('should create and list simulation scenarios by city ID', async () => {
    const scenario = await digitalTwinSimulationService.createScenario(
      'Test Flood Scenario',
      'Hypothetical flood test',
      'FLOOD_SIMULATION',
      'city-vja',
      'dutycommander@earthmind.gov'
    );

    expect(scenario.scenarioId).toBeDefined();
    expect(scenario.status).toBe('CONFIGURED');

    const list = await memoryDigitalTwinSimulationRepository.listByCityId('city-vja');
    expect(list.length).toBeGreaterThan(0);
  });

  // ── 2. Impact Propagation Engine ──
  it('should calculate direct and propagated impacts without mutating production assets', async () => {
    const impacts = await digitalTwinImpactPropagationService.calculateImpacts(
      [
        {
          inputId: 'inp-1',
          scenarioId: 'scn-sim-101',
          assetId: 'ast-drn-102',
          inputType: 'PUMP_FAILURE',
          severity: 'CRITICAL',
          magnitude: 100,
          durationHours: 4,
          assumptions: [],
        },
      ],
      'city-vja'
    );

    expect(impacts.length).toBeGreaterThan(0);
    expect(impacts.some((i) => i.impactType === 'DIRECT')).toBe(true);
  });

  // ── 3. Baseline vs Scenario Comparison ──
  it('should generate structured comparison matrix comparing baseline vs simulated risk', () => {
    const impacts = [
      {
        impactId: 'imp-1',
        targetAssetId: 'ast-drn-102',
        targetAssetName: 'Ward 12 Culvert',
        impactType: 'DIRECT' as const,
        baselineStatus: 'OPERATIONAL',
        simulatedStatus: 'OFFLINE',
        baselineConditionScore: 80,
        simulatedConditionScore: 0,
        propagationPath: ['Culvert Pump'],
        explanation: 'Direct pump failure',
      },
    ];

    const comparison = digitalTwinComparisonService.compareScenarios(impacts);
    expect(comparison.simulatedRiskScore).toBeGreaterThan(comparison.baselineRiskScore);
    expect(comparison.overallHealthStatus).toBeDefined();
  });

  // ── 4. Full Simulation Run Execution ──
  it('should execute simulation in isolation and return advisory recommendation with human approval flag', async () => {
    const result = await digitalTwinSimulationService.runSimulation('scn-sim-101');
    expect(result.resultId).toBeDefined();
    expect(result.recommendation.requiresHumanApproval).toBe(true);
  });
});
