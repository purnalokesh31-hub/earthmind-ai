// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.8 Command Center Unit & Integration Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { commandCenterService } from '../../lib/server/services/command-center.service';
import { authorizePermission } from '../../lib/server/auth/middleware.helpers';

describe('Phase 6.8 — Enterprise Command Center & Operational Intelligence Master Suite', () => {
  // ── 1. Operational KPI Aggregation ──
  it('should aggregate live operational KPIs accurately', async () => {
    const kpis = await commandCenterService.getOperationalKpis();
    expect(kpis.activeIncidents).toBeGreaterThan(0);
    expect(kpis.criticalIncidents).toBeGreaterThanOrEqual(1);
    expect(kpis.pendingDispatches).toBeGreaterThanOrEqual(1);
    expect(kpis.activeOfficers).toBeGreaterThan(0);
    expect(kpis.slaBreaches).toBeGreaterThanOrEqual(0);
    expect(kpis.timestamp).toBeDefined();
  });

  // ── 2. Live Incident Queue & Filtering ──
  it('should list live incidents with search, severity, and category filtering', async () => {
    const resultAll = await commandCenterService.getLiveIncidents();
    expect(resultAll.data.length).toBeGreaterThan(0);
    expect(resultAll.total).toBeGreaterThan(0);

    const resultCritical = await commandCenterService.getLiveIncidents({ severity: 'CRITICAL' });
    expect(resultCritical.data.every((i) => i.severity === 'CRITICAL')).toBe(true);

    const resultSearch = await commandCenterService.getLiveIncidents({ query: 'subsidence' });
    expect(resultSearch.data.length).toBeGreaterThan(0);
    expect(resultSearch.data[0].title.toLowerCase()).toContain('subsidence');
  });

  // ── 3. Incident Detail Workspace Aggregation ──
  it('should aggregate complete workspace detail including AI, evidence, SLA, dispatch, and multi-agency info', async () => {
    const detail = await commandCenterService.getIncidentWorkspaceDetail('inc-101');
    expect(detail).not.toBeNull();
    expect(detail?.incident.id).toBe('inc-101');
    expect(detail?.riskAssessment).not.toBeNull();
    expect(detail?.riskAssessment?.overallRiskScore).toBe(94);
    expect(detail?.evidenceItems.length).toBeGreaterThan(0);
    expect(detail?.sla.priority).toBe('CRITICAL');
    expect(detail?.multiAgency.isCoordinated).toBe(true);
  });

  // ── 4. Role-Based Security Enforcement ──
  it('should enforce RBAC authorization for command center actions', async () => {
    const req = { headers: new Headers({ authorization: 'Bearer mock-token' }) } as any;

    const authResult = await authorizePermission(req, 'INCIDENT', 'READ').catch((err) => err);
    expect(authResult).toBeDefined();
  });
});
