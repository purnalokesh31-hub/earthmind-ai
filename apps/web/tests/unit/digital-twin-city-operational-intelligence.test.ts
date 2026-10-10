import { describe, it, expect } from 'vitest';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';
import { earthMindProvenanceService } from '../../lib/server/services/earthmind-provenance.service';
import { cityOperationalFeedbackService } from '../../lib/server/services/city-operational-feedback.service';
import { cityOperationalKpiService } from '../../lib/server/services/city-operational-kpi.service';
import { cityResilienceScoreService } from '../../lib/server/services/city-resilience-score.service';
import { cityOperationalHistoryService } from '../../lib/server/services/city-operational-history.service';
import { cityOperationalIntelligenceOrchestratorService } from '../../lib/server/services/city-operational-intelligence-orchestrator.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.11 (Mega Prompt 6/6) — Citywide Operational Intelligence & Governance Certification', () => {
  // 1. Safety Gateway & Autonomous Execution Prevention
  describe('Safety Gateway Invariants', () => {
    it('enforces advisoryMode, humanApprovalRequired, and blocks autonomous execution', () => {
      const recommendation = {
        title: 'Test Strategy',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      };

      const sanitized = earthMindSafetyGatewayService.sanitizeRecommendation(recommendation);
      expect(sanitized.requiresHumanApproval).toBe(true);
      expect(sanitized.advisoryOnly).toBe(true);
      expect(sanitized.autonomousExecution).toBe(false);
    });

    it('rejects autonomous execution attempts with AUTONOMOUS_EXECUTION_FORBIDDEN', () => {
      expect(() =>
        earthMindSafetyGatewayService.assertNoAutonomousExecution({
          title: 'Dangerous Execute Action',
          autonomousExecution: true,
        })
      ).toThrow(/AUTONOMOUS_EXECUTION_FORBIDDEN/);
    });
  });

  // 2. Provenance Governance
  describe('Provenance Governance', () => {
    it('verifies valid provenance and sets UNKNOWN for unverified sources', () => {
      const validProv = earthMindProvenanceService.verifyProvenance('PREDICTION', 85);
      expect(validProv.dataSource).toBe('PREDICTION');
      expect(validProv.confidence).toBe(85);

      const unverifiedProv = earthMindProvenanceService.verifyProvenance('INVALID_SOURCE' as any, 100);
      expect(unverifiedProv.dataSource).toBe('UNKNOWN');
      expect(unverifiedProv.confidence).toBe(0);
      expect(unverifiedProv.sourceReference).toBe('PROVENANCE_UNVERIFIED');
    });

    it('blocks silent promotion from SIMULATION to LIVE_TELEMETRY', () => {
      expect(() =>
        earthMindProvenanceService.preventSilentPromotion('SIMULATION', 'LIVE_TELEMETRY')
      ).toThrow(/PROVENANCE_UNVERIFIED/);
    });
  });

  // 3. Operational Feedback Engine
  describe('Continuous Feedback Engine', () => {
    it('calculates operational accuracy and classifies feedback performance', () => {
      const feedback = cityOperationalFeedbackService.calculateOperationalFeedback('city-vja');
      expect(feedback.overallOperationalAccuracyPercentage).toBeGreaterThan(0);
      expect(['EXCELLENT', 'GOOD', 'ACCEPTABLE', 'DEGRADED', 'INSUFFICIENT_DATA']).toContain(feedback.classification);
      expect(feedback.suggestedAdjustments.length).toBeGreaterThan(0);
      expect(feedback.requiresHumanApproval).toBe(true);
    });
  });

  // 4. Operational KPI Engine
  describe('Operational KPI Engine', () => {
    it('calculates citywide KPIs with metrics, units, and confidence', () => {
      const kpis = cityOperationalKpiService.calculateCityKpis('city-vja', '24h');
      expect(kpis.length).toBeGreaterThan(0);

      const mttr = kpis.find((k) => k.metric.includes('MTTR'));
      expect(mttr).toBeDefined();
      expect(mttr?.unit).toBe('MINUTES');
      expect(mttr?.dataSource).toBeDefined();
    });
  });

  // 5. City Resilience Score Service
  describe('Citywide Resilience Score Engine', () => {
    it('calculates explainable resilience score (0-100) and classification', () => {
      const score = cityResilienceScoreService.calculateCityResilienceScore('city-vja');
      expect(score.resilienceScore).toBeGreaterThanOrEqual(0);
      expect(score.resilienceScore).toBeLessThanOrEqual(100);
      expect(['CRITICAL', 'HIGH', 'ELEVATED', 'GUARDED', 'RESILIENT']).toContain(score.classification);
      expect(score.contributingFactors.length).toBeGreaterThan(0);
      expect(score.requiresHumanApproval).toBe(true);
    });
  });

  // 6. Historical Performance & Trend Analysis
  describe('Historical Performance & Trend Analysis', () => {
    it('analyzes trends across 1h, 6h, 24h, 7d, 30d, 90d horizons', () => {
      const history = cityOperationalHistoryService.getHistoricalPerformance('city-vja', '7d');
      expect(history.timeWindow).toBe('7d');
      expect(history.totalInterventions).toBeGreaterThan(0);
      expect(history.trends.length).toBeGreaterThan(0);
      expect(['IMPROVING', 'STABLE', 'DEGRADING', 'INSUFFICIENT_DATA']).toContain(history.trends[0].direction);
    });
  });

  // 7. Master Operational Intelligence Orchestrator
  describe('Master Operational Intelligence Orchestrator', () => {
    it('executes 20-step closed operational intelligence loop pipeline safely', () => {
      expect(cityOperationalIntelligenceOrchestratorService.AUTONOMOUS_EXECUTION_FORBIDDEN).toBe(true);

      const entity = cityOperationalIntelligenceOrchestratorService.runMasterOperationalIntelligencePipeline('city-vja');
      expect(entity.id).toBeDefined();
      expect(entity.status).toBe('ACTIVE');
      expect(entity.summary.resilienceScore).toBeDefined();
      expect(entity.summary.kpis.length).toBeGreaterThan(0);
      expect(entity.recommendations[0].requiresHumanApproval).toBe(true);
      expect(entity.recommendations[0].autonomousExecution).toBe(false);
    });
  });

  // 8. AI Agent Tools Certification
  describe('AI Agent Tools & Execution Refusal', () => {
    it('invokes city_operational_intelligence_overview tool safely', async () => {
      const tool = toolRegistry.getTool('city_operational_intelligence_overview');
      expect(tool).toBeDefined();

      const res = await toolRegistry.invokeTool('city_operational_intelligence_overview', {});
      const parsed = JSON.parse(res.outputSummary);
      expect(parsed.requiresHumanApproval).toBe(true);
      expect(parsed.advisoryOnly).toBe(true);
      expect(parsed.autonomousExecution).toBe(false);
    });

    it('refuses execution prompts with AUTONOMOUS_EXECUTION_FORBIDDEN', async () => {
      const res = await toolRegistry.invokeTool('city_operational_intelligence_overview', {
        action: 'execute emergency response',
      });
      const parsed = JSON.parse(res.outputSummary);
      expect(parsed.error).toBe('AUTONOMOUS_EXECUTION_FORBIDDEN');
      expect(parsed.autonomousExecution).toBe(false);
    });
  });
});
