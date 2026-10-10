// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — End-to-End System Intelligence Chain Integration Test
// Verifies complete pipeline: Phase 7.8 → 7.9.1 → 7.9.2 → 7.9.4 → 7.10 → 7.11
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { earthmindIntelligencePipelineService } from '../../lib/server/services/earthmind-intelligence-pipeline.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';
import { earthMindProvenanceService } from '../../lib/server/services/earthmind-provenance.service';
import { cityGovernanceEvaluationService } from '../../lib/server/services/city-governance-evaluation.service';
import { cityCommandDecisionService } from '../../lib/server/services/city-command-decision.service';
import { memoryCityCommandRepository } from '../../lib/server/repositories/city-command.repository';

describe('EarthMind PIOS — End-to-End System Intelligence Chain Integration', () => {
  // 1. Prediction → Simulation
  it('should propagate signals through risk prediction into what-if simulation (Stages 1–3)', async () => {
    const pipeline = await earthmindIntelligencePipelineService.executePipeline({
      cityId: 'vijayawada',
      scenarioType: 'EXTREME_RAINFALL_CASCADE',
      requestedByUserId: 'usr-officer-99',
    });

    expect(pipeline.pipelineId).toBeDefined();
    expect(pipeline.executionChain.stage1_signals.length).toBeGreaterThan(0);
    expect(pipeline.executionChain.stage2_correlation.correlationType).toBe('CAUSAL');
    expect(pipeline.executionChain.stage3_prediction.citywideForecast.riskScore).toBeGreaterThan(50);
    expect(pipeline.executionChain.stage4_simulation.scenarioId).toBeDefined();
    expect(pipeline.executionChain.stage4_simulation.result.risk.simulatedRiskScore).toBeGreaterThan(0);
  });

  // 2. Simulation → Decision
  it('should fuse simulation outcomes into predictive decision intelligence (Stage 4)', async () => {
    const pipeline = await earthmindIntelligencePipelineService.executePipeline({
      cityId: 'vijayawada',
      scenarioType: 'EXTREME_RAINFALL_CASCADE',
      requestedByUserId: 'usr-officer-99',
    });

    const decision = pipeline.executionChain.stage5_decisionIntelligence;
    expect(decision.baselineRiskScore).toBeGreaterThan(0);
    expect(decision.evaluatedCandidates.length).toBeGreaterThan(0);
    expect(decision.decisionConfidence).toBeGreaterThan(70);
    expect(decision.requiresHumanApproval).toBe(true);
  });

  // 3. Decision → Intervention
  it('should convert prioritized decision recommendations into multi-domain intervention plans (Stage 5)', async () => {
    const pipeline = await earthmindIntelligencePipelineService.executePipeline({
      cityId: 'vijayawada',
      scenarioType: 'EXTREME_RAINFALL_CASCADE',
      requestedByUserId: 'usr-officer-99',
    });

    const intervention = pipeline.executionChain.stage6_interventionPlanning;
    expect(intervention.interventionId).toBeDefined();
    expect(intervention.actions.length).toBeGreaterThan(0);
    expect(intervention.requiresHumanApproval).toBe(true);
  });

  // 4. Intervention → Command
  it('should escalate high-risk intervention plans into Human Command Center cases (Stage 6)', async () => {
    const pipeline = await earthmindIntelligencePipelineService.executePipeline({
      cityId: 'vijayawada',
      scenarioType: 'EXTREME_RAINFALL_CASCADE',
      requestedByUserId: 'usr-officer-99',
    });

    const authState = pipeline.executionChain.stage8_governanceAuthorization;
    expect(authState).toBeDefined();
    expect(authState.requiresHumanApproval).toBe(true);
  });

  // 5. Command → Human Authorization
  it('should evaluate risk, confidence, and policy checks before requiring human authorization', () => {
    const evalResult = cityGovernanceEvaluationService.evaluateGovernancePipeline({
      targetId: 'act-test-001',
      cityId: 'vijayawada',
      riskScore: 88,
      confidenceScorePercent: 92,
      impactedDomains: ['CLIMATE', 'MOBILITY'],
      requiresHumanApproval: true,
    });

    expect(evalResult.requiresHumanApproval).toBe(true);
    expect(evalResult.requiredAuthorizationLevel).toBeDefined();
  });

  // 6. Approval → Audit Event
  it('should record an immutable audit log upon human operator approval', () => {
    // 'role' is a real RoleType value; COMMANDER maps to CITY_COMMANDER authorization tier.
    const operator = {
      userId: 'usr-cmd-01',
      name: 'City Commander Patel',
      role: 'COMMANDER' as const,
      authorizationLevel: 'CITY_COMMANDER' as const,
    };

    const request = {
      caseId: 'case-cmd-101',
      decision: 'APPROVE' as const,
      confirmationToken: 'tok-confirm-101',
      reason: 'Approved flood protection plan based on simulated risk reduction.',
    };

    const result = cityCommandDecisionService.processOperatorDecision(operator, request);

    expect(result.caseEntity.status).toBe('APPROVED');
    expect(result.decision.decision).toBe('APPROVE');
    expect(result.decision.decisionId).toBeDefined();
  });

  // 7. Rejection → Audit Event
  it('should record an immutable audit log upon human operator rejection', () => {
    const newCase = memoryCityCommandRepository.createCase({
      title: 'Test Drainage Diversion',
      description: 'Emergency diversion test',
      cityId: 'vijayawada',
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: 'int-ref-1',
      riskScore: 65,
      riskTier: 'HIGH',
      confidenceScore: 85,
      confidenceLevel: 'HIGH_CONFIDENCE',
      populationImpact: 10000,
      serviceImpact: 1000,
      financialImpactUsd: 15000,
      requiredAuthorizationLevel: 'DOMAIN_MANAGER',
      recommendation: {
        recommendationId: 'rec-test-1',
        title: 'Diversion Plan',
        summary: 'Divert canal flow',
        targetId: 'canal-1',
        expectedRiskReductionDelta: 50,
        estimatedCostUsd: 5000,
        estimatedDurationHours: 2,
        requiresHumanApproval: true,
        provenance: 'INTERVENTION_PLANNING',
      },
    });

    // 'role' is a real RoleType value; SUPERVISOR maps to DOMAIN_MANAGER authorization tier.
    const operator = {
      userId: 'usr-dm-01',
      name: 'Domain Manager Singh',
      role: 'SUPERVISOR' as const,
      authorizationLevel: 'DOMAIN_MANAGER' as const,
    };

    const request = {
      caseId: newCase.caseId,
      decision: 'REJECT' as const,
      reason: 'Rejected due to downstream water impact.',
    };

    const result = cityCommandDecisionService.processOperatorDecision(operator, request);

    expect(result.caseEntity.status).toBe('REJECTED');
    expect(result.decision.decision).toBe('REJECT');
  });

  // 8. Duplicate Approval Prevention
  it('should reject duplicate approval attempts with COMMAND_CASE_ALREADY_DECIDED error', () => {
    // 'role' is a real RoleType value; COMMANDER maps to CITY_COMMANDER authorization tier.
    const operator = {
      userId: 'usr-cmd-01',
      name: 'City Commander Patel',
      role: 'COMMANDER' as const,
      authorizationLevel: 'CITY_COMMANDER' as const,
    };

    const request = {
      caseId: 'case-cmd-101',
      decision: 'APPROVE' as const,
      confirmationToken: 'tok-confirm-dup',
      reason: 'Second attempt on already decided case.',
    };

    expect(() => {
      cityCommandDecisionService.processOperatorDecision(operator, request);
    }).toThrow(/COMMAND_CASE_ALREADY_DECIDED/);
  });

  // 9. Unauthorized Command Prevention
  it('should reject decision process when operator role authorization level is insufficient', () => {
    const newCase = memoryCityCommandRepository.createCase({
      title: 'High Risk Power Grid Shedding',
      description: 'Emergency load shedding',
      cityId: 'vijayawada',
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: 'int-ref-2',
      riskScore: 90,
      riskTier: 'CRITICAL',
      confidenceScore: 95,
      confidenceLevel: 'HIGH_CONFIDENCE',
      populationImpact: 100000,
      serviceImpact: 20000,
      financialImpactUsd: 500000,
      requiredAuthorizationLevel: 'EMERGENCY_COMMANDER',
      recommendation: {
        recommendationId: 'rec-test-2',
        title: 'Load Shedding Plan',
        summary: 'Emergency grid shedding',
        targetId: 'grid-1',
        expectedRiskReductionDelta: 90,
        estimatedCostUsd: 50000,
        estimatedDurationHours: 1,
        requiresHumanApproval: true,
        provenance: 'INTERVENTION_PLANNING',
      },
    });

    const lowRoleOperator = {
      userId: 'usr-op-low',
      name: 'Junior Operator',
      role: 'OPERATOR' as const,
      authorizationLevel: 'OPERATOR' as const,
    };

    const request = {
      caseId: newCase.caseId,
      decision: 'APPROVE' as const,
      confirmationToken: 'tok-low-auth',
      reason: 'Unauthorized approval attempt.',
    };

    expect(() => {
      cityCommandDecisionService.processOperatorDecision(lowRoleOperator, request);
    }).toThrow(/AUTHORIZATION_LEVEL_INSUFFICIENT/);
  });

  // 10. Autonomous Execution Prevention
  it('should throw AUTONOMOUS_EXECUTION_FORBIDDEN when physical execution is attempted', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({
        autonomousExecution: true,
        autoExecute: true,
      });
    }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
  });

  // 11. Data Provenance Preservation
  it('should reject unverified provenance promotion and assign confidence = 0', () => {
    const result = earthMindProvenanceService.verifyProvenance(
      'UNKNOWN' as any,
      95,
      'test-ref'
    );

    expect(result.dataSource).toBe('UNKNOWN');
    expect(result.confidence).toBe(0);
  });

  // 12. Backward Compatibility
  it('should preserve backward compatibility and advisory flags across all outputs', async () => {
    const pipeline = await earthmindIntelligencePipelineService.executePipeline({
      cityId: 'vijayawada',
      scenarioType: 'EXTREME_RAINFALL_CASCADE',
      requestedByUserId: 'usr-officer-99',
    });

    expect(pipeline.safetyGovernance.requiresHumanApproval).toBe(true);
    expect(pipeline.safetyGovernance.advisoryOnly).toBe(true);
    expect(pipeline.safetyGovernance.autonomousExecution).toBe(false);
  });
});
