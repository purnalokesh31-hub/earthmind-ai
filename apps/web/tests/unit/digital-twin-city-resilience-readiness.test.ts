import { describe, it, expect, beforeEach } from 'vitest';
import { memoryCityResilienceReadinessRepository } from '../../lib/server/repositories/city-resilience-readiness.repository';
import { cityResilienceReadinessService } from '../../lib/server/services/city-resilience-readiness.service';
import { cityResilienceGapService } from '../../lib/server/services/city-resilience-gap.service';
import { cityResilienceResourceReadinessService } from '../../lib/server/services/city-resilience-resource-readiness.service';
import { cityPreparednessOptionService } from '../../lib/server/services/city-preparedness-option.service';
import { cityResilienceReadinessComparisonService } from '../../lib/server/services/city-resilience-readiness-comparison.service';
import { cityResilienceReadinessOrchestratorService } from '../../lib/server/services/city-resilience-readiness-orchestrator.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.11 — Citywide Resilience Coordination & Preparedness Intelligence', () => {
  const repo = memoryCityResilienceReadinessRepository;

  beforeEach(() => {
    // Repository starts with seeded default assessment
  });

  // 1. Domain Models & Assessment
  describe('Domain Models & Preparedness Assessment Engine', () => {
    it('creates resilience readiness assessment in DRAFT status with safety invariants', () => {
      const created = repo.createReadiness({
        cityId: 'city-vja',
        title: 'Benz Circle Substation Preparedness',
        description: 'Readiness evaluation for high rainfall event.',
      });

      expect(created.status).toBe('DRAFT');
      expect(created.requiresHumanApproval).toBe(true);
      expect(created.advisoryOnly).toBe(true);
      expect(created.autonomousExecution).toBe(false);
      expect(created.provenance).toBe('RESILIENCE_PREPAREDNESS');
    });

    it('evaluates preparedness across 6 domains (Climate, Mobility, Transit, Utility, Emergency, Citizen)', () => {
      const evaluated = cityResilienceReadinessService.evaluateCityPreparedness('res-readiness-101');
      expect(evaluated.domains.length).toBe(6);
      expect(evaluated.scores.overallReadinessScore).toBeGreaterThan(0);
      expect(evaluated.status).toBe('ASSESSED');
    });
  });

  // 2. Resource Readiness & UNKNOWN Status Rules
  describe('Resource Readiness & UNKNOWN Handling', () => {
    it('evaluates resource readiness and preserves UNKNOWN status without converting to AVAILABLE', () => {
      const resources = cityResilienceResourceReadinessService.evaluateResourceReadiness('res-readiness-101');
      const unk = resources.find((r) => r.category === 'MOBILE_GENERATOR');

      expect(unk).toBeDefined();
      expect(unk?.availabilityStatus).toBe('UNKNOWN'); // Must NOT be AVAILABLE
      expect(unk?.isUncertain).toBe(true);
    });

    it('detects capability gaps including DATA_CONFIDENCE_GAP for UNKNOWN resources', () => {
      const gaps = cityResilienceGapService.detectCapabilityGaps('res-readiness-101');
      expect(gaps.length).toBeGreaterThan(0);
      const confGap = gaps.find((g) => g.gapType === 'DATA_CONFIDENCE_GAP');
      expect(confGap).toBeDefined();
      expect(confGap?.requiresHumanApproval).toBe(true);
    });
  });

  // 3. Preparedness Options & Comparison Engine
  describe('Preparedness Options & Comparison Engine', () => {
    it('generates multiple advisory preparedness strategy options', () => {
      const options = cityPreparednessOptionService.generatePreparednessOptions('res-readiness-101');
      expect(options.length).toBe(3);
      expect(options.some((o) => o.strategy === 'BALANCED_READINESS')).toBe(true);
      expect(options.every((o) => o.requiresHumanApproval)).toBe(true);
    });

    it('produces explainable comparison matrix and identifies recommended option', () => {
      const comparison = cityResilienceReadinessComparisonService.comparePreparednessOptions('res-readiness-101');
      expect(comparison.comparisonMatrix.length).toBe(3);
      expect(comparison.recommendedOptionId).toBeDefined();
    });
  });

  // 4. Master Orchestration & Human Authorization
  describe('Master Orchestration Pipeline & Human Authorization', () => {
    it('runs master orchestration pipeline returning advisory recommendation', () => {
      const result = cityResilienceReadinessOrchestratorService.runMasterReadinessOrchestration({
        cityId: 'city-vja',
        title: 'Orchestrated Preparedness Run',
        description: 'Testing orchestrator pipeline.',
      });

      expect(result.status).toBe('VALIDATED');
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation?.requiresHumanApproval).toBe(true);
      expect(result.recommendation?.advisoryOnly).toBe(true);
      expect(result.recommendation?.autonomousExecution).toBe(false);
    });

    it('saves human approval decision and blocks duplicate decision attempts (RESILIENCE_DECISION_ALREADY_DECIDED)', () => {
      const created = repo.createReadiness({
        cityId: 'city-vja',
        title: 'Duplicate Approval Test',
        description: 'Testing approval duplication protection.',
      });

      // First decision: APPROVED
      repo.saveApproval({
        approvalId: 'appr-dup-1',
        readinessId: created.id,
        recommendationId: 'rec-1',
        userId: 'usr-op-1',
        decision: 'APPROVED',
        timestamp: new Date().toISOString(),
        requiresHumanApproval: true,
      });

      repo.updateStatus(created.id, 'APPROVED', 'usr-op-1');

      // Second decision attempt (Should fail with RESILIENCE_DECISION_ALREADY_DECIDED)
      expect(() =>
        repo.updateStatus(created.id, 'REJECTED', 'usr-op-1')
      ).toThrow(/RESILIENCE_DECISION_ALREADY_DECIDED/);
    });
  });

  // 5. AI Agent Tool Registry Compliance
  describe('AI Agent Tools & Safety Invariant Compliance', () => {
    it('verifies resilience readiness AI tools return read-only advisory responses with requiresHumanApproval=true', async () => {
      const tool = toolRegistry.getTool('city_resilience_readiness_overview');
      expect(tool).toBeDefined();
      expect(tool?.readOnly).toBe(true);

      const result = await toolRegistry.invokeTool('city_resilience_readiness_overview', {});
      const parsed = JSON.parse(result.outputSummary);
      expect(parsed.requiresHumanApproval).toBe(true);
      expect(parsed.humanActionRequired).toBe(true);
      expect(parsed.advisoryOnly).toBe(true);
      expect(parsed.autonomousExecution).toBe(false);
    });

    it('verifies summary metrics assert safety invariants', () => {
      const summary = repo.getSummary();
      expect(summary.requiresHumanApproval).toBe(true);
      expect(summary.advisoryOnly).toBe(true);
      expect(summary.autonomousExecution).toBe(false);
      expect(summary.provenance).toBe('RESILIENCE_PREPAREDNESS');
    });
  });
});
