import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 8.6 Mega Prompt 3/5 — End-to-End Pipeline Bridge Unit Tests', () => {
  it('1. Executes unified pipeline and populates 9-stage pipeline context', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(ctx.pipelineRunId).toBeDefined();
    expect(ctx.cityId).toBe('city-vja');
    expect(ctx.executionMode).toBe('LIVE_READ_ONLY');
    expect(ctx.stageHistory.length).toBeGreaterThanOrEqual(7);
    expect(ctx.requiresHumanApproval).toBe(true);
    expect(ctx.advisoryOnly).toBe(true);
    expect(ctx.autonomousExecution).toBe(false);
  });

  it('2. Preserves provenance and trust across DEMO pipeline execution', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(ctx.executionMode).toBe('DEMO');
    expect(ctx.approvalStatus).toBe('AWAITING_APPROVAL');
  });

  it('3. Records human operator approval and transitions stage to STAGE_9_OPERATOR_APPROVAL', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const updatedCtx = phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-01', 'Approved for emergency readiness dispatch');
    expect(updatedCtx.approvalStatus).toBe('APPROVED');
    expect(updatedCtx.currentStage).toBe('STAGE_9_OPERATOR_APPROVAL');
  });

  it('4. Blocks duplicate approval attempts with 409 Conflict error', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-01', 'Initial Approval');
    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(ctx.pipelineRunId, 'usr-cmd-01', 'Second Approval Attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  it('5. Records human operator rejection', async () => {
    const ctx = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const updatedCtx = phase7PipelineBridgeService.recordHumanRejection(ctx.pipelineRunId, 'usr-cmd-01', 'Rejected due to cost constraint');
    expect(updatedCtx.approvalStatus).toBe('REJECTED');
  });

  it('6. Verifies pipeline inspection AI tools in tool registry', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool).toBeDefined();
    expect(tool?.readOnly).toBe(true);

    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { cityId: 'city-vja' });
    expect(res.status).toBe('SUCCESS');
  });
});
