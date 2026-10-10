import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('EarthMind PIOS — Expo Final Validation Tests', () => {
  it('1. Verifies Expo 9-stage pipeline execution with mandatory human approval context', async () => {
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

  it('2. Verifies Human Approval & Rejection workflow with audit trail and 409 duplicate rejection', async () => {
    const p1 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const app1 = phase7PipelineBridgeService.recordHumanApproval(p1.pipelineRunId, 'usr-expo-commander', 'Approved emergency rerouting plan');
    expect(app1.approvalStatus).toBe('APPROVED');
    expect(app1.stageHistory.length).toBeGreaterThanOrEqual(8);
    expect(app1.stageHistory[app1.stageHistory.length - 1].stageId).toBe('stage-9-approval');

    // Duplicate approval attempt
    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(p1.pipelineRunId, 'usr-expo-commander', 'Second approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');

    const p2 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'SIMULATION');
    const rej2 = phase7PipelineBridgeService.recordHumanRejection(p2.pipelineRunId, 'usr-expo-commander', 'Rejected scenario simulation');
    expect(rej2.approvalStatus).toBe('REJECTED');
  });

  it('3. Verifies Telemetry Trust Score evaluation and explainability factors', () => {
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

  it('4. Verifies AI tool registry safety boundary blocks physical execution requests', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });
});
