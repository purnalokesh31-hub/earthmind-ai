// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.5 Utility Closed-Loop Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilityOperationsRepository } from '../../lib/server/repositories/utility-operations.repository';
import { utilityAnomalyCorrelationService } from '../../lib/server/services/utility-anomaly-correlation.service';
import { utilityDecisionFusionService } from '../../lib/server/services/utility-decision-fusion.service';
import { utilityWorkOrderService } from '../../lib/server/services/utility-work-order.service';
import { utilityExecutionTrackingService } from '../../lib/server/services/utility-execution-tracking.service';
import { utilityOutcomeValidationService } from '../../lib/server/services/utility-outcome-validation.service';
import { utilityContinuousFeedbackService } from '../../lib/server/services/utility-continuous-feedback.service';
import { utilityOperationsKpiService } from '../../lib/server/services/utility-operations-kpi.service';
import { utilityOperationsOrchestratorService } from '../../lib/server/services/utility-operations-orchestrator.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.5 — Smart Utility Closed-Loop Operations & Continuous Intelligence Suite', () => {
  // ── 1. Anomaly Correlation & Decision Fusion ──
  it('should correlate anomaly signals and fuse advisory operational decisions', async () => {
    const signals = await utilityAnomalyCorrelationService.correlateAnomalies('ast-pow-tx-102');
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].severity).toBe('HIGH');

    const decision = await utilityDecisionFusionService.fuseDecision('ast-pow-tx-102');
    expect(decision.confidence).toBeGreaterThan(90);
    expect(decision.expectedCostUsd).toBe(3200);
  });

  // ── 2. Work Order Generation & Execution Tracking ──
  it('should generate authorized work orders upon human approval and track execution', async () => {
    const wo = utilityWorkOrderService.createWorkOrder('rec-ops-301', 'ast-pow-tx-102', 'usr-grid-director');
    expect(wo.status).toBe('AUTHORIZED');
    expect(wo.authorizationUser).toBe('usr-grid-director');

    const exec = await utilityExecutionTrackingService.getExecutionStatus(wo.workOrderId);
    expect(exec.status).toBe('COMPLETED');
    expect(exec.progressPercent).toBe(100);
  });

  // ── 3. Outcome Validation, Feedback & KPIs ──
  it('should validate post-action outcomes, compute feedback, and calculate operational KPIs', async () => {
    const outcome = await utilityOutcomeValidationService.validateOutcome('cyc-utl-301');
    expect(outcome.validationStatus).toBe('OUTCOME_MATCH');

    const feedback = await utilityContinuousFeedbackService.calculateFeedback('cyc-utl-301');
    expect(feedback.predictionAccuracyPercent).toBeGreaterThan(95);

    const kpis = await utilityOperationsKpiService.calculateKpis('city-vja');
    expect(kpis.meanTimeToDetectMinutes).toBeLessThan(10);
    expect(kpis.predictionAccuracyPercent).toBeGreaterThan(90);
  });

  // ── 4. Master Operations Orchestrator & Approval Workflow ──
  it('should orchestrate closed-loop operations and record operator user audit', async () => {
    const res = await utilityOperationsOrchestratorService.approveRecommendation('cyc-utl-301', 'usr-grid-director');
    expect(res.recommendation.approvalStatus).toBe('APPROVED');
    expect(res.workOrder.authorizationUser).toBe('usr-grid-director');

    const cycle = await memoryUtilityOperationsRepository.findCycleById('cyc-utl-301');
    expect(cycle?.status).toBe('COMPLETED');
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered closed-loop utility tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const opsTools = tools.filter(
      (t) =>
        t.toolId.startsWith('utility_operations_') ||
        t.toolId.startsWith('utility_anomaly_') ||
        t.toolId.startsWith('utility_decision_') ||
        t.toolId.startsWith('utility_work_order_') ||
        t.toolId.startsWith('utility_execution_') ||
        t.toolId.startsWith('utility_outcome_') ||
        t.toolId.startsWith('utility_continuous_')
    );
    expect(opsTools.length).toBeGreaterThanOrEqual(10);
  });
});
