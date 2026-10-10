import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../../lib/server/services/analytics.service';
import { MockIncidentRepository } from '../mocks/mock-incident.repository';
import { InMemoryEventBus } from '../../lib/server/events/event-bus';

describe('Phase 6.4 — Enterprise Event-Driven Analytics Subsystem', () => {
  it('should dynamically calculate incident counters, department workload, SLA, risk, and Earth Health metrics', async () => {
    const repo = new MockIncidentRepository();
    const bus = new InMemoryEventBus();
    const service = new AnalyticsService(repo, bus);

    await repo.create({
      title: 'Oil Spill at Bay',
      description: 'Major marine pollution incident',
      status: 'ACTIVE',
      severity: 'CRITICAL',
      category: 'ENVIRONMENTAL',
      department: 'MARINE_HEALTH',
      riskScore: 85,
      locationName: 'South Harbor',
    });

    await repo.create({
      title: 'Structural Crack on Bridge',
      description: 'Concrete erosion detected',
      status: 'RESOLVED',
      severity: 'MEDIUM',
      category: 'INFRASTRUCTURE',
      department: 'TRANSPORT',
      riskScore: 40,
      locationName: 'North Highway',
    });

    const summary = await service.getMissionControlSummary();

    expect(summary.incidentCounters.total).toBe(2);
    expect(summary.incidentCounters.active).toBe(1);
    expect(summary.incidentCounters.critical).toBe(1);
    expect(summary.incidentCounters.resolved).toBe(1);

    expect(summary.departmentWorkload).toHaveLength(2);
    expect(summary.risk.averageRiskScore).toBe(62.5);
    expect(summary.earthHealth.sustainabilityScore).toBeGreaterThan(50);
    expect(summary.systemStatus).toBe('HEALTHY');
  });
});
