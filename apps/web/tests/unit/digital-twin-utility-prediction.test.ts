// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.2 Utility Prediction Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilityPredictionRepository } from '../../lib/server/repositories/utility-prediction.repository';
import { utilityHistoryService } from '../../lib/server/services/utility-history.service';
import { utilityAnomalyTrendService } from '../../lib/server/services/utility-anomaly-trend.service';
import { utilityFailurePredictionService } from '../../lib/server/services/utility-failure-prediction.service';
import { utilityOutageImpactService } from '../../lib/server/services/utility-outage-impact.service';
import { utilityPredictiveMaintenanceService } from '../../lib/server/services/utility-predictive-maintenance.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.2 — Smart Utility Predictive Intelligence Suite', () => {
  // ── 1. Telemetry History & Anomaly Trends ──
  it('should retrieve historical telemetry trends and detect anomaly trends', async () => {
    const history = await utilityHistoryService.getHistoricalTelemetryTrends('ast-pow-tx-102', '24h');
    expect(history.dataSource).toBe('SIMULATION');

    const trends = await utilityAnomalyTrendService.detectAnomalyTrends('ast-pow-tx-102');
    expect(trends.length).toBeGreaterThan(0);
    expect(trends[0].trendDirection).toBe('INCREASING');
  });

  // ── 2. Failure Prediction & Remaining Useful Life ──
  it('should predict failure probability and estimate remaining useful life', async () => {
    const failure = await utilityFailurePredictionService.predictFailureProbability('ast-pow-tx-102');
    expect(failure.failureProbabilityPercent).toBeGreaterThan(80);
    expect(failure.riskClassification).toBe('CRITICAL');

    const rul = await utilityFailurePredictionService.estimateRemainingLife('ast-pow-tx-102');
    expect(rul.estimatedRemainingLifeDays).toBeGreaterThan(0);
  });

  // ── 3. Outage Impact & Predictive Maintenance Approval ──
  it('should predict downstream outage impact and approve maintenance recommendations', async () => {
    const impact = await utilityOutageImpactService.predictOutageImpact('ast-pow-tx-102');
    expect(impact.estimatedServiceImpactPopulation).toBeGreaterThan(0);

    const approved = await utilityPredictiveMaintenanceService.approveRecommendation('pred-utl-101');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.requiresHumanApproval).toBe(true);

    const predictions = await memoryUtilityPredictionRepository.listPredictionsByCityId('city-vja');
    expect(predictions.length).toBeGreaterThan(0);
  });

  // ── 4. AI Agent Tool Registry Integration ──
  it('should possess registered predictive utility tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const predTools = tools.filter((t) => t.toolId.startsWith('utility_prediction_') || t.toolId.startsWith('utility_failure_') || t.toolId.startsWith('utility_degradation_') || t.toolId.startsWith('utility_outage_') || t.toolId.startsWith('utility_remaining_') || t.toolId.startsWith('utility_predictive_'));
    expect(predTools.length).toBeGreaterThanOrEqual(7);
  });
});
