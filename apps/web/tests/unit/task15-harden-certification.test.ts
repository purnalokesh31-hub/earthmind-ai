// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 15: Harden Certification & Production Readiness Tests
// Behavioral Verification of Real Authorization, Real Safety Decisions, Real Failure Paths & Approval Boundaries
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { earthMindSafetyGatewayService } from '@/lib/server/services/earthmind-safety-gateway.service';
import { cityGovernanceAuthorizationService } from '@/lib/server/services/city-governance-authorization.service';
import { cityCommandDecisionService } from '@/lib/server/services/city-command-decision.service';
import { memoryCityCommandRepository } from '@/lib/server/repositories/city-command.repository';
import { cityResilienceScoreService } from '@/lib/server/services/city-resilience-score.service';
import { predictiveRiskEngine } from '@/lib/server/services/predictive-risk.engine';
import { earthMindProductionReadinessService } from '@/lib/server/services/earthmind-production-readiness.service';

describe('TASK 15 — Hardened Production Readiness & Behavioral Certification', () => {
  beforeEach(() => {
    cityCommandDecisionService.resetConsumedTokens();
  });

  describe('1. Behavioral Authorization Level Boundaries', () => {
    it('grants authorization ONLY when operator role matches or exceeds required level', () => {
      // OPERATOR (Officer) attempting CITY_COMMANDER level action -> Must fail
      const authOfficer = cityGovernanceAuthorizationService.validateUserAuthorization(
        'OFFICER',
        'CITY_COMMANDER'
      );
      expect(authOfficer.isAuthorized).toBe(false);
      expect(authOfficer.reason?.toLowerCase()).toContain('insufficient');

      // VIEWER attempting SENIOR_OPERATOR level action -> Must fail
      const authViewer = cityGovernanceAuthorizationService.validateUserAuthorization(
        'VIEWER',
        'SENIOR_OPERATOR'
      );
      expect(authViewer.isAuthorized).toBe(false);
      expect(authViewer.reason?.toLowerCase()).toContain('insufficient');

      // COMMANDER attempting CITY_COMMANDER level action -> Must succeed
      const authCommander = cityGovernanceAuthorizationService.validateUserAuthorization(
        'COMMANDER',
        'CITY_COMMANDER'
      );
      expect(authCommander.isAuthorized).toBe(true);
    });

    it('actively rejects unauthorized operator attempting decision execution via service', () => {
      const testCase = memoryCityCommandRepository.createCase({
        title: 'High-Tier Sluice Gate Control',
        description: 'Requires emergency commander',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'ref-task15-cert',
        riskScore: 92,
        riskTier: 'CRITICAL',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'EMERGENCY_COMMANDER',
        recommendation: {
          recommendationId: 'rec-hr-99',
          title: 'Open Sluice Gates',
          summary: 'High volume discharge',
          targetId: 'sluice-01',
          expectedRiskReductionDelta: 85,
          estimatedCostUsd: 15000,
          estimatedDurationHours: 3,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
      });

      // Officer lacks EMERGENCY_COMMANDER clearance
      expect(() => {
        cityCommandDecisionService.processOperatorDecision(
          {
            userId: 'usr-officer-01',
            userName: 'Field Officer',
            role: 'OFFICER',
            authorizationLevel: 'OPERATOR',
          },
          {
            caseId: testCase.caseId,
            decision: 'APPROVE',
            confirmationToken: 'CONFIRM-TOKEN-12345',
            reason: 'Unauthorized field attempt.',
          }
        );
      }).toThrow(/AUTHORIZATION_LEVEL_INSUFFICIENT/);
    });
  });

  describe('2. Real Safety Gateway Decisions on Unsafe Payloads', () => {
    it('blocks action containing autonomous execution flags', () => {
      const unsafeAction = {
        actionId: 'act-unsafe-01',
        title: 'Emergency Auto Sluice Trigger',
        autonomousExecution: true,
        directActuation: true,
      };

      expect(() => {
        earthMindSafetyGatewayService.assertNoAutonomousExecution(unsafeAction);
      }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('blocks action attempting physical live-write actuation', () => {
      const liveWriteAction = {
        actionId: 'act-live-write-02',
        title: 'Hardware Switch Overwrite',
        executionMode: 'PHYSICAL_EXECUTION',
      };

      expect(() => {
        earthMindSafetyGatewayService.assertNoAutonomousExecution(liveWriteAction);
      }).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });

    it('allows genuine advisory recommendation requiring human governance', () => {
      const safeAdvisory = {
        actionId: 'act-safe-03',
        title: 'Advisory Flood Barrier Recommendation',
        advisoryOnly: true,
        requiresHumanApproval: true,
        autonomousExecution: false,
      };

      expect(() => {
        earthMindSafetyGatewayService.assertNoAutonomousExecution(safeAdvisory);
      }).not.toThrow();
    });
  });

  describe('3. Dynamic Resilience & Risk Behavior', () => {
    it('produces distinct, input-sensitive resilience scores under crisis vs calm data scenarios', () => {
      const calmScore = cityResilienceScoreService.calculateCityResilienceScore('city-vja', {
        activeIncidentsCount: 0,
        criticalIncidentsCount: 0,
        preparedness: 90,
      });

      const crisisScore = cityResilienceScoreService.calculateCityResilienceScore('city-vja', {
        activeIncidentsCount: 15,
        criticalIncidentsCount: 5,
        preparedness: 40,
      });

      expect(calmScore.resilienceScore).toBeGreaterThan(crisisScore.resilienceScore);
      expect(crisisScore.resilienceScore).toBeLessThanOrEqual(100);
      expect(crisisScore.resilienceScore).toBeGreaterThanOrEqual(0);
    });

    it('computes predictive risk reflecting multi-factor inputs with explainable contributing factors', async () => {
      const lowRisk = await predictiveRiskEngine.generatePrediction({
        type: 'FLOOD_RISK',
        geographicScopeLevel: 'CITY',
        geographicScopeId: 'vja-01',
        geographicScopeName: 'Vijayawada Low',
        recentIncidentDensity: 2,
        historicalIncidentCount: 1,
        aiVisionConfidence: 80,
        infrastructureAgeYears: 5,
      });

      const highRisk = await predictiveRiskEngine.generatePrediction({
        type: 'FLOOD_RISK',
        geographicScopeLevel: 'CITY',
        geographicScopeId: 'vja-02',
        geographicScopeName: 'Vijayawada High',
        recentIncidentDensity: 95,
        historicalIncidentCount: 20,
        aiVisionConfidence: 95,
        infrastructureAgeYears: 45,
      });

      expect(highRisk.riskScore).toBeGreaterThan(lowRisk.riskScore);
      expect(highRisk.riskScore).toBeLessThanOrEqual(100);
      expect(lowRisk.riskScore).toBeGreaterThanOrEqual(0);
      expect(highRisk.contributingFactors).toBeDefined();
      expect(highRisk.contributingFactors.length).toBeGreaterThan(0);
    });
  });

  describe('4. Production Readiness Certification System Evaluation', () => {
    it('evaluates real system components without synthetic bypasses', () => {
      const cert = earthMindProductionReadinessService.validateProductionReadiness();

      expect(cert.status).toBe('CERTIFIED_PRODUCTION_READY');
      expect(cert.requiresHumanApproval).toBe(true);
      expect(cert.advisoryOnly).toBe(true);
      expect(cert.autonomousExecution).toBe(false);
      expect(cert.summary.failedChecks).toBe(0);
    });
  });
});
