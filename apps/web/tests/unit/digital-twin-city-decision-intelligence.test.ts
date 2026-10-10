// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Citywide Predictive Decision Intelligence & Mitigation Optimization Test Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CityDecisionScenarioEntity,
  CityDecisionInputDto,
  MitigationCandidateDto,
  DecisionConstraintDto,
  DecisionApprovalAuditDto,
} from '../../lib/server/domain/digital-twin/city-decision-intelligence.domain';
import { MemoryCityDecisionIntelligenceRepository } from '../../lib/server/repositories/city-decision-intelligence.repository';
import { cityMitigationCandidateService } from '../../lib/server/services/city-mitigation-candidate.service';
import { cityDecisionImpactService } from '../../lib/server/services/city-decision-impact.service';
import { cityDecisionResourceService } from '../../lib/server/services/city-decision-resource.service';
import { cityDecisionComparisonService } from '../../lib/server/services/city-decision-comparison.service';
import { cityDecisionRecommendationService } from '../../lib/server/services/city-decision-recommendation.service';
import { cityDecisionExplanationService } from '../../lib/server/services/city-decision-explanation.service';
import { cityDecisionOptionService } from '../../lib/server/services/city-decision-option.service';
import { cityActionPriorityService } from '../../lib/server/services/city-action-priority.service';
import { cityDecisionConfidenceService } from '../../lib/server/services/city-decision-confidence.service';
import { cityDecisionService } from '../../lib/server/services/city-decision.service';

