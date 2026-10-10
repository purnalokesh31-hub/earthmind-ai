// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dedicated Demo Mode Unit & Integration Test Suite
// Verifies state transitions, safety banners, reset/replay, and audit trail
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { demoModeService } from '../../lib/server/demo/demo-mode.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';

describe('EarthMind PIOS — Dedicated Demo Mode', () => {
  beforeEach(() => {
    demoModeService.resetDemo();
  });

  // 1. Initial State & Safety Banners
  it('should initialize in IDLE state with all mandatory simulation safety banners', () => {
    const state = demoModeService.getDemoState();

    expect(state.mode).toBe('DEMO_MODE');
    expect(state.scenarioId).toBe('CITY_FLOOD_CASCADE_DEMO');
    expect(state.state).toBe('IDLE');
    expect(state.dataSource).toBe('SIMULATION');

    expect(state.safetyBanners.demoMode).toBe('DEMO MODE');
    expect(state.safetyBanners.simulationData).toBe('SIMULATION DATA');
    expect(state.safetyBanners.noLiveControl).toBe('NO LIVE INFRASTRUCTURE CONTROL');
    expect(state.safetyBanners.humanAuthRequired).toBe('HUMAN AUTHORIZATION REQUIRED');

    expect(state.stages.length).toBe(9);
  });

  // 2. Demo Execution Flow & Stage Completion
  it('should start demo, transition to COMPLETED, and report all 9 stages', async () => {
    const result = await demoModeService.startDemo('CITY_FLOOD_CASCADE_DEMO');

    expect(result.state).toBe('COMPLETED');
    expect(result.result).toBeDefined();
    expect(result.metrics.rainfallAccumulationMmHr).toBe(145.0);

    const completedStages = result.stages.filter((s) => s.status === 'COMPLETED');
    expect(completedStages.length).toBe(9);

    const stageIds = result.stages.map((s) => s.stageId);
    expect(stageIds).toContain('SIGNAL_DETECTED');
    expect(stageIds).toContain('CROSS_DOMAIN_CORRELATION');
    expect(stageIds).toContain('RISK_PREDICTION');
    expect(stageIds).toContain('WHAT_IF_SIMULATION');
    expect(stageIds).toContain('DECISION_PRIORITY');
    expect(stageIds).toContain('INTERVENTION_PLAN');
    expect(stageIds).toContain('COMMAND_ESCALATION');
    expect(stageIds).toContain('HUMAN_AUTHORIZATION');
    expect(stageIds).toContain('AUDIT_COMPLETE');
  });

  // 3. Reset Demo Functionality
  it('should reset demo state to RESET and clear result', async () => {
    await demoModeService.startDemo();
    const resetState = demoModeService.resetDemo();

    expect(resetState.state).toBe('IDLE');
    expect(resetState.result).toBeUndefined();
    expect(resetState.metrics).toBeUndefined();
  });

  // 4. Replay Scenario Functionality
  it('should replay demo scenario cleanly after reset', async () => {
    await demoModeService.startDemo();
    const replayState = await demoModeService.replayDemo();

    expect(replayState.state).toBe('COMPLETED');
    expect(replayState.metrics.rainfallAccumulationMmHr).toBe(145.0);
    expect(replayState.result?.pipelineChain.stage9_auditLog.status).toBe('APPROVED');
  });

  // 5. Simulation Label & Non-Autonomous Invariant Enforcement
  it('should enforce simulation labels and reject physical autonomous execution', async () => {
    const result = await demoModeService.startDemo();

    expect(result.dataSource).toBe('SIMULATION');
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

  // 6. Immutable Audit Trail Retrieval
  it('should generate and preserve immutable audit trail records', async () => {
    await demoModeService.startDemo();
    const audit = demoModeService.getAuditTrail();

    expect(audit.status).toBe('AUDIT_RECORDED');
    expect(audit.decisionId).toBeDefined();
    expect(audit.decidedBy).toBe('usr-cmd-patel');
    expect(audit.decision).toBe('APPROVE');
    expect(audit.provenance).toBe('SIMULATION');
  });
});
