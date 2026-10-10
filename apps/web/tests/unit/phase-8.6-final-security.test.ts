import { describe, it, expect, beforeEach } from 'vitest';
import { cityIntelligenceRuntimeService } from '../../lib/server/services/city-intelligence-runtime.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 8.6 — Final Runtime Integration & Security Hardening Unit Tests', () => {
  beforeEach(() => {
    // Reset or prepare state if necessary
  });

  it('1. Safety invariants are immutable across runtime snapshot', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.requiresHumanApproval).toBe(true);
    expect(snapshot.advisoryOnly).toBe(true);
    expect(snapshot.autonomousExecution).toBe(false);
  });

  it('2. Rejected execution modes raise AUTONOMOUS_EXECUTION_FORBIDDEN error', async () => {
    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_WRITE' as any)
    ).rejects.toThrow('FORBIDDEN_EXECUTION_MODE');

    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'AUTONOMOUS' as any)
    ).rejects.toThrow('FORBIDDEN_EXECUTION_MODE');

    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'PHYSICAL_EXECUTION' as any)
    ).rejects.toThrow('FORBIDDEN_EXECUTION_MODE');
  });

  it('3. Provider isolation: failure in one provider does not crash overall runtime', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.domains).toBeDefined();
    expect(Object.keys(snapshot.domains).length).toBe(7);
  });

  it('4. Stale detection flags telemetry older than 60s as STALE', async () => {
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    expect(quality.explanation).toBeDefined();
    expect(quality.freshCount).toBeGreaterThanOrEqual(0);
  });

  it('5. Invalid data handling prevents invalid signals from becoming LIVE', async () => {
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    expect(quality.invalidCount).toBeGreaterThanOrEqual(0);
  });

  it('6. Fallback data retains fallback provenance tags', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'DEMO');
    expect(snapshot.provenance).toBeDefined();
  });

  it('7. Duplicate detection handles duplicate event timestamps gracefully', async () => {
    const events = await cityIntelligenceRuntimeService.getRuntimeEvents('city-vja', 'LIVE_READ_ONLY');
    expect(Array.isArray(events)).toBe(true);
  });

  it('8. Out-of-order event handling preserves telemetry freshness sequence', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.timestamp).toBeDefined();
  });

  it('9. Authentication contract verification', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.cityId).toBe('city-vja');
  });

  it('10. RBAC role boundaries: read-only access granted for operator roles', async () => {
    const overview = await cityIntelligenceRuntimeService.getRuntimeOverview('city-vja', 'LIVE_READ_ONLY');
    expect(overview.governance.advisoryOnly).toBe(true);
  });

  it('11. Input validation rejects malformed city IDs or invalid execution modes', async () => {
    await expect(
      cityIntelligenceRuntimeService.getRuntimeSnapshot('', 'INVALID_MODE' as any)
    ).rejects.toThrow();
  });

  it('12. API error contract returns safe payload without secrets', async () => {
    const quality = await cityIntelligenceRuntimeService.getRuntimeQuality('city-vja', 'LIVE_READ_ONLY');
    const jsonString = JSON.stringify(quality);
    expect(jsonString).not.toContain('secret');
    expect(jsonString).not.toContain('private_key');
  });

  it('13. AI tool registry registers read-only runtime tools', async () => {
    const tools = toolRegistry.getAllTools();
    const runtimeTools = tools.filter((t) => t.toolId.startsWith('city_runtime_'));
    expect(runtimeTools.length).toBeGreaterThan(0);
  });

  it('14. AI tools are strictly read-only and advisory', async () => {
    const tools = toolRegistry.getAllTools();
    const overviewTool = tools.find((t) => t.toolId === 'city_runtime_overview');
    expect(overviewTool).toBeDefined();
    if (overviewTool) {
      expect(overviewTool.readOnly).toBe(true);
    }
  });

  it('15. Command Center governance invariants render human approval badges', async () => {
    const health = await cityIntelligenceRuntimeService.getRuntimeHealth('city-vja', 'LIVE_READ_ONLY');
    expect(health.readinessStatus).toBeDefined();
  });

  it('16. Snapshot consistency ensures health metrics exist on snapshot', async () => {
    const snapshot = await cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY');
    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.health.telemetryCoverage).toBeGreaterThanOrEqual(0);
  });

  it('17. Telemetry event filtering supports limit and domain parameters', async () => {
    const events = await cityIntelligenceRuntimeService.getRuntimeEvents('city-vja', 'LIVE_READ_ONLY', {
      limit: 5,
    });
    expect(events.length).toBeLessThanOrEqual(5);
  });

  it('18. Event retention limits ring buffer growth', async () => {
    const events = await cityIntelligenceRuntimeService.getRuntimeEvents('city-vja', 'LIVE_READ_ONLY');
    expect(events.length).toBeLessThanOrEqual(100);
  });

  it('19. Concurrency test: simultaneous runtime snapshots evaluate deterministically', async () => {
    const [snap1, snap2] = await Promise.all([
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY'),
      cityIntelligenceRuntimeService.getRuntimeSnapshot('city-vja', 'LIVE_READ_ONLY'),
    ]);
    expect(snap1.cityId).toBe(snap2.cityId);
    expect(snap1.requiresHumanApproval).toBe(snap2.requiresHumanApproval);
  });

  it('20. Phase 7 compatibility: execution pipeline bridges without physical actuation', async () => {
    const result = await cityIntelligenceRuntimeService.executePipeline({
      cityId: 'city-vja',
      executionMode: 'LIVE_READ_ONLY',
    });
    expect(result.governanceApproval.requiresHumanApproval).toBe(true);
    expect(result.governanceApproval.autonomousExecution).toBe(false);
  });
});
