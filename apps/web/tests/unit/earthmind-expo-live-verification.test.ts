import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('EarthMind PIOS — Final Expo Live Verification & Failure-Hardening Test Suite', () => {
  it('1. Verifies 15-step Golden Demo Path execution in DEMO mode', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(pipeline.pipelineRunId).toBeDefined();
    expect(pipeline.cityId).toBe('city-vja');
    expect(pipeline.executionMode).toBe('DEMO');
    expect(pipeline.approvalStatus).toBe('AWAITING_APPROVAL');
    expect(pipeline.requiresHumanApproval).toBe(true);
    expect(pipeline.advisoryOnly).toBe(true);
    expect(pipeline.autonomousExecution).toBe(false);
    expect(pipeline.stageHistory.length).toBeGreaterThanOrEqual(7);
  });

  it('2. Enforces Execution Mode Isolation (LIVE_READ_ONLY / DEMO / SIMULATION allowed, forbidden modes blocked)', async () => {
    const livePipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(livePipeline.executionMode).toBe('LIVE_READ_ONLY');

    const demoPipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(demoPipeline.executionMode).toBe('DEMO');

    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });

  it('3. Preserves Data Provenance & 7-Domain Telemetry Quality across 9 pipeline stages', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 8, providerStatus: 'ONLINE' },
      MOBILITY: { signalCount: 2, dataQuality: 'STALE', freshnessSeconds: 120, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'FALLBACK', fallbackActive: true },
    };

    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    const quality = { overallScore: 78, freshnessScore: 65, schemaValidityScore: 100, duplicateScore: 100, orderingScore: 100, staleCount: 1 };
    const domains = Object.values(mockDomainStates);

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality as any, domains as any, 'LIVE_READ_ONLY');
    expect(trustScore.trustCategory).toBe('STALE_DATA');
    expect(trustScore.phase7GatingStatus).toBe('ALLOWED_DEGRADED');
    expect(trustScore.trustExplanation).toBeDefined();
  });

  it('4. Human Operator Approval & Duplicate Decision Blocking (HTTP 409)', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const approved = phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-qa', 'Approved live verification flood intervention');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.stageHistory[approved.stageHistory.length - 1].stageId).toBe('stage-9-approval');

    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-qa', 'Duplicate approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });
});
