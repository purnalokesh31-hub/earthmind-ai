// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Production Baseline Hardening Regression Test Suite
// Verifies core freeze invariants, manifest integrity, and readiness validation
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { EARTHMIND_PRODUCTION_BASELINE_MANIFEST } from '../../lib/server/config/earthmind-production-baseline.manifest';
import { earthMindProductionReadinessService } from '../../lib/server/services/earthmind-production-readiness.service';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';
import { earthMindProvenanceService } from '../../lib/server/services/earthmind-provenance.service';
import { cityCommandDecisionService } from '../../lib/server/services/city-command-decision.service';
import { memoryCityCommandRepository } from '../../lib/server/repositories/city-command.repository';

describe('EarthMind PIOS — Production Baseline Hardening & Core Freeze Invariants', () => {
  // 1. Architecture Manifest Integrity
  it('should maintain certified manifest with all 6 core phases (7.8 through 7.11)', () => {
    const manifest = EARTHMIND_PRODUCTION_BASELINE_MANIFEST;

    expect(manifest.status).toBe('CORE_FROZEN_PRODUCTION_READY');
    expect(manifest.certifiedPhases.length).toBe(6);

    const phaseIds = manifest.certifiedPhases.map((p) => p.phaseId);
    expect(phaseIds).toContain('PHASE_7.8');
    expect(phaseIds).toContain('PHASE_7.9.1');
    expect(phaseIds).toContain('PHASE_7.9.2');
    expect(phaseIds).toContain('PHASE_7.9.4');
    expect(phaseIds).toContain('PHASE_7.10');
    expect(phaseIds).toContain('PHASE_7.11');

    expect(manifest.baselineMetrics.vitestPassRatePercent).toBe(100);
    expect(manifest.baselineMetrics.typeScriptErrorsCount).toBe(0);
  });

  // 2. Automated Production Readiness Validation Service
  it('should return status CERTIFIED_PRODUCTION_READY with 100% passed checks', () => {
    const report = earthMindProductionReadinessService.validateProductionReadiness();

    expect(report.status).toBe('CERTIFIED_PRODUCTION_READY');
    expect(report.summary.failedChecks).toBe(0);
    expect(report.summary.passedChecks).toBe(report.summary.totalChecks);
    expect(report.summary.totalChecks).toBeGreaterThanOrEqual(7);

    expect(report.requiresHumanApproval).toBe(true);
    expect(report.advisoryOnly).toBe(true);
    expect(report.autonomousExecution).toBe(false);
  });

  // 3. Safety Invariant Enforcement
  it('should throw AUTONOMOUS_EXECUTION_FORBIDDEN when physical autonomous execution is attempted', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({
        autoExecute: true,
      });
    }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
  });

  // 4. Data Provenance Preservation & Unverified Source Rejection
  it('should reject unverified provenance tags and preserve legitimate data sources', () => {
    const valid = earthMindProvenanceService.verifyProvenance('PREDICTION', 90, 'pred-101');
    expect(valid.dataSource).toBe('PREDICTION');
    expect(valid.confidence).toBe(90);

    const invalid = earthMindProvenanceService.verifyProvenance('UNTRUSTED_EXTERNAL' as any, 99, 'bad-ref');
    expect(invalid.confidence).toBe(0);
  });

  // 5. Human Authorization Decision Flow & Duplicate Approval Rejection
  it('should enforce operator confirmation token and reject duplicate approval attempts with COMMAND_CASE_ALREADY_DECIDED', () => {
    const testCase = memoryCityCommandRepository.createCase({
      title: 'Baseline Drainage Opening',
      description: 'Emergency opening of sluice gates',
      cityId: 'vijayawada',
      sourceType: 'INTERVENTION_PLANNING',
      sourceReferenceId: 'ref-gate-01',
      riskScore: 78,
      riskTier: 'HIGH',
      confidenceScore: 88,
      confidenceLevel: 'HIGH_CONFIDENCE',
      populationImpact: 5000,
      serviceImpact: 500,
      financialImpactUsd: 10000,
      requiredAuthorizationLevel: 'CITY_COMMANDER',
      recommendation: {
        recommendationId: 'rec-gate-01',
        title: 'Open Sluice Gate 3',
        summary: 'Controlled discharge',
        targetId: 'gate-3',
        expectedRiskReductionDelta: 40,
        estimatedCostUsd: 1000,
        estimatedDurationHours: 1,
        requiresHumanApproval: true,
        provenance: 'INTERVENTION_PLANNING',
      },
    });

    const commander = {
      userId: 'usr-cmd-reg',
      name: 'Commander Reddy',
      // 'role' is a real RoleType (auth) value; 'authorizationLevel' is a separate
      // GovernanceAuthorizationLevel (governance tier) value — they are different enums that
      // happen to share some naming, and this fixture previously conflated them.
      role: 'COMMANDER' as const,
      authorizationLevel: 'CITY_COMMANDER' as const,
    };

    const firstApproval = cityCommandDecisionService.processOperatorDecision(commander, {
      caseId: testCase.caseId,
      decision: 'APPROVE',
      confirmationToken: 'tok-cmd-123',
      reason: 'Authorized after simulated risk analysis.',
    });

    expect(firstApproval.caseEntity.status).toBe('APPROVED');

    expect(() => {
      cityCommandDecisionService.processOperatorDecision(commander, {
        caseId: testCase.caseId,
        decision: 'APPROVE',
        confirmationToken: 'tok-cmd-dup',
        reason: 'Duplicate approval call.',
      });
    }).toThrow(/COMMAND_CASE_ALREADY_DECIDED/);
  });
});
