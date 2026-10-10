// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — City Crisis Demo Scenario Test Suite (DEMO_CITY_CRISIS_001)
// Verifies deterministic pipeline execution, provenance, safety, & audit
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityCrisisDemoService, CityCrisisDemoService } from '../../lib/server/demo/city-crisis-demo.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';

describe('EarthMind PIOS — City Crisis Demo Scenario (DEMO_CITY_CRISIS_001)', () => {
  // 1. Scenario Identifier and Basic Setup
  it('should execute scenario DEMO_CITY_CRISIS_001 with correct metadata', async () => {
    const result = await cityCrisisDemoService.runDemoScenario();

    expect(result.demoId).toBe(CityCrisisDemoService.DEMO_ID);
    expect(result.city).toContain('Vijayawada');
    expect(result.affectedZone).toContain('Benz Circle');
    expect(result.dataSource).toBe('SIMULATION');
  });

  // 2. Deterministic Output Metrics
  it('should produce deterministic metrics across multiple runs', async () => {
    const run1 = await cityCrisisDemoService.runDemoScenario();
    const run2 = await cityCrisisDemoService.runDemoScenario();

    expect(run1.metrics.rainfallAccumulationMmHr).toBe(145.0);
    expect(run2.metrics.rainfallAccumulationMmHr).toBe(145.0);

    expect(run1.metrics.predictedFloodRiskScore).toBe(88.5);
    expect(run2.metrics.predictedFloodRiskScore).toBe(88.5);

    expect(run1.metrics.roadCongestionPercent).toBe(92.4);
    expect(run2.metrics.roadCongestionPercent).toBe(92.4);

    expect(run1.metrics.transitDelayMinutes).toBe(48.5);
    expect(run2.metrics.transitDelayMinutes).toBe(48.5);

    expect(run1.metrics.populationExposureCount).toBe(34200);
    expect(run2.metrics.populationExposureCount).toBe(34200);
  });

  // 3. Provenance & Non-Live Data Guardrail
  it('should strictly label all data as SIMULATION and verify provenance', async () => {
    const result = await cityCrisisDemoService.runDemoScenario();

    expect(result.dataSource).toBe('SIMULATION');
    expect(result.safetyGovernance.provenanceVerified).toBe(true);

    result.pipelineChain.stage1_signals.forEach((sig) => {
      expect(sig.location.zoneId).toBe('zone-benz-circle');
      expect(sig.severity).toBeDefined();
    });
  });

  // 4. Connection of All Pipeline Stages
  it('should connect all 9 major execution chain stages coherently', async () => {
    const result = await cityCrisisDemoService.runDemoScenario();
    const chain = result.pipelineChain;

    // Stage 1: Signals
    expect(chain.stage1_signals.length).toBeGreaterThanOrEqual(4);

    // Stage 2: Cross-Domain Correlation
    expect(chain.stage2_correlation.affectedDomains).toContain('CLIMATE');
    expect(chain.stage2_correlation.affectedDomains).toContain('MOBILITY');

    // Stage 3: Risk Prediction
    expect(chain.stage3_prediction.cityId).toBe('city-vja');

    // Stage 4: What-If Simulation
    expect(chain.stage4_simulation.scenarioId).toBeDefined();

    // Stage 5: Decision Intelligence
    expect(chain.stage5_decisionPriority.evaluatedCandidates.length).toBeGreaterThan(0);

    // Stage 6: Intervention Planning
    expect(chain.stage6_interventionPlan.interventionId).toBeDefined();

    // Stage 7: Command Escalation
    expect(chain.stage7_commandEscalation).toBeDefined();

    // Stage 8: Human Authorization
    expect(chain.stage8_humanAuthorization.decision).toBe('APPROVE');

    // Stage 9: Audit Log
    expect(chain.stage9_auditLog.decisionId).toBeDefined();
    expect(chain.stage9_auditLog.status).toBe('APPROVED');
  });

  // 5. Safety Governance & Non-Autonomous Execution Enforcement
  it('should enforce mandatory human approval and forbid autonomous execution', async () => {
    const result = await cityCrisisDemoService.runDemoScenario();

    expect(result.safetyGovernance.requiresHumanApproval).toBe(true);
    expect(result.safetyGovernance.advisoryOnly).toBe(true);
    expect(result.safetyGovernance.autonomousExecution).toBe(false);

    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({
        autonomousExecution: true,
        autoExecute: true,
      });
    }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
  });

  // 6. Audit Event Generation
  it('should generate valid immutable audit details upon operator sign-off', async () => {
    const result = await cityCrisisDemoService.runDemoScenario();
    const audit = result.pipelineChain.stage9_auditLog;

    expect(audit.decisionId).toContain('dec-');
    expect(audit.decidedBy).toBe('usr-cmd-patel');
    expect(audit.decision).toBe('APPROVE');
    expect(audit.status).toBe('APPROVED');
  });

  // 7. Repeated Execution Isolation
  it('should execute repeatedly without state corruption or crash', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await cityCrisisDemoService.runDemoScenario();
      expect(res.demoId).toBe('DEMO_CITY_CRISIS_001');
      expect(res.pipelineChain.stage9_auditLog.status).toBe('APPROVED');
    }
  });
});
