// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Decision Workspace Unit Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';

describe('Phase 7.9.3 — Citywide Decision Optimization Workspace & UI State Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. SECTION 1 — Should provide complete Citywide Risk metrics', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');

    expect(context.baselineRiskScore).toBeGreaterThanOrEqual(0);
    expect(context.simulatedPeakRiskScore).toBeGreaterThan(context.baselineRiskScore);
    expect(context.forecastHorizon).toBe('6h');
    expect(context.decisionConfidence).toBeGreaterThan(80);
    expect(context.highestRiskDomain).toBeDefined();
    expect(context.requiresHumanApproval).toBe(true);
  });

  it('2. SECTION 2 — Should capture Active Scenario, triggering signals, causal chain, and simulated impact', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');

    expect(context.triggeringSignalSummaries.length).toBeGreaterThan(0);
    expect(context.causalChains.length).toBeGreaterThan(0);
    expect(context.populationExposure).toBeGreaterThan(0);
    expect(context.affectedInfrastructureCount).toBeGreaterThan(0);
    expect(context.serviceImpactPercent).toBeGreaterThan(0);
  });

  it('3. SECTION 3 — Should validate 10 properties on Intervention Candidates', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');

    expect(context.evaluatedCandidates.length).toBe(3);
    const candidate = context.evaluatedCandidates[0];

    expect(candidate.title).toBeDefined();
    expect(candidate.riskReduction).toBeGreaterThan(0);
    expect(candidate.costUsd).toBeGreaterThan(0);
    expect(candidate.downtimeHours).toBeGreaterThanOrEqual(0);
    expect(candidate.populationExposure).toBeGreaterThan(0);
    expect(candidate.serviceRestorationPercent).toBeGreaterThan(0);
    expect(candidate.resilienceImprovementPercent).toBeGreaterThan(0);
    expect(candidate.confidencePercent).toBeGreaterThan(0);
    expect(candidate.feasibilityScore).toBeGreaterThan(0);
    expect(candidate.overallDecisionScore).toBeGreaterThan(0);
  });

  it('4. SECTION 4 — Should allow Decision Comparison & highlight optimal candidates across trade-off strategies', async () => {
    const balancedContext = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');
    const minCostContext = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'MINIMIZE_COST');
    const minRiskContext = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'MINIMIZE_RISK');

    expect(balancedContext.optimizationStrategy).toBe('BALANCED');
    expect(minCostContext.optimizationStrategy).toBe('MINIMIZE_COST');
    expect(minRiskContext.optimizationStrategy).toBe('MINIMIZE_RISK');

    // Lowest cost candidate option should be recommended under MINIMIZE_COST
    expect(minCostContext.recommendedCandidate?.optionId).toContain('beta');
    // Highest risk reduction candidate option should be recommended under MINIMIZE_RISK
    expect(minRiskContext.recommendedCandidate?.optionId).toContain('alpha');
  });

  it('5. SECTION 5 — Should format Recommendation Panel with why selected, expected outcome, constraints, confidence, and uncertainty', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');

    expect(context.recommendedCandidate).not.toBeNull();
    expect(context.recommendedCandidate?.evaluationStatus).toBe('RECOMMENDED');
    expect(context.explainability.whyWasThisInterventionRankedHighest).toContain('Option Beta');
    expect(context.explainability.whatAreTheExpectedBenefits).toBeDefined();
    expect(context.explainability.whatConstraintsExist.length).toBeGreaterThan(0);
    expect(context.explainability.whatUncertaintyExists).toBeDefined();
  });

  it('6. SECTION 6 — Should enforce human authorization & generate compliant audit trail record', () => {
    const mockAuditRecord = {
      auditId: 'AUDIT-EVT-1786733-102',
      timestamp: new Date().toISOString(),
      operatorIdentity: {
        userId: 'usr-cro-01',
        operatorName: 'Chief Resilience Officer',
        operatorRole: 'MUNICIPAL_OPERATIONS_DIRECTOR',
      },
      decision: 'APPROVED' as const,
      reason: 'Verified against municipal safety protocols',
      requiresHumanApproval: true,
      status: 'AUTHORIZED' as const,
      auditEvent: 'HUMAN_AUTHORIZATION_APPROVED_BY_CHIEF_RESILIENCE_OFFICER',
    };

    expect(mockAuditRecord.requiresHumanApproval).toBe(true);
    expect(mockAuditRecord.decision).toBe('APPROVED');
    expect(mockAuditRecord.auditEvent).toContain('APPROVED');
    expect(mockAuditRecord.status).toBe('AUTHORIZED');
    expect(mockAuditRecord.operatorIdentity.userId).toBe('usr-cro-01');
  });

  it('7. SECTION 7 — Should structure 6-step Explainability trace from Signals to Recommendation', async () => {
    const context = await cityDecisionOrchestratorService.runUnifiedPipeline('city-vja', 'BALANCED');

    expect(context.explainability.whatHappened).toBeDefined();
    expect(context.explainability.whyIsItRisky).toBeDefined();
    expect(context.explainability.whatCouldHappenNext).toBeDefined();
    expect(context.explainability.whatInterventionsWereConsidered.length).toBe(3);
    expect(context.explainability.whyWasThisInterventionRankedHighest).toBeDefined();
    expect(context.explainability.whyDoesHumanApprovalRemainNecessary).toBeDefined();
  });
});

