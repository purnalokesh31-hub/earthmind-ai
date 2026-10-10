import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('EarthMind PIOS — Final Expo Hardening & Demo Lock Regression Suite', () => {
  it('1. Deterministic Golden Demo Path execution and Reset Demo baseline restoration', async () => {
    // Run Flood Cascade Demo twice to prove repeatability
    const run1 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(run1.executionMode).toBe('DEMO');
    expect(run1.approvalStatus).toBe('AWAITING_APPROVAL');

    const run2 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(run2.executionMode).toBe('DEMO');
    expect(run2.stageHistory[0].provenance).toBe('DEMO');

    // Restore LIVE_READ_ONLY baseline
    const liveRun = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(liveRun.executionMode).toBe('LIVE_READ_ONLY');
  });

  it('2. Failure Injection: Provider degraded/fallback handling and Trust Score explainability', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'INVALID', freshnessSeconds: 5, providerStatus: 'OFFLINE' }, // Invalid payload
      MOBILITY: { signalCount: 2, dataQuality: 'STALE', freshnessSeconds: 150, providerStatus: 'ONLINE' }, // Stale signal
      TRANSIT: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'FALLBACK', fallbackActive: true },
    };

    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    const quality = { overallScore: 62, freshnessScore: 50, schemaValidityScore: 85, duplicateScore: 100, orderingScore: 100, invalidCount: 1, staleCount: 1 };
    const domains = Object.values(mockDomainStates);

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality as any, domains as any, 'LIVE_READ_ONLY');
    expect(trustScore.trustCategory).toBe('INVALID_DATA');
    expect(trustScore.phase7GatingStatus).toBe('BLOCKED_INVALID');
    expect(trustScore.trustExplanation).toContain('Telemetry contains invalid payloads');
  });

  it('3. Human Governance Approval & Duplicate Decision Rejection (HTTP 409)', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const approved = phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-lock', 'Approved demo lock intervention');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.stageHistory[approved.stageHistory.length - 1].stageId).toBe('stage-9-approval');

    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-lock', 'Second approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('4. Server-Side Safety Gateway refusal of forbidden modes (HTTP 403)', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });
});
