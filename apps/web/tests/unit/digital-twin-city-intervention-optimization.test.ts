// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Citywide Intervention Generation & Multi-Objective Optimization Unit Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  CityInterventionInputDto,
  CityInterventionOptionDto,
  CityInterventionConstraintDto,
} from '../../lib/server/domain/digital-twin/city-intervention.domain';
import { cityInterventionConstraintService } from '../../lib/server/services/city-intervention-constraint.service';
import { cityInterventionOptimizationService } from '../../lib/server/services/city-intervention-optimization.service';
import { cityInterventionService } from '../../lib/server/services/city-intervention.service';

describe('Phase 7.9.4 — Candidate Generation & Multi-Objective Optimization Engine Suite', () => {
  const baseInput: CityInterventionInputDto = {
    cityId: 'city-vja',
    sourcePredictionId: 'pred-101',
    sourceSimulationId: 'sim-202',
    selectedDomains: ['CLIMATE', 'UTILITY', 'MOBILITY'],
    planningHorizon: '6h',
    optimizationObjective: 'BALANCED',
    operationalConstraints: [
      {
        constraintId: 'c-budget-01',
        constraintType: 'MAX_BUDGET',
        name: 'Budget Limit',
        limitValue: 200000,
        unit: 'USD',
        status: 'PASS',
      },
    ],
  };

  it('1. Candidate Generation: should generate multiple deterministic candidates with unique IDs', () => {
    const candidates = cityInterventionOptimizationService.generateCandidateOptions(baseInput);

    expect(candidates.length).toBeGreaterThanOrEqual(4);
    const ids = candidates.map((c) => c.candidateId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(candidates.length);

    // Deterministic re-generation check
    const candidates2 = cityInterventionOptimizationService.generateCandidateOptions(baseInput);
    expect(candidates2).toEqual(candidates);
  });

  it('2. Objective Modes: MINIMIZE_COST should prioritize lower cost candidate', () => {
    const costInput: CityInterventionInputDto = {
      ...baseInput,
      optimizationObjective: 'MINIMIZE_COST',
      operationalConstraints: [],
    };

    const res = cityInterventionOptimizationService.optimize('scen-cost-01', costInput);
    expect(res.status).toBe('OPTIMAL');
    expect(res.recommendedCandidateId).toBe('cand-gamma-emergency-corridors'); // Cost $65,000 (lowest)
  });

  it('3. Objective Modes: MINIMIZE_RESPONSE_TIME should prioritize fastest candidate', () => {
    const timeInput: CityInterventionInputDto = {
      ...baseInput,
      optimizationObjective: 'MINIMIZE_RESPONSE_TIME',
      operationalConstraints: [],
    };

    const res = cityInterventionOptimizationService.optimize('scen-time-01', timeInput);
    expect(res.status).toBe('OPTIMAL');
    expect(res.recommendedCandidateId).toBe('cand-gamma-emergency-corridors'); // Response time 1.0h (fastest)
  });

  it('4. Objective Modes: MINIMIZE_RISK should prioritize candidate with highest risk reduction', () => {
    const riskInput: CityInterventionInputDto = {
      ...baseInput,
      optimizationObjective: 'MINIMIZE_RISK',
      operationalConstraints: [],
    };

    const res = cityInterventionOptimizationService.optimize('scen-risk-01', riskInput);
    expect(res.status).toBe('OPTIMAL');
    expect(res.recommendedCandidateId).toBe('cand-delta-balanced-multi-domain'); // Risk reduction 42.0 pts (highest)
  });

  it('5. Objective Modes: BALANCED should produce aggregated multi-objective ranking', () => {
    const res = cityInterventionOptimizationService.optimize('scen-bal-01', baseInput);
    expect(res.status).toBe('OPTIMAL');
    expect(res.feasibleCandidates.length).toBeGreaterThan(0);
    expect(res.feasibleCandidates[0].rank).toBe(1);
    expect(res.feasibleCandidates[0].score).toBeGreaterThan(0);
  });

  it('6. Weight Normalization: should normalize custom weights to sum to 1.0', () => {
    const normalized = cityInterventionOptimizationService.normalizeWeights(
      { costWeight: 2, responseTimeWeight: 2, populationImpactWeight: 2, riskReductionWeight: 2, resourceWeight: 2 },
      'BALANCED'
    );

    const sum = normalized.costWeight + normalized.responseTimeWeight + normalized.populationImpactWeight + normalized.riskReductionWeight + normalized.resourceWeight;
    expect(sum).toBeCloseTo(1.0, 4);
    expect(normalized.costWeight).toBeCloseTo(0.2, 4);
  });

  it('7. Constraint Evaluation: should classify PASS (<80%), WARNING (80-100%), and VIOLATION (>100%)', () => {
    const customConstraints: CityInterventionConstraintDto[] = [
      {
        constraintId: 'c-strict-budget',
        constraintType: 'MAX_BUDGET',
        name: 'Strict Budget',
        limitValue: 100000, // cand-gamma ($65k => 65% PASS), cand-alpha ($85k => 85% WARNING), cand-beta ($145k => 145% VIOLATION)
        currentValue: 0,
        unit: 'USD',
        type: 'MAX_BUDGET',
        isViolated: false,
        status: 'PASS',
        severity: 'MINOR',
        affectedActionIds: [],
        remediationSuggestion: 'Reduce candidate scope or increase available budget.',
      },
    ];

    const candidates = cityInterventionOptimizationService.generateCandidateOptions(baseInput);
    const evalRes = cityInterventionConstraintService.evaluateConstraints(candidates, customConstraints);

    const candGamma = evalRes.evaluatedOptions.find((c) => c.candidateId === 'cand-gamma-emergency-corridors');
    const candAlpha = evalRes.evaluatedOptions.find((c) => c.candidateId === 'cand-alpha-rapid-mobility');
    const candBeta = evalRes.evaluatedOptions.find((c) => c.candidateId === 'cand-beta-utility-microgrid');

    expect(candGamma?.constraintStatus).toBe('PASS');
    expect(candAlpha?.constraintStatus).toBe('WARNING');
    expect(candBeta?.constraintStatus).toBe('VIOLATION');
  });

  it('8. Feasibility & Infeasible Candidate Exclude: VIOLATION candidates must not be recommended', () => {
    const tightBudgetInput: CityInterventionInputDto = {
      ...baseInput,
      operationalConstraints: [
        {
          constraintId: 'c-tight-budget',
          constraintType: 'MAX_BUDGET',
          name: 'Tight Budget',
          limitValue: 90000, // Only cand-gamma ($65k) and cand-alpha ($85k) pass/warning
          unit: 'USD',
          status: 'PASS',
        },
      ],
    };

    const res = cityInterventionOptimizationService.optimize('scen-tight-01', tightBudgetInput);

    expect(res.infeasibleCandidates.length).toBeGreaterThan(0);
    expect(res.infeasibleCandidates.map((c) => c.candidateId)).toContain('cand-delta-balanced-multi-domain'); // Cost $210k
    expect(res.recommendedCandidateId).not.toBe('cand-delta-balanced-multi-domain');
  });

  it('9. All Candidates Infeasible Edge Case: should return NO_FEASIBLE_INTERVENTION status', () => {
    const impossibleInput: CityInterventionInputDto = {
      ...baseInput,
      operationalConstraints: [
        {
          constraintId: 'c-impossible-budget',
          constraintType: 'MAX_BUDGET',
          name: 'Impossible Budget',
          limitValue: 1000, // All candidates cost >= $65,000 => all VIOLATION
          unit: 'USD',
          status: 'PASS',
        },
      ],
    };

    const res = cityInterventionOptimizationService.optimize('scen-imp-01', impossibleInput);

    expect(res.status).toBe('NO_FEASIBLE_INTERVENTION');
    expect(res.recommendedCandidateId).toBeNull();
    expect(res.feasibleCandidates.length).toBe(0);
    expect(res.infeasibleCandidates.length).toBe(res.candidates.length);
  });

  it('10. Data Source Labeling & Governance Safety: MUST enforce OPTIMIZATION source and requiresHumanApproval', () => {
    const res = cityInterventionOptimizationService.optimize('scen-gov-01', baseInput);

    expect(res.dataSource).toBe('OPTIMIZATION');
    expect(res.requiresHumanApproval).toBe(true);
  });

  it('11. Service Orchestration: CityInterventionService should run scenario optimization and persist results', async () => {
    const scenario = await cityInterventionService.createScenario(baseInput);
    const runRes = await cityInterventionService.runScenarioOptimization(scenario.scenarioId);

    expect(runRes.scenario.status).toBe('EVALUATED');
    expect(runRes.scenario.options.length).toBeGreaterThan(0);
    expect(runRes.scenario.recommendation?.requiresHumanApproval).toBe(true);
  });
});
