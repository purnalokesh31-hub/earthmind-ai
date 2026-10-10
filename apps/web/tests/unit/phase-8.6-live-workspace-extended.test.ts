import { describe, it, expect } from 'vitest';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';

describe('Phase 8.6 Mega Prompt 4/5 — Command Center Workspace Hardening Unit Tests', () => {
  it('1. Verifies 9-stage pipeline execution bridge integration for workspace', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(ctx.pipelineRunId).toBeDefined();
    expect(ctx.stageHistory.length).toBeGreaterThanOrEqual(7);
    expect(ctx.requiresHumanApproval).toBe(true);
    expect(ctx.advisoryOnly).toBe(true);
    expect(ctx.autonomousExecution).toBe(false);
  });

  it('2. Verifies operator decision recording in workspace pipeline context', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const updatedCtx = phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-commander-01', 'Approved plan for demo');
    expect(updatedCtx.approvalStatus).toBe('APPROVED');
    expect(updatedCtx.currentStage).toBe('STAGE_9_OPERATOR_APPROVAL');
  });

  it('3. Rejects duplicate approval attempts with DUPLICATE_DECISION_BLOCKED', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-commander-01', 'First Approval');
    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-commander-01', 'Second Approval Attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('4. Asserts read-only tools and safety invariant guards in tool registry', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { cityId: 'city-vja' });
    expect(res.status).toBe('SUCCESS');

    const forbiddenRes = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(forbiddenRes.status).toBe('FAILED');
  });
});
