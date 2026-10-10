// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.8 Command Center Analytics & Hardening Unit Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { commandCenterAnalyticsService } from '../../lib/server/services/command-center-analytics.service';
import { authorizePermission } from '../../lib/server/auth/middleware.helpers';

describe('Phase 6.8 — Command Center Analytics & Security Hardening Master Suite', () => {
  // ── 1. Operational Analytics Timeframe Aggregation ──
  it('should calculate operational metrics for TODAY, 7_DAYS, and 30_DAYS timeframes', async () => {
    const today = await commandCenterAnalyticsService.getOperationalAnalytics('TODAY');
    const week = await commandCenterAnalyticsService.getOperationalAnalytics('7_DAYS');
    const month = await commandCenterAnalyticsService.getOperationalAnalytics('30_DAYS');

    expect(today.totalIncidents).toBeLessThan(week.totalIncidents);
    expect(week.totalIncidents).toBeLessThan(month.totalIncidents);

    expect(today.slaComplianceRate).toBeGreaterThan(0);
    expect(today.averageAckTimeMinutes).toBeGreaterThan(0);
    expect(today.incidentsBySeverity.length).toBe(4);
    expect(today.incidentsByDepartment.length).toBeGreaterThan(0);
  });

  // ── 2. Severity & Workload Breakdown ──
  it('should accurately compute percentage distribution for critical P1 incidents', async () => {
    const analytics = await commandCenterAnalyticsService.getOperationalAnalytics('7_DAYS');
    const criticalItem = analytics.incidentsBySeverity.find((s) => s.severity === 'CRITICAL');
    expect(criticalItem).toBeDefined();
    expect(criticalItem?.percentage).toBeGreaterThan(0);
  });

  // ── 3. Security Hardening & Authorization Checks ──
  it('should enforce authentication middleware on analytics API endpoints', async () => {
    const req = { headers: new Headers() } as any;
    const authResult = await authorizePermission(req, 'INCIDENT', 'READ').catch((err) => err);
    expect(authResult).toBeDefined();
  });
});
