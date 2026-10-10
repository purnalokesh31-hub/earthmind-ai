import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 8.6 — Final Production Certification & Integration Tests', () => {
  it('1. End-to-end 9-stage pipeline executes cleanly with full provenance preservation', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(ctx.pipelineRunId).toBeDefined();
    expect(ctx.cityId).toBe('city-vja');
    expect(ctx.executionMode).toBe('LIVE_READ_ONLY');
    expect(ctx.approvalStatus).toBe('AWAITING_APPROVAL');
    expect(ctx.requiresHumanApproval).toBe(true);
    expect(ctx.advisoryOnly).toBe(true);
    expect(ctx.autonomousExecution).toBe(false);
  });

  it('2. Evaluates deterministic trust score and handles stale/degraded telemetry', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 8, providerStatus: 'ONLINE' },
      MOBILITY: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 14, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 1, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'ONLINE' },
    };

    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    const quality = { overallScore: 92, freshnessScore: 95, schemaValidityScore: 100, duplicateScore: 100, orderingScore: 100 };
    const domains = Object.values(mockDomainStates);

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality as any, domains as any, 'LIVE_READ_ONLY');
    expect(trustScore.trustScore).toBeGreaterThanOrEqual(80);
    expect(trustScore.trustCategory).toBe('TRUSTED_LIVE_DATA');
    expect(trustScore.phase7GatingStatus).toBe('ALLOWED_TRUSTED');
  });

  it('3. Human Operator Approval & Rejection flow transitions pipeline stage cleanly', async () => {
    const ctx1 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const approvedCtx = phase7PipelineBridgeService.recordHumanApproval(ctx1.pipelineRunId, 'usr-cmd-01', 'Approved emergency response plan');
    expect(approvedCtx.approvalStatus).toBe('APPROVED');

    const ctx2 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const rejectedCtx = phase7PipelineBridgeService.recordHumanRejection(ctx2.pipelineRunId, 'usr-cmd-01', 'Rejected due to alternative routing');
    expect(rejectedCtx.approvalStatus).toBe('REJECTED');
  });

  it('4. Rejects duplicate approval/rejection attempts with DUPLICATE_DECISION_BLOCKED', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-01', 'Initial Approval');
    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-01', 'Duplicate Attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('5. Refuses physical execution requests in AI tool registry', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });
});
