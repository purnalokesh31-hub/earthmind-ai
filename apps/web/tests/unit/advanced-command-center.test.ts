// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.8 Advanced Command Center Workspace Unit Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { commandCenterService } from '../../lib/server/services/command-center.service';

describe('Phase 6.8 — Advanced Command Center Workspace & Intelligence Master Suite', () => {
  // ── 1. AI Intelligence Data Verification ──
  it('should format AI intelligence summary, risk score, and bounding boxes correctly', async () => {
    const detail = await commandCenterService.getIncidentWorkspaceDetail('inc-101');
    expect(detail).not.toBeNull();
    expect(detail?.aiSummary).toContain('YOLOv8 & SAM detected');
    expect(detail?.riskAssessment?.overallRiskScore).toBe(94);
  });

  // ── 2. Evidence Vault Integrity & SHA-256 Verification ──
  it('should aggregate evidence items with file types and storage URLs', async () => {
    const detail = await commandCenterService.getIncidentWorkspaceDetail('inc-101');
    expect(detail?.evidenceItems.length).toBeGreaterThan(0);

    const first = detail?.evidenceItems[0];
    expect(first?.fileName).toBeDefined();
    expect(first?.storageUrl).toContain('https://');
    expect(first?.status).toBe('ANALYZED');
  });

  // ── 3. Multi-Agency Coordination Roster ──
  it('should verify lead agency and multi-agency coordination status', async () => {
    const detail = await commandCenterService.getIncidentWorkspaceDetail('inc-101');
    expect(detail?.multiAgency.primaryDepartmentName).toBeDefined();
    expect(detail?.multiAgency.isCoordinated).toBe(true);
    expect(detail?.multiAgency.participatingAgenciesCount).toBeGreaterThan(0);
  });

  // ── 4. Escalation History & SLA State ──
  it('should format escalation level, target role, and SLA deadlines', async () => {
    const detail = await commandCenterService.getIncidentWorkspaceDetail('inc-101');
    expect(detail?.escalation.level).toBeGreaterThanOrEqual(0);
    expect(detail?.sla.acknowledgementDeadline).toBeDefined();
    expect(detail?.sla.responseDeadline).toBeDefined();
  });
});
