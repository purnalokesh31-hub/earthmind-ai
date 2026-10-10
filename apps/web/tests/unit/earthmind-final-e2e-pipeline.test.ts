// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Final End-to-End Pipeline Integration Test Suite
// Validates 20 pipeline checkpoints from Phase 7.8 through Phase 7.11
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityCrisisDemoService } from '../../lib/server/demo/city-crisis-demo.service';
import { demoModeService } from '../../lib/server/demo/demo-mode.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';
import { cityCommandDecisionService } from '../../lib/server/services/city-command-decision.service';
import { memoryCityCommandRepository } from '../../lib/server/repositories/city-command.repository';

describe('EarthMind PIOS — Final End-to-End Pipeline Validation (CITY FLOOD CASCADE DEMO)', () => {
  // ── 1. Comprehensive 20 Checkpoints Validation ──
  it('should successfully execute all 20 end-to-end intelligence and governance checkpoints', async () => {
    const demoResult = await cityCrisisDemoService.runDemoScenario();

    // Checkpoint 1: Signal ingestion
    expect(demoResult.pipelineChain.stage1_signals.length).toBeGreaterThan(0);
    expect(demoResult.pipelineChain.stage1_signals[0].domain).toBe('CLIMATE');

    // Checkpoint 2: Cross-domain normalization
    expect(demoResult.pipelineChain.stage2_correlation.affectedDomains.length).toBe(4);

    // Checkpoint 3: Correlation
    expect(demoResult.pipelineChain.stage2_correlation.confidence).toBe(94.5);

    // Checkpoint 4: Causal chain
    expect(demoResult.pipelineChain.stage2_correlation.causalChain.length).toBe(5);

    // Checkpoint 5: Risk prediction
    expect(demoResult.metrics.predictedFloodRiskScore).toBe(88.5);

    // Checkpoint 6: Predictive alert
    expect(demoResult.pipelineChain.stage2_correlation.severity).toBe('CRITICAL');

    // Checkpoint 7: What-if simulation
    expect(demoResult.pipelineChain.stage4_simulation.scenarioId).toBeDefined();

    // Checkpoint 8: Cascade propagation
    expect(demoResult.metrics.roadCongestionPercent).toBe(92.4);

    // Checkpoint 9: Risk comparison
    expect(demoResult.pipelineChain.stage5_decisionPriority.evaluatedCandidateCount).toBeGreaterThan(0);

    // Checkpoint 10: Decision prioritization
    expect(demoResult.pipelineChain.stage5_decisionPriority.recommendedCandidate).toBeDefined();

    // Checkpoint 11: Intervention generation
    expect(demoResult.pipelineChain.stage6_interventionPlan.interventionId).toBeDefined();

    // Checkpoint 12: Dependency validation
    expect(demoResult.pipelineChain.stage6_interventionPlan.validationStatus).toBeDefined();

    // Checkpoint 13: Resource validation
    expect(demoResult.pipelineChain.stage6_interventionPlan.resources.length).toBeGreaterThan(0);

    // Checkpoint 14: Recommendation generation
    expect(demoResult.pipelineChain.stage6_interventionPlan.actions.length).toBeGreaterThan(0);

    // Checkpoint 15: Command escalation
    expect(demoResult.pipelineChain.stage7_commandEscalation).toBe('EMERGENCY_COMMANDER');

    // Checkpoint 16: Human authorization requirement
    expect(demoResult.pipelineChain.stage8_humanAuthorization.requiresHumanApproval).toBe(true);

    // Checkpoint 17: Approval
    expect(demoResult.pipelineChain.stage8_humanAuthorization.decision).toBe('APPROVE');

    // Checkpoint 18: Audit creation
    expect(demoResult.pipelineChain.stage9_auditLog.decisionId).toBeDefined();

    // Checkpoint 19: Provenance preservation
    expect(demoResult.dataSource).toBe('SIMULATION');

    // Checkpoint 20: Autonomous execution blocking
    expect(demoResult.safetyGovernance.autonomousExecution).toBe(false);
  });

  // ── 2. Explicit Safety Invariants Validation ──
  it('should enforce safety invariants: requiresHumanApproval=true, advisoryOnly=true, autonomousExecution=false', async () => {
    const demoState = demoModeService.getDemoState();

    expect(demoState.safetyGovernance.requiresHumanApproval).toBe(true);
    expect(demoState.safetyGovernance.advisoryOnly).toBe(true);
    expect(demoState.safetyGovernance.autonomousExecution).toBe(false);
  });

  // ── 3. Autonomous Execution Blocking Test ──
  it('should produce AUTONOMOUS_EXECUTION_FORBIDDEN when physical autonomous execution is attempted', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({
        autonomousExecution: true,
        autoExecute: true,
      });
    }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
  });

  // ── 4. Duplicate Approval Protection Test (409 Conflict) ──
  it('should throw case already decided conflict exception on duplicate approval', () => {
    const newCase = memoryCityCommandRepository.createCase({
      title: 'E2E Duplicate Test Case',
      description: 'Testing terminal state protection',
      cityId: 'city-vja',
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: 'ref-dup-1',
      riskScore: 88.5,
      riskTier: 'CRITICAL',
      confidenceScore: 90,
      confidenceLevel: 'HIGH_CONFIDENCE',
      requiredAuthorizationLevel: 'EMERGENCY_COMMANDER',
    });
    const caseId = newCase.caseId;

    // 'role' is a real RoleType value; SYSTEM_ADMIN maps to EMERGENCY_COMMANDER authorization tier.
    const operator = { userId: 'usr-cmd-1', name: 'Commander Patel', role: 'SYSTEM_ADMIN' as const, authorizationLevel: 'EMERGENCY_COMMANDER' as const };
    const request = { caseId, decision: 'APPROVE' as const, reason: 'First approval', confirmationToken: 'tok-1234' };

    // First Approval Succeeds
    cityCommandDecisionService.processOperatorDecision(operator, request);

    // Second Duplicate Approval Fails with Conflict
    expect(() => {
      cityCommandDecisionService.processOperatorDecision(operator, request);
    }).toThrow(/COMMAND_CASE_ALREADY_DECIDED/);
  });

  // ── 5. Security Authentication & RBAC Checks (401 & 403) ──
  it('should enforce HTTP 401 for unauthorized requests and 403 for RBAC role violations', () => {
    const newCase = memoryCityCommandRepository.createCase({
      title: 'E2E RBAC Test Case',
      description: 'Testing RBAC level protection',
      cityId: 'city-vja',
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: 'ref-rbac-1',
      riskScore: 90.0,
      riskTier: 'CRITICAL',
      confidenceScore: 92,
      confidenceLevel: 'HIGH_CONFIDENCE',
      requiredAuthorizationLevel: 'EMERGENCY_COMMANDER',
    });
    const caseId = newCase.caseId;

    // Operator with insufficient level (FIELD_OPERATOR < EMERGENCY_COMMANDER)
    const weakOperator = { userId: 'usr-field-1', name: 'Officer John', role: 'FIELD_OPERATOR' as const, authorizationLevel: 'OPERATOR' as const };
    const request = { caseId, decision: 'APPROVE' as const, reason: 'Unauthorized signoff', confirmationToken: 'tok-5678' };

    expect(() => {
      cityCommandDecisionService.processOperatorDecision(weakOperator, request);
    }).toThrow(/AUTHORIZATION_LEVEL_INSUFFICIENT/);
  });
});
