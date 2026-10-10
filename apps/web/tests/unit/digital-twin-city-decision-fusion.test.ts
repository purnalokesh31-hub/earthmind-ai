// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 3/6 Unit & Integration Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityDecisionMasterService } from '@/lib/server/services/city-decision-master.service';
import { cityDecisionFusionService } from '@/lib/server/services/city-decision-fusion.service';
import { cityDecisionCandidateService } from '@/lib/server/services/city-decision-candidate.service';
import { cityDecisionConstraintService } from '@/lib/server/services/city-decision-constraint.service';
import { cityDecisionOptimizationService } from '@/lib/server/services/city-decision-optimization.service';
import { memoryCityDecisionRepository } from '@/lib/server/repositories/city-decision.repository';
import { toolRegistry } from '@/lib/server/ai-agents/tool-registry';

describe('Phase 7.10 Mega Prompt 3/6 Citywide Decision Fusion & Optimization', () => {
  describe('Signal Fusion & Data Provenance', () => {
    it('should fuse multi-domain signals with data provenance labels', () => {
      const signals = cityDecisionFusionService.fuseSignals('city-vja');
      expect(signals.length).toBeGreaterThanOrEqual(5);
      expect(signals[0].domain).toBe('CLIMATE');
      expect(signals[0].dataSource).toBe('SIMULATION');
      expect(signals[1].dataSource).toBe('LIVE_TELEMETRY');
    });
  });

  describe('Candidate Generation & Constraint Evaluation', () => {
    it('should generate advisory candidate actions and evaluate constraints', () => {
      const signals = cityDecisionFusionService.fuseSignals('city-vja');
      const candidates = cityDecisionCandidateService.generateCandidates(signals);

      expect(candidates.length).toBeGreaterThanOrEqual(4);
      expect(candidates[0].requiresHumanApproval).toBe(true);

      const evalResult = cityDecisionConstraintService.evaluateConstraints(candidates[0]);
      expect(evalResult.feasibilityStatus).toBe('FEASIBLE');
      expect(evalResult.constraints.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Multi-Objective Optimization & Scoring', () => {
    it('should score candidates according to configurable objective weights', () => {
      const signals = cityDecisionFusionService.fuseSignals('city-vja');
      const candidates = cityDecisionCandidateService.generateCandidates(signals);
      const weights = cityDecisionOptimizationService.getObjectiveWeights('BALANCED');

      const score = cityDecisionOptimizationService.scoreCandidate(candidates[0], weights);
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.riskReductionScore).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Decision Pipeline & Human Governance', () => {
    it('should run end-to-end decision pipeline and generate explainable recommendation', async () => {
      const decision = await cityDecisionMasterService.runDecisionPipeline({ cityId: 'city-vja', objectiveMode: 'BALANCED' });

      expect(decision.id).toBeDefined();
      expect(decision.requiresHumanApproval).toBe(true);
      expect(decision.dataSource).toBe('SIMULATION');
      expect(decision.recommendation).toBeDefined();
      expect(decision.recommendation?.confidencePercent).toBeGreaterThan(80);

      const approved = await cityDecisionMasterService.approveDecision(decision.id, 'usr-op-1', 'Commander Alpha', 'APPROVED', 'Verified power isolation');
      expect(approved?.status).toBe('APPROVED');
    });
  });

  describe('Mega Prompt 3/6 AI Agent Tools', () => {
    const fusionTools = [
      'city_decision_overview',
      'city_decision_signal_fusion',
      'city_mitigation_candidates',
      'city_decision_constraint_analysis',
      'city_decision_resource_analysis',
      'city_decision_impact',
      'city_decision_compare',
      'city_decision_explanation',
      'city_decision_history',
      'city_decision_approval',
    ];

    it('should have all 10 Mega Prompt 3/6 AI tools registered', () => {
      for (const toolId of fusionTools) {
        const tool = toolRegistry.getTool(toolId);
        expect(tool).toBeDefined();
      }
    });

    it('should invoke AI tools and verify safety rules', async () => {
      for (const toolId of fusionTools) {
        const res = await toolRegistry.invokeTool(toolId, { decisionId: 'dec-101' });
        expect(res.status).toBe('SUCCESS');
        const output = JSON.parse(res.outputSummary);
        expect(output.dataSource).toBe('SIMULATION');
        expect(output.requiresHumanApproval).toBe(true);
      }
    });
  });
});
