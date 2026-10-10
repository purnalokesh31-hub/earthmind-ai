// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.11 Situation Awareness & Decision Support Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { situationAwarenessService } from '../../lib/server/services/situation-awareness.service';
import { priorityIntelligenceService } from '../../lib/server/services/priority-intelligence.service';
import { decisionSupportService } from '../../lib/server/services/decision-support.service';
import { operationalHealthService } from '../../lib/server/services/operational-health.service';

describe('Phase 6.11 — Situation Awareness & Decision Support Suite', () => {
  // ── 1. Situation Snapshot Aggregation ──
  it('should generate real-time SituationSnapshotDto with top operational priorities', async () => {
    const snapshot = await situationAwarenessService.getSnapshot('CITY', 'city-vja');
    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.activeIncidentCount).toBeGreaterThan(0);
    expect(snapshot.topOperationalPriorities.length).toBeGreaterThan(0);
    expect(snapshot.topOperationalPriorities[0].priorityScore).toBe(96);
  });

  // ── 2. Priority Intelligence Ranking ──
  it('should rank operational priorities deterministically with explainable factors', async () => {
    const priorities = await priorityIntelligenceService.getRankedPriorities();
    expect(priorities.length).toBe(3);
    expect(priorities[0].recommendedAttentionOrder).toBe(1);
    expect(priorities[0].priorityLevel).toBe('CRITICAL');
    expect(priorities[0].explanation).toContain('structural road collapse');
  });

  // ── 3. Decision Support Advisory & Human-in-the-Loop Controls ──
  it('should list pending advisory recommendations requiring human authorization', async () => {
    const recs = await decisionSupportService.listPendingRecommendations();
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].requiresHumanApproval).toBe(true);
    expect(recs[0].status).toBe('PENDING');
  });

  it('should authorize (approve) recommendation and update status', async () => {
    const recs = await decisionSupportService.listPendingRecommendations();
    const targetId = recs[0].recommendationId;

    const approved = await decisionSupportService.approveRecommendation(targetId, 'dutycommander@earthmind.gov');
    expect(approved.status).toBe('APPROVED');
  });

  it('should reject recommendation and record rejection status', async () => {
    const recs = await decisionSupportService.listPendingRecommendations();
    if (recs.length > 0) {
      const targetId = recs[0].recommendationId;
      const rejected = await decisionSupportService.rejectRecommendation(targetId, 'dutycommander@earthmind.gov', 'Resource needed elsewhere');
      expect(rejected.status).toBe('REJECTED');
    }
  });

  // ── 4. Operational Health Summary ──
  it('should calculate SLA compliance % and department capacity workloads', async () => {
    const health = await operationalHealthService.getHealthSummary();
    expect(health.slaCompliancePercentage).toBeGreaterThan(90);
    expect(health.departmentWorkloads.length).toBeGreaterThan(0);
    expect(health.departmentWorkloads[0].departmentName).toBe('Public Works Department');
  });
});
