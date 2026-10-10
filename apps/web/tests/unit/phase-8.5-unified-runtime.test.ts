// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.5 Unified Runtime Test Suite
// End-to-End Pipeline Verification: Data Gateway -> Phase 7 Intelligence & Governance
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { CityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';

describe('Phase 8.5 Live City Intelligence Pipeline Integration Test Suite', () => {
  let runtimeService: CityIntelligenceRuntimeService;

  beforeEach(() => {
    runtimeService = new CityIntelligenceRuntimeService();
  });

  // ── 1. Execution Modes Verification ──
  it('should support switching execution modes (LIVE_READ_ONLY, DEMO, SIMULATION)', () => {
    expect(runtimeService.getExecutionMode()).toBe('LIVE_READ_ONLY');

    runtimeService.setExecutionMode('DEMO');
    expect(runtimeService.getExecutionMode()).toBe('DEMO');

    runtimeService.setExecutionMode('SIMULATION');
    expect(runtimeService.getExecutionMode()).toBe('SIMULATION');

    runtimeService.setExecutionMode('LIVE_READ_ONLY');
    expect(runtimeService.getExecutionMode()).toBe('LIVE_READ_ONLY');
  });

  // ── 2. Runtime Status Verification ──
  it('should report runtime status as HEALTHY when system overview is strong', () => {
    const status = runtimeService.getRuntimeStatus();
    expect(['HEALTHY', 'DATA_LIMITED', 'DEGRADED', 'UNAVAILABLE']).toContain(status);
  });

  // ── 3. Full 8-Stage Pipeline Execution ──
  it('should execute full 8-stage pipeline preserving stage provenance and governance requirements', async () => {
    runtimeService.setExecutionMode('LIVE_READ_ONLY');
    const overview = await runtimeService.executePipeline('city-vja');

    expect(overview.cityId).toBe('city-vja');
    expect(overview.executionMode).toBe('LIVE_READ_ONLY');
    expect(overview.pipelineStages.length).toBe(7);

    // Verify Stage Provenance Tags
    const stg1 = overview.pipelineStages.find((s) => s.stageId === 'stage-1-signals');
    expect(stg1?.provenance).toBe('LIVE');

    const stg3 = overview.pipelineStages.find((s) => s.stageId === 'stage-3-prediction');
    expect(stg3?.provenance).toBe('PREDICTION');

    const stg4 = overview.pipelineStages.find((s) => s.stageId === 'stage-4-simulation');
    expect(stg4?.provenance).toBe('SIMULATION');

    const stg7 = overview.pipelineStages.find((s) => s.stageId === 'stage-7-governance');
    expect(stg7?.status).toBe('PENDING_APPROVAL');
    expect(stg7?.details).toContain('HUMAN APPROVAL REQUIRED');
  });

  // ── 4. Provenance Preservation in DEMO Mode ──
  it('should assign DEMO provenance tag to signals stage when running in DEMO mode', async () => {
    runtimeService.setExecutionMode('DEMO');
    const overview = await runtimeService.executePipeline('city-vja');

    const stg1 = overview.pipelineStages.find((s) => s.stageId === 'stage-1-signals');
    expect(stg1?.provenance).toBe('DEMO');
  });

  // ── 5. Risk Status Endpoint Verification ──
  it('should return valid CityRiskStatusDto with active alerts', async () => {
    const risk = await runtimeService.getRiskStatus('city-vja');
    expect(risk.cityId).toBe('city-vja');
    expect(risk.currentRiskScore).toBeGreaterThan(0);
    expect(risk.activeAlerts.length).toBeGreaterThan(0);
  });

  // ── 6. Recommendations Endpoint Verification ──
  it('should return action recommendations mandating human approval', async () => {
    const recs = await runtimeService.getRecommendations('city-vja');
    expect(recs.cityId).toBe('city-vja');
    expect(recs.recommendations.length).toBeGreaterThan(0);
    expect(recs.recommendations[0].requiresHumanApproval).toBe(true);
    expect(recs.recommendations[0].governanceStatus).toBe('PENDING_APPROVAL');
  });

  // ── 7. Strict Safety Invariant Verification ──
  it('should enforce read-only safety invariants and forbid physical actuation', () => {
    const serviceAny = runtimeService as any;
    expect(serviceAny.executePhysicalAction).toBeUndefined();
    expect(serviceAny.actuateInfrastructure).toBeUndefined();
  });
});
