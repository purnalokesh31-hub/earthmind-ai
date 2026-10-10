import { describe, it, expect, vi } from 'vitest';
import { TimelineService } from '../../lib/server/services/timeline.service';

describe('Phase 6.4 — Enterprise Timeline Engine Subsystem', () => {
  it('should record immutable timeline events and format notes with metadata', async () => {
    const mockPrisma = {
      incidentTimeline: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: `tl-${Date.now()}`,
          incidentId: data.incidentId,
          action: data.action,
          actorId: data.actorId || null,
          previousStatus: data.previousStatus || null,
          newStatus: data.newStatus || null,
          note: data.note || null,
          createdAt: new Date(),
        })),
        findMany: vi.fn().mockImplementation(async () => [
          {
            id: 'tl-101',
            incidentId: 'inc-1',
            action: 'INCIDENT_CREATED',
            actorId: 'usr-1',
            previousStatus: null,
            newStatus: 'CREATED',
            note: 'Created incident [meta:{"severity":"CRITICAL"}]',
            createdAt: new Date(),
          },
          {
            id: 'tl-102',
            incidentId: 'inc-1',
            action: 'INCIDENT_VERIFIED',
            actorId: 'usr-2',
            previousStatus: 'CREATED',
            newStatus: 'VERIFIED',
            note: 'Verified by operator',
            createdAt: new Date(),
          },
        ]),
      },
    };

    const timelineService = new TimelineService(mockPrisma as any);

    const event = await timelineService.recordEvent({
      incidentId: 'inc-1',
      action: 'INCIDENT_CREATED',
      actorId: 'usr-1',
      newStatus: 'CREATED',
      note: 'Created incident',
      metadata: { severity: 'CRITICAL' },
    });

    expect(event.action).toBe('INCIDENT_CREATED');
    expect(event.incidentId).toBe('inc-1');
    expect(event.metadata).toEqual({ severity: 'CRITICAL' });

    const timeline = await timelineService.getTimelineForIncident('inc-1');
    expect(timeline).toHaveLength(2);
    expect(timeline[0].metadata).toEqual({ severity: 'CRITICAL' });
    expect(timeline[0].note).toBe('Created incident');
  });
});