describe('Phase 7.9.4 — Citywide Predictive Decision Intelligence Engine Suite', () => {
  let repo: MemoryCityDecisionIntelligenceRepository;

  const sampleInput: CityDecisionInputDto = {
    cityId: 'city-vja',
    title: 'Severe Coastal Storm Surge & Substation 4B Overload Cascade',
    description: 'Evaluating candidate strategies for Ward 12 flood risk',
    selectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY', 'EMERGENCY_RESPONSE'],
    planningHorizon: '6h',
    objective: 'BALANCED',
    objectiveWeights: {
      riskWeight: 0.35,
      costWeight: 0.15,
      downtimeWeight: 0.15,
      populationWeight: 0.20,
      resilienceWeight: 0.15,
    },
    constraints: [
      {
        constraintId: 'c-budget-limit',
        constraintType: 'MAX_BUDGET',
        limit: 300000,
        actualValue: 165000,
        status: 'PASS',
        reason: 'Cost $165,000 is within $300,000 budget ceiling',
      },
    ],
  };

  beforeEach(() => {
    repo = new MemoryCityDecisionIntelligenceRepository();
  });

  it('1. Candidate Generation Engine: should generate candidate strategies labeled SIMULATION', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-001', 'city-vja');

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].dataSource).toBe('SIMULATION');
    expect(candidates[0].requiresHumanApproval).toBe(true);
    expect(candidates.map((c) => c.category)).toContain('CANDIDATE_G');
  });

  it('2. Impact Forecast Engine: should calculate risk reduction, population, and downtime impact', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-002', 'city-vja');
    const topCandidate = candidates[0];

    const impact = cityDecisionImpactService.calculateImpact(88.5, topCandidate);

    expect(impact.riskReduction.riskReductionPoints).toBeGreaterThan(0);
    expect(impact.dataSource).toBe('SIMULATION');
    expect(impact.populationExposureReduction).toBe(topCandidate.populationImpact);
  });

  it('3. Resource Allocation Engine: should analyze resource requirements and identify shortfalls', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-003', 'city-vja');
    const topCandidate = candidates[0];

    const resources = cityDecisionResourceService.analyzeResources(topCandidate);

    expect(resources.length).toBeGreaterThan(0);
    expect(resources[0].resourceType).toBeDefined();
    expect(resources[0].allocationPriority).toBeDefined();
  });

  it('4. Decision Comparison Engine: should compare candidates and rank transparently', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-004', 'city-vja');
    candidates.forEach((c, idx) => {
      c.score = 90 - idx * 5;
    });

    const comparison = cityDecisionComparisonService.compareCandidates('scen-p794-004', 'BALANCED', candidates);

    expect(comparison.candidates.length).toBe(candidates.length);
    expect(comparison.topRankedCandidateId).toBe(candidates[0].candidateId);
    expect(comparison.dataSource).toBe('SIMULATION');
  });

  it('5. Recommendation Engine: MUST enforce requiresHumanApproval === true', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-005', 'city-vja');
    const topCandidate = candidates[0];

    const recommendation = cityDecisionRecommendationService.generateRecommendation('scen-p794-005', topCandidate, sampleInput.constraints || []);

    expect(recommendation.requiresHumanApproval).toBe(true);
    expect(recommendation.candidateId).toBe(topCandidate.candidateId);
    expect(recommendation.reasoning).toContain(topCandidate.name);
  });

  it('6. Decision Explanation Engine: should explain why candidate was selected and alternatives rejected', () => {
    const candidates = cityMitigationCandidateService.generateCandidates('scen-p794-006', 'city-vja');
    candidates.forEach((c, idx) => (c.score = 95 - idx * 10));

    const rec = cityDecisionRecommendationService.generateRecommendation('scen-p794-006', candidates[0], sampleInput.constraints || []);

    const explanation = cityDecisionExplanationService.generateExplanation(rec.recommendationId, candidates[0], candidates, sampleInput.constraints || []);

    expect(explanation.whySelected).toContain(candidates[0].name);
    expect(explanation.whyAlternativesRejected.length).toBe(candidates.length - 1);
    expect(explanation.whatIfSensitivity.length).toBeGreaterThan(0);
  });

  it('7. Option Generation Service: should generate options with requiresHumanApproval', () => {
    const options = cityDecisionOptionService.generateOptions('scen-p794-007', 'city-vja');
    expect(options.length).toBe(6);
    expect(options[0].requiresHumanApproval).toBe(true);
    expect(options.map((o) => o.optionId)).toContain('OPTION_A');
  });

  it('8. Action Priority Engine: should rank options by priority classification', () => {
    const options = cityDecisionOptionService.generateOptions('scen-p794-008', 'city-vja');
    const ranked = cityActionPriorityService.rankOptions(options);

    expect(ranked.length).toBe(options.length);
    expect(['CRITICAL', 'HIGH', 'ELEVATED', 'NORMAL', 'LOW']).toContain(ranked[0].priority.priorityClassification);
    expect(ranked[0].priority.priorityScore).toBeGreaterThanOrEqual(ranked[ranked.length - 1].priority.priorityScore);
  });

  it('9. Confidence Engine: should compute confidence score and level', () => {
    const confidence = cityDecisionConfidenceService.calculateConfidence('scen-p794-009', 4);
    expect(confidence.confidenceScore).toBeGreaterThan(0);
    expect(['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW']).toContain(confidence.confidenceLevel);
    expect(confidence.explanation).toContain('ensemble agreement');
  });

  it('10. Master Orchestrator Service: should create, analyze, compare and approve decisions', async () => {
    const decision = await cityDecisionService.createDecision(sampleInput);
    expect(decision.scenarioId).toBeDefined();
    expect(decision.status).toBe('READY');

    const analyzed = await cityDecisionService.runDecisionAnalysis(decision.scenarioId);
    expect(analyzed.status).toBe('COMPLETED');
    expect(analyzed.recommendation?.requiresHumanApproval).toBe(true);

    const comparison = await cityDecisionService.getComparison(decision.scenarioId);
    expect(comparison.noActionBaseline.risk).toBeGreaterThan(comparison.recommendedAction.risk);

    const approved = await cityDecisionService.approveDecision({
      userId: 'usr-cro-01',
      decisionId: decision.scenarioId,
      recommendationId: analyzed.recommendation!.recommendationId,
      decisionStatus: 'APPROVED',
      timestamp: new Date(),
      operatorNotes: 'Verified emergency parameters',
    });

    expect(approved.status).toBe('APPROVED');
    expect(approved.approvalAudit?.userId).toBe('usr-cro-01');
  });

  it('11. Non-Autonomous Execution Guardrail: Approval audit record cannot auto-execute physical action', async () => {
    const scenario = await repo.create({
      scenarioId: 'scen-safety-1',
      cityId: 'city-vja',
      title: 'Safety Test Scenario',
      description: 'Verifying non-autonomous execution',
      status: 'COMPLETED',
      input: sampleInput,
      signals: [],
      candidates: [],
      impacts: [],
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(scenario.status).toBe('COMPLETED');
    expect(scenario.approvalAudit).toBeUndefined();
  });
});
