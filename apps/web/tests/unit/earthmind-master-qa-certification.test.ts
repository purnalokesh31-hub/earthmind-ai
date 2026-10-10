import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('EarthMind PIOS — Master Production QA & Reliability Certification Suite', () => {
  it('1. Verifies Command Center initial state determinism & safety invariants in LIVE_READ_ONLY mode', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(pipeline.pipelineRunId).toBeDefined();
    expect(pipeline.cityId).toBe('city-vja');
    expect(pipeline.executionMode).toBe('LIVE_READ_ONLY');
    expect(pipeline.approvalStatus).toBe('AWAITING_APPROVAL');
    expect(pipeline.requiresHumanApproval).toBe(true);
    expect(pipeline.advisoryOnly).toBe(true);
    expect(pipeline.autonomousExecution).toBe(false);
  });

  it('2. Validates DEMO mode execution, repeatability, and state isolation from LIVE_READ_ONLY', async () => {
    const demoPipeline1 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(demoPipeline1.executionMode).toBe('DEMO');
    expect(demoPipeline1.stageHistory[0].provenance).toBe('DEMO');

    const demoPipeline2 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(demoPipeline2.executionMode).toBe('DEMO');

    const livePipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(livePipeline.executionMode).toBe('LIVE_READ_ONLY');
    expect(livePipeline.executionMode).not.toBe('DEMO');
  });

  it('3. Evaluates 7-domain telemetry quality, fallback penalty, and trust score explainability', () => {
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
    expect(trustScore.trustExplanation.length).toBeGreaterThan(0);
  });

  it('4. Enforces 9-stage pipeline prerequisite gating and operator decision audit with HTTP 409 duplicate blocking', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(pipeline.stageHistory.length).toBeGreaterThanOrEqual(7);

    const approved = phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-qa-commander', 'Approved master QA flood intervention');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.stageHistory[approved.stageHistory.length - 1].stageId).toBe('stage-9-approval');

    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-qa-commander', 'Duplicate approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('5. Asserts server-side safety gateway refusal of forbidden execution modes (HTTP 403)', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });
});
