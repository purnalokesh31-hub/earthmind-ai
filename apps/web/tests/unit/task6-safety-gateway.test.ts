// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 6: Safety Gateway Hardening Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { earthMindSafetyGatewayService } from '@/lib/server/services/earthmind-safety-gateway.service';
import { earthMindProductionReadinessService } from '@/lib/server/services/earthmind-production-readiness.service';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';

describe('TASK 6 — Safety Gateway Hardening Suite', () => {
  describe('1. Rejection of Unsafe & Autonomous Requests', () => {
    it('rejects recommendation with advisoryOnly: false', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertAdvisoryMode({
          recommendationId: 'rec-test-unsafe',
          advisoryOnly: false,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('rejects recommendation with autonomousExecution: true', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution({
          recommendationId: 'rec-test-auto',
          autonomousExecution: true,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('rejects recommendation with autoExecute: true or directActuation: true', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution({
          actionId: 'act-gate-open',
          autoExecute: true,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);

      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution({
          actionId: 'act-substation-trip',
          directActuation: true,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('rejects executionMode: PHYSICAL_EXECUTION or LIVE_WRITE', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution({
          executionMode: 'PHYSICAL_EXECUTION',
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);

      expect(() =>
        earthMindSafetyGatewayService.assertAdvisoryMode({
          executionMode: 'LIVE_WRITE',
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('rejects attempt to bypass human approval (bypassApproval: true or autoApprove: true)', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertHumanApprovalRequired({
          decisionId: 'dec-bypass-test',
          requiresHumanApproval: true,
          bypassApproval: true,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);

      expect(() =>
        earthMindSafetyGatewayService.assertHumanApprovalRequired({
          decisionId: 'dec-auto-approve',
          autoApprove: true,
        })
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('deep-inspects and rejects nested actions containing autonomous actuation flags', () => {
      const nestedPlan = {
        planId: 'plan-nested-attack',
        advisoryOnly: true,
        requiresHumanApproval: true,
        actions: [
          {
            actionId: 'act-flood-barrier',
            title: 'Deploy flood barriers',
            autonomousExecution: true,
          },
        ],
      };

      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution(nestedPlan)
      ).toThrowError(/AUTONOMOUS_EXECUTION_FORBIDDEN.*contains autonomous actuation/);
    });
  });

  describe('2. Allowance of Legitimate Advisory Recommendations', () => {
    it('allows clean advisory recommendation and sanitizes invariants', () => {
      const cleanPlan = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Municipal Stormwater Pre-Positioning',
        optimizationObjective: 'BALANCED',
      });

      const sanitized = earthMindSafetyGatewayService.sanitizeRecommendation(cleanPlan as any);
      expect(sanitized.advisoryOnly).toBe(true);
      expect(sanitized.requiresHumanApproval).toBe(true);
      expect(sanitized.autonomousExecution).toBe(false);
    });
  });

  describe('3. Production Readiness Real-World Validation', () => {
    it('validates production readiness using real system entities without artificial mocks', () => {
      const report = earthMindProductionReadinessService.validateProductionReadiness();

      expect(report.status).toBe('CERTIFIED_PRODUCTION_READY');
      expect(report.summary.failedChecks).toBe(0);
      expect(report.summary.passedChecks).toBeGreaterThanOrEqual(7);
      expect(report.advisoryOnly).toBe(true);
      expect(report.requiresHumanApproval).toBe(true);
      expect(report.autonomousExecution).toBe(false);
    });
  });
});
