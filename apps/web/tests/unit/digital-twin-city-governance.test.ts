import { describe, it, expect, beforeEach } from 'vitest';
import { memoryCityGovernanceRepository } from '../../lib/server/repositories/city-governance.repository';
import { cityGovernanceRiskPolicyService } from '../../lib/server/services/city-governance-risk-policy.service';
import { cityGovernanceConfidenceService } from '../../lib/server/services/city-governance-confidence.service';
import { cityGovernanceAuthorizationService } from '../../lib/server/services/city-governance-authorization.service';
import { cityGovernancePolicyService } from '../../lib/server/services/city-governance-policy.service';
import { cityGovernanceEscalationService } from '../../lib/server/services/city-governance-escalation.service';
import { cityGovernanceEvaluationService } from '../../lib/server/services/city-governance-evaluation.service';

describe('Phase 7.11 — Citywide Intelligence Governance & Policy Engine', () => {
  const repo = memoryCityGovernanceRepository;

  beforeEach(() => {
    // Repository starts with default seeded policies
  });

  // 1. Policy Lifecycle & Repository
  describe('Policy Lifecycle & Repository', () => {
    it('seeds default governance policies on initialization', () => {
      const active = repo.listPolicies('ACTIVE');
      expect(active.length).toBeGreaterThanOrEqual(2);
      expect(active.some((p) => p.policyId === 'pol-gov-human-auth')).toBe(true);
    });

    it('creates a new draft policy with immutable versioning', () => {
      const created = repo.createPolicy({
        name: 'Custom Noise & Environmental Risk Policy',
        description: 'Enforces decibel limits during night hours.',
        category: 'SAFETY',
        priority: 60,
      });

      expect(created.status).toBe('DRAFT');
      expect(created.version).toBe(1);
      expect(created.requiresHumanApproval).toBe(true);

      const fetched = repo.getPolicy(created.policyId);
      expect(fetched?.name).toBe('Custom Noise & Environmental Risk Policy');
    });

    it('validates lifecycle transitions and rejects invalid state changes', () => {
      const policy = repo.createPolicy({
        name: 'Transition Test Policy',
        description: 'Test policy',
        category: 'OPERATIONAL',
      });

      // Valid: DRAFT -> ACTIVE
      const active = repo.setPolicyStatus(policy.policyId, 'ACTIVE', 'usr-admin-1');
      expect(active.status).toBe('ACTIVE');

      // Invalid: ACTIVE -> DRAFT
      expect(() => repo.setPolicyStatus(policy.policyId, 'DRAFT', 'usr-admin-1')).toThrow(
        /Invalid policy lifecycle transition/
      );
    });
  });

  // 2. Risk Classification Engine
  describe('Risk Threshold Engine', () => {
    it('classifies risk score correctly across all 5 risk tiers', () => {
      const low = cityGovernanceRiskPolicyService.classifyRisk(15);
      expect(low.riskTier).toBe('LOW');
      expect(low.defaultAuthorizationLevel).toBe('OPERATOR');

      const guarded = cityGovernanceRiskPolicyService.classifyRisk(35);
      expect(guarded.riskTier).toBe('GUARDED');
      expect(guarded.defaultAuthorizationLevel).toBe('SENIOR_OPERATOR');

      const elevated = cityGovernanceRiskPolicyService.classifyRisk(55);
      expect(elevated.riskTier).toBe('ELEVATED');
      expect(elevated.defaultAuthorizationLevel).toBe('DOMAIN_MANAGER');

      const high = cityGovernanceRiskPolicyService.classifyRisk(75);
      expect(high.riskTier).toBe('HIGH');
      expect(high.defaultAuthorizationLevel).toBe('CITY_COMMANDER');

      const critical = cityGovernanceRiskPolicyService.classifyRisk(95);
      expect(critical.riskTier).toBe('CRITICAL');
      expect(critical.defaultAuthorizationLevel).toBe('EMERGENCY_COMMANDER');
    });
  });

  // 3. Intelligence Confidence Engine
  describe('Confidence Evaluation Engine', () => {
    it('evaluates intelligence confidence levels and recommended governance actions', () => {
      const high = cityGovernanceConfidenceService.evaluateConfidence(90, 4, 3);
      expect(high.confidenceLevel).toBe('HIGH_CONFIDENCE');
      expect(high.recommendedGovernanceAction).toBe('NORMAL_ADVISORY');

      const low = cityGovernanceConfidenceService.evaluateConfidence(45, 3, 3);
      expect(low.confidenceLevel).toBe('LOW_CONFIDENCE');
      expect(low.recommendedGovernanceAction).toBe('MANDATORY_OPERATOR_REVIEW');

      const insufficient = cityGovernanceConfidenceService.evaluateConfidence(20, 1, 3);
      expect(insufficient.confidenceLevel).toBe('INSUFFICIENT_CONFIDENCE');
      expect(insufficient.recommendedGovernanceAction).toBe('BLOCK_RECOMMENDATION');
      expect(insufficient.missingEvidence.length).toBeGreaterThan(0);
    });
  });

  // 4. Human Authorization Requirement Engine
  describe('Authorization Requirement Engine', () => {
    it('maps impact severity to required human authorization role', () => {
      const reqLow = cityGovernanceAuthorizationService.determineRequiredAuthorization('LOW', 1, 100, 50);
      expect(reqLow.requiredAuthorizationLevel).toBe('OPERATOR');

      const reqCritical = cityGovernanceAuthorizationService.determineRequiredAuthorization('CRITICAL', 4, 250000, 75000);
      expect(reqCritical.requiredAuthorizationLevel).toBe('EMERGENCY_COMMANDER');
      expect(reqCritical.requiresDoubleSignOff).toBe(true);
    });

    it('validates user role authorization against required level using the real RoleType enum', () => {
      // COMMANDER maps to CITY_COMMANDER-tier authorization — sufficient for a CITY_COMMANDER requirement.
      const valid = cityGovernanceAuthorizationService.validateUserAuthorization('COMMANDER', 'CITY_COMMANDER');
      expect(valid.isAuthorized).toBe(true);

      // ANALYST maps to the lowest tier (OPERATOR) — insufficient for a CITY_COMMANDER requirement.
      const invalid = cityGovernanceAuthorizationService.validateUserAuthorization('ANALYST', 'CITY_COMMANDER');
      expect(invalid.isAuthorized).toBe(false);

      // SYSTEM_ADMIN always satisfies the highest tier.
      const admin = cityGovernanceAuthorizationService.validateUserAuthorization('SYSTEM_ADMIN', 'EMERGENCY_COMMANDER');
      expect(admin.isAuthorized).toBe(true);

      // A role string that isn't a real RoleType value must fail closed (lowest tier), not be
      // silently trusted — guards against the exact bug this test previously masked.
      const unknownRole = cityGovernanceAuthorizationService.validateUserAuthorization('CITY_COMMANDER', 'SENIOR_OPERATOR');
      expect(unknownRole.isAuthorized).toBe(false);
    });
  });

  // 5. Master Governance Evaluation Pipeline
  describe('Master Governance Evaluation Pipeline', () => {
    it('evaluates target and returns comprehensive explainable governance decision', () => {
      const evalResult = cityGovernanceEvaluationService.evaluateGovernancePipeline({
        targetId: 'target-plan-101',
        cityId: 'city-vja',
        riskScore: 78,
        confidenceScorePercent: 88,
        availableEvidenceCount: 4,
        impactedDomains: ['CLIMATE', 'MOBILITY', 'UTILITY'],
        populationImpactCount: 25000,
        financialImpactUsd: 45000,
      });

      expect(evalResult.riskTier).toBe('HIGH');
      expect(evalResult.confidenceLevel).toBe('HIGH_CONFIDENCE');
      expect(evalResult.escalationLevel).toBe('CITY_COMMANDER');
      expect(evalResult.requiredAuthorizationLevel).toBe('CITY_COMMANDER');
      expect(evalResult.requiresHumanApproval).toBe(true);
      expect(evalResult.provenance).toBe('GOVERNANCE');
    });

    it('blocks evaluation if input attempts to set requiresHumanApproval=false', () => {
      const evalResult = cityGovernanceEvaluationService.evaluateGovernancePipeline({
        targetId: 'unsafe-target-1',
        cityId: 'city-vja',
        riskScore: 30,
        confidenceScorePercent: 95,
        requiresHumanApproval: false, // Malicious attempt to bypass human approval
      });

      expect(evalResult.governanceDecision).toBe('BLOCK');
      expect(evalResult.violations.some((v) => v.category === 'HUMAN_AUTHORIZATION')).toBe(true);
    });
  });

  // 6. Controlled Policy Override Engine
  describe('Controlled Policy Override Engine', () => {
    it('records controlled override and preserves requiresHumanApproval=true', () => {
      const override = repo.recordOverride({
        overrideId: 'ovr-test-1',
        policyId: 'pol-gov-risk-tiering',
        evaluationId: 'eval-1',
        operatorUserId: 'usr-senior-op',
        authorizationLevel: 'SENIOR_OPERATOR',
        reason: 'Temporary traffic signal manual override due to VIP corridor.',
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        auditReference: 'aud-ovr-1',
        requiresHumanApproval: true,
      });

      expect(override.requiresHumanApproval).toBe(true);
      const overrides = repo.getOverrides();
      expect(overrides.length).toBeGreaterThan(0);
    });
  });

  // 7. Non-Negotiable Safety & Governance Invariants
  describe('Safety & Governance Invariants', () => {
    it('enforces requiresHumanApproval=true across all summary metrics', () => {
      const summary = repo.getSummary();
      expect(summary.requiresHumanApproval).toBe(true);
      expect(summary.provenance).toBe('GOVERNANCE');
    });

    it('preserves data provenance and never claims real-world autonomous execution', () => {
      const activePolicies = repo.listPolicies();
      activePolicies.forEach((p) => {
        expect(p.requiresHumanApproval).toBe(true);
        expect(p.provenance).toBe('GOVERNANCE');
      });
    });
  });
});
