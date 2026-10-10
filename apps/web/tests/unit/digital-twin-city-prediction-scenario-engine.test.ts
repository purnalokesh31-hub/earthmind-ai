// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Core Scenario Engine Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityPredictionCascadeService } from '../../lib/server/services/city-prediction-cascade.service';
import { cityPredictionImpactService } from '../../lib/server/services/city-prediction-impact.service';
import { cityPredictionRiskComparisonService } from '../../lib/server/services/city-prediction-risk-comparison.service';
import { cityPredictionScenarioService } from '../../lib/server/services/city-prediction-scenario.service';

describe('Phase 7.9.2 — Core Predictive Scenario Engine Suite', () => {
  const sampleVariables = [
    { variableId: 'v1', variableName: 'Rainfall Intensity Surge', domain: 'CLIMATE' as const, baseValue: 50, simulatedValue: 145, unit: 'mm/hr', changePercentage: 190 },
    { variableId: 'v2', variableName: 'Substation Transformer Load', domain: 'UTILITY' as const, baseValue: 70, simulatedValue: 95, unit: 'pct', changePercentage: 35.7 },
  ];

  // ── 1. Cascade Engine ──
  it('should simulate multi-hop cross-domain cascade propagation', () => {
    const hops = cityPredictionCascadeService.simulateCascadePropagation(sampleVariables);
    expect(hops.length).toBeGreaterThanOrEqual(2);
    expect(hops[0].sourceDomain).toBe('CLIMATE');
    expect(hops[0].targetDomain).toBe('MOBILITY');
    expect(hops[1].sourceDomain).toBe('MOBILITY');
    expect(hops[1].targetDomain).toBe('TRANSIT');
  });

  // ── 2. Impact Engine ──
  it('should calculate detailed municipal impact metrics labeled as SIMULATION', () => {
    const hops = cityPredictionCascadeService.simulateCascadePropagation(sampleVariables);
    const impact = cityPredictionImpactService.calculateImpact(sampleVariables, hops);

    expect(impact.dataSource).toBe('SIMULATION');
    expect(impact.affectedPopulation).toBeGreaterThan(10000);
    expect(impact.criticalInfrastructureExposure.length).toBeGreaterThan(0);
    expect(impact.financialImpactUsd).toBeGreaterThan(0);
  });

  // ── 3. Risk Comparison Engine ──
  it('should produce baseline vs scenario deltas for risk score and response delays', () => {
    const hops = cityPredictionCascadeService.simulateCascadePropagation(sampleVariables);
    const impact = cityPredictionImpactService.calculateImpact(sampleVariables, hops);
    const comparison = cityPredictionRiskComparisonService.compareBaselineVsScenario(88.5, impact, hops);

    expect(comparison.dataSource).toBe('SIMULATION');
    expect(comparison.deltas.riskScoreDelta).toBe(36.5);
    expect(comparison.deltas.populationImpactDelta).toBeGreaterThan(0);
    expect(comparison.deltas.responseDelayDeltaMinutes).toBe(20);
  });

  // ── 4. End-to-End Master Scenario Orchestrator ──
  it('should execute scenario simulation end-to-end and enforce requiresHumanApproval: true', async () => {
    const scenario = await cityPredictionScenarioService.createScenario({
      title: 'Monsoon Flooding & Substation Failure Simulation',
      description: 'Simulates 145mm/hr rain escalation over 6h',
      cityId: 'city-vja',
      scenarioType: 'MULTI_DOMAIN_CASCADE',
      severityLevel: 'CRITICAL',
      horizon: '6h',
      variables: sampleVariables,
    });

    const executed = await cityPredictionScenarioService.executeScenarioSimulation(scenario.scenarioId);
    expect(executed.status).toBe('COMPLETED');
    expect(executed.result?.risk.simulatedRiskScore).toBe(88.5);
    expect(executed.recommendation?.requiresHumanApproval).toBe(true);
  });
});
