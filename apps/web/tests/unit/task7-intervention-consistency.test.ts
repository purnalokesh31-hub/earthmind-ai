// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 7: Intervention Plan Consistency Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';

describe('TASK 7 — Intervention Plan Consistency Regression Suite', () => {
  it('proves authoritative pipeline intervention equals submitted and persisted entity', async () => {
    const cityId = 'city-vja';
    const executionMode = 'DEMO';
    const context = await phase7PipelineBridgeService.runUnifiedPipeline(cityId, executionMode);

    expect(context.pipelineRunId).toBeDefined();
    expect(context.interventionResult).toBeDefined();

    const authoritativePlan = context.interventionResult;
    expect(authoritativePlan.actions).toBeDefined();
    expect(authoritativePlan.actions.length).toBeGreaterThan(0);

    const planTitle = authoritativePlan.recommendation?.candidateTitle || authoritativePlan.title;
    const actionTitles = authoritativePlan.actions.map((a: any) => a.title);

    const approvedContext = phase7PipelineBridgeService.recordHumanApproval(
      context.pipelineRunId,
      'usr-cmd-commander-01',
      'Verified municipal capacity and budget'
    );

    expect(approvedContext.approvalStatus).toBe('APPROVED');
    expect(approvedContext.pipelineRunId).toBe(context.pipelineRunId);

    const retrievedContext = phase7PipelineBridgeService.getPipelineContext(context.pipelineRunId);
    expect(retrievedContext).not.toBeNull();
    expect(retrievedContext?.interventionResult.actions.map((a: any) => a.title)).toEqual(actionTitles);
    expect(retrievedContext?.interventionResult.recommendation?.candidateTitle || retrievedContext?.interventionResult.title).toBe(planTitle);
    expect(retrievedContext?.approvalStatus).toBe('APPROVED');
  });

  it('keeps intervention plan synchronized across different city scopes and execution modes', async () => {
    const vjaContext = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    const vizagContext = await phase7PipelineBridgeService.runUnifiedPipeline('city-vizag', 'SIMULATION');

    expect(vjaContext.cityId).toBe('city-vja');
    expect(vjaContext.executionMode).toBe('LIVE_READ_ONLY');
    expect(vizagContext.cityId).toBe('city-vizag');
    expect(vizagContext.executionMode).toBe('SIMULATION');

    expect(vjaContext.pipelineRunId).not.toBe(vizagContext.pipelineRunId);
    expect(vjaContext.interventionResult).toBeDefined();
    expect(vizagContext.interventionResult).toBeDefined();
  });
});
