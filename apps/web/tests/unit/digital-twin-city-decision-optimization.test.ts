// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Decision Optimization Unit Test Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCityDecisionOptimizationRepository } from '../../lib/server/repositories/city-decision-optimization.repository';
import { cityInterventionGenerationService } from '../../lib/server/services/city-intervention-generation.service';
import { cityDecisionScoringService } from '../../lib/server/services/city-decision-scoring.service';
import { CityDecisionScenarioService } from '../../lib/server/services/city-decision-scenario.service';
import { cityDecisionObjectiveService, RawCandidateMetrics } from '../../lib/server/services/city-decision-objective.service';
import { cityDecisionOptimizationEngineService } from '../../lib/server/services/city-decision-optimization.service';
import { cityDecisionOrchestratorService } from '../../lib/server/services/city-decision-orchestrator.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { CityDecisionInputDto } from '../../lib/server/domain/digital-twin/city-decision-optimization.domain';

describe('Phase 7.9.3 — Citywide Decision Optimization Suite', () => {
  let repo: MemoryCityDecisionOptimizationRepository;
  let service: CityDecisionScenarioService;

  const sampleInput: CityDecisionInputDto = {
    cityId: 'city-vja',
    scenarioTitle: 'Monsoon Cyclone & Substation Surge Mitigation',
    description: 'Testing decision optimization pipeline for severe flood & grid surge',
    horizon: '6h',
    severityLevel: 'CRITICAL',
    targetDomains: ['CLIMATE', 'UTILITY', 'EMERGENCY_RESPONSE'],
    baseRiskScore: 52.0,
    simulatedPeakRiskScore: 88.5,
    objectives: [
      { objectiveId: 'o1', name: 'Risk Score Reduction', domain: 'CLIMATE', weight: 0.35, targetValue: 30, unit: 'pts', priority: 'CRITICAL' },
      { objectiveId: 'o2', name: 'Population Safety', domain: 'EMERGENCY_RESPONSE', weight: 0.25, targetValue: 30000, unit: 'citizens', priority: 'HIGH' },
    ],
    constraints: [
      { constraintId: 'c1', name: 'Max Available Mobile Generators', domain: 'UTILITY', limitValue: 15, unit: 'units', isHardConstraint: true, isViolated: false },
    ],
  };

  const sampleRawCandidates: RawCandidateMetrics[] = [
    {
      optionId: 'opt-a',
      title: 'Option Alpha: Micro-Grid Islanding',
      riskReduction: 32.5,
      costUsd: 145000,
      downtimeHours: 2.5,
      populationImpact: 28500,
      serviceRestorationPercent: 90,
      resilienceImprovementPercent: 85,
      resourceUtilizationCount: 12,
      confidencePercent: 94.5,
      feasibilityScore: 91.0,
    },
    {
      optionId: 'opt-b',
      title: 'Option Beta: Rapid Transit Rerouting',
      riskReduction: 22.0,
      costUsd: 85000,
      downtimeHours: 1.5,
      populationImpact: 19000,
      serviceRestorationPercent: 80,
      resilienceImprovementPercent: 70,
      resourceUtilizationCount: 8,
      confidencePercent: 91.0,
      feasibilityScore: 88.0,
    },
    {
      optionId: 'opt-c',
      title: 'Option Gamma: Load Shedding & Spillway Switchover',
      riskReduction: 38.0,
      costUsd: 290000,
      downtimeHours: 7.0,
      populationImpact: 35000,
      serviceRestorationPercent: 60,
      resilienceImprovementPercent: 60,
      resourceUtilizationCount: 24,
      confidencePercent: 86.0,
      feasibilityScore: 70.0,
    },
  ];

  beforeEach(() => {
    repo = new MemoryCityDecisionOptimizationRepository();
    service = new CityDecisionScenarioService(repo);
  });

  it('1. Repository behavior: should retrieve seeded default scenario', async () => {
    const seeded = await repo.getScenario('dec-scen-101');
    expect(seeded).not.toBeNull();
    expect(seeded?.cityId).toBe('city-vja');
    expect(seeded?.options.length).toBe(3);
    expect(seeded?.recommendation?.requiresHumanApproval).toBe(true);
  });

  it('2. Candidate generation: should synthesize candidates with requiresHumanApproval: true', async () => {
    const candidates = await cityInterventionGenerationService.generateCandidateInterventions(sampleInput);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    candidates.forEach((opt) => {
      expect(opt.requiresHumanApproval).toBe(true);
      expect(opt.objective).toBeDefined();
      expect(opt.expectedRiskReduction).toBeGreaterThan(0);
      expect(opt.estimatedCostUsd).toBeGreaterThan(0);
    });
  });

  it('3. Objective Weighting & Metric Normalization: should compute normalized metrics in 0.0-1.0 range', () => {
    const norm = cityDecisionObjectiveService.normalizeMetrics(sampleRawCandidates);

    expect(norm.length).toBe(3);
    norm.forEach((n) => {
      expect(n.normRiskReduction).toBeGreaterThanOrEqual(0.0);
      expect(n.normRiskReduction).toBeLessThanOrEqual(1.0);
      expect(n.normCostEfficiency).toBeGreaterThanOrEqual(0.0);
      expect(n.normCostEfficiency).toBeLessThanOrEqual(1.0);
    });

    const weightsRisk = cityDecisionObjectiveService.getWeightsForStrategy('MINIMIZE_RISK');
    expect(weightsRisk.riskReductionWeight).toBe(0.50);

    const weightsCost = cityDecisionObjectiveService.getWeightsForStrategy('MINIMIZE_COST');
    expect(weightsCost.costWeight).toBe(0.45);
  });

  it('4. Multi-Objective Decision Optimization: should rank candidates and handle hard constraint violations', async () => {
    const result = await cityDecisionOptimizationEngineService.optimizeDecisions(
      'scen-test-99',
      sampleRawCandidates,
      'MINIMIZE_COST',
      { maxBudgetUsd: 200000, maxDowntimeHours: 4.0 }
    );

    expect(result.scenarioId).toBe('scen-test-99');
    expect(result.evaluatedCandidates.length).toBe(3);

    // Option C exceeds $200k budget and 4h downtime -> CONSTRAINT_VIOLATION
    const candC = result.evaluatedCandidates.find((c) => c.optionId === 'opt-c');
    expect(candC?.evaluationStatus).toBe('CONSTRAINT_VIOLATION');
    expect(candC?.violatedConstraints?.length).toBeGreaterThan(0);

    // Recommended candidate should be FEASIBLE/RECOMMENDED and preserve requiresHumanApproval: true
    const recommended = result.evaluatedCandidates.find((c) => c.evaluationStatus === 'RECOMMENDED');
    expect(recommended).toBeDefined();
    expect(recommended?.requiresHumanApproval).toBe(true);

    expect(result.recommendationExplanation).toContain('Selected');
    expect(result.requiresHumanApproval).toBe(true);
  });

  it('5. Continuous Intelligence Orchestration: should run full pipeline with 9 explainability answers', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED', { maxBudgetUsd: 250000 });

    expect(context.pipelineExecutionId).toBeDefined();
    expect(context.triggeringSignalsCount).toBeGreaterThan(0);
    expect(context.causalChains.length).toBeGreaterThan(0);
    expect(context.baselineRiskScore).toBeGreaterThan(0);
    expect(context.simulatedPeakRiskScore).toBeGreaterThan(context.baselineRiskScore);
    expect(context.evaluatedCandidateCount).toBe(3);
    expect(context.recommendedCandidate).not.toBeNull();
    expect(context.requiresHumanApproval).toBe(true);
    expect(context.approvalStatus).toBe('PENDING');

    // Verify all 9 explainability questions
    expect(context.explainability.whatHappened).toBeDefined();
    expect(context.explainability.whyIsItRisky).toBeDefined();
    expect(context.explainability.whatCouldHappenNext).toBeDefined();
    expect(context.explainability.whatInterventionsWereConsidered.length).toBeGreaterThan(0);
    expect(context.explainability.whyWasThisInterventionRankedHighest).toContain('ranked #1');
    expect(context.explainability.whatAreTheExpectedBenefits).toBeDefined();
    expect(context.explainability.whatConstraintsExist.length).toBeGreaterThan(0);
    expect(context.explainability.whatUncertaintyExists).toBeDefined();
    expect(context.explainability.whyDoesHumanApprovalRemainNecessary).toContain('Human authorization is mandatory');
  });

  it('6. Human Authorization Enforcement: should record operator approval', async () => {
    const scenario = await service.createAndEvaluateScenario(sampleInput);
    const approved = await service.approveRecommendation(scenario.scenarioId, 'usr-commander-101', 'Approved for action');

    expect(approved.status).toBe('APPROVED');
    expect(approved.recommendation?.approvalStatus).toBe('APPROVED');
    expect(approved.approvalAudit?.userId).toBe('usr-commander-101');
  });

  it('7. AI Agent Tools: should have all 11 Phase 7.9.3 decision tools registered', async () => {
    const tools = [
      'city_decision_overview',
      'city_decision_scenario',
      'city_intervention_generation',
      'city_decision_scoring',
      'city_decision_constraints',
      'city_decision_recommendation',
      'city_decision_optimization',
      'city_decision_objective_analysis',
      'city_decision_candidate_ranking',
      'city_decision_constraint_analysis',
      'city_decision_pipeline_orchestrator',
    ];

    for (const toolId of tools) {
      const def = toolRegistry.getTool(toolId);
      expect(def).toBeDefined();

      const result = await def!.handler({});
      expect(result.dataSource).toBe('SIMULATION');
      expect(result.requiresHumanApproval).toBe(true);
    }
  });
});
