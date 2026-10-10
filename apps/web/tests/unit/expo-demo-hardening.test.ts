import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('EarthMind PIOS — Final Expo Demonstration Hardening Unit Tests', () => {
  it('1. Executes end-to-end City Flood Cascade Demo scenario deterministically', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(pipeline.pipelineRunId).toBeDefined();
    expect(pipeline.executionMode).toBe('DEMO');
    expect(pipeline.approvalStatus).toBe('AWAITING_APPROVAL');
    expect(pipeline.requiresHumanApproval).toBe(true);
    expect(pipeline.advisoryOnly).toBe(true);
    expect(pipeline.autonomousExecution).toBe(false);
    expect(pipeline.stageHistory.length).toBeGreaterThanOrEqual(7);
  });

  it('2. Evaluates telemetry trust score and provides explainability card narrative', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 8, providerStatus: 'ONLINE' },
      MOBILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 14, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'ONLINE' },
    };

    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    const quality = { overallScore: 95, freshnessScore: 98, schemaValidityScore: 100, duplicateScore: 100, orderingScore: 100 };
    const domains = Object.values(mockDomainStates);

    const trustScore = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality as any, domains as any, 'LIVE_READ_ONLY');
    expect(trustScore.trustScore).toBeGreaterThanOrEqual(85);
    expect(trustScore.trustCategory).toBe('TRUSTED_LIVE_DATA');
    expect(trustScore.phase7GatingStatus).toBe('ALLOWED_TRUSTED');
    expect(trustScore.trustExplanation).toContain('Telemetry is fully verified');
  });

  it('3. Enforces Human Approval / Rejection workflow and blocks 409 duplicate decisions', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const approved = phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-cmd', 'Approved flood response plan');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.stageHistory[approved.stageHistory.length - 1].stageId).toBe('stage-9-approval');

    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-expo-cmd', 'Second approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('4. Asserts AI Tool Registry safety boundary blocks physical execution requests', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });
});
