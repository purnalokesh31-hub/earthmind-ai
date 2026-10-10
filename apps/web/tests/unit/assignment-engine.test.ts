import { describe, it, expect, vi } from 'vitest';
import { AssignmentService } from '../../lib/server/services/assignment.service';
import { MockIncidentRepository } from '../mocks/mock-incident.repository';

describe('Phase 6.4 — Enterprise Assignment & Dispatch Engine Subsystem', () => {
  it('should assign officer transactionally and trigger audit, notification, & timeline events', async () => {
    const mockRepo = new MockIncidentRepository();
    const inc = await mockRepo.create({
      title: 'Wildfire in Zone 4',
      description: 'North Forest Sector',
      status: 'ACTIVE',
      severity: 'HIGH',
      category: 'WILDFIRE',
      department: 'FIRE',
      riskScore: 75,
      locationName: 'North Forest Sector',
    });

    const mockPrisma = {
      incident: {
        findUnique: vi.fn().mockResolvedValue({
          id: inc.id,
          incidentCode: inc.incidentCode,
          title: inc.title,
          locationName: inc.locationName,
          status: 'ACTIVE',
          severity: 'HIGH',
          riskScore: 75,
          deletedAt: null,
        }),
        update: vi.fn().mockResolvedValue({ id: inc.id, status: 'DISPATCHED' }),
      },
      user: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.id === 'usr-officer-1') {
            return { id: 'usr-officer-1', fullName: 'Officer John Doe', role: 'FIELD_OFFICER', isActive: true, deletedAt: null };
          }
          if (where.id === 'usr-cmd-1') {
            return { id: 'usr-cmd-1', fullName: 'Commander Sarah', role: 'COMMANDER', isActive: true, deletedAt: null };
          }
          return null;
        }),
      },
      assignment: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: 'asg-1',
          ...data,
          assignedAt: new Date(),
          completedAt: null,
        })),
      },
      $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrisma)),
    };

    const mockAudit = { logEvent: vi.fn().mockResolvedValue(undefined) };
    const mockNotification = { create: vi.fn().mockResolvedValue(undefined) };
    const mockTimeline = { recordEvent: vi.fn().mockResolvedValue(undefined) };

    const assignmentService = new AssignmentService(
      mockRepo,
      mockAudit as any,
      mockNotification as any,
      mockTimeline as any,
      mockPrisma as any
    );

    const result = await assignmentService.assignOfficer(inc.id, 'usr-officer-1', 'usr-cmd-1', 'Dispatching unit immediately');

    expect(result.id).toBe(inc.id);

    expect(mockAudit.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'OFFICER_ASSIGNED' }));
    expect(mockNotification.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'INCIDENT_ASSIGNMENT' }));
    expect(mockTimeline.recordEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'OFFICER_ASSIGNED' }));
  });

  it('should auto-reassign incident to department officer with lowest workload', async () => {
    const mockRepo = new MockIncidentRepository();
    const inc = await mockRepo.create({
      title: 'Structural Erosion',
      description: 'Bridge pillar damage',
      status: 'ACTIVE',
      severity: 'HIGH',
      category: 'INFRASTRUCTURE',
      department: 'TRANSPORT',
      riskScore: 70,
      locationName: 'East Bridge',
    });

    const mockPrisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'usr-officer-1', fullName: 'Officer Busy', role: 'FIELD_OFFICER', isActive: true, deletedAt: null, assignedIncidents: [{}, {}, {}] },
          { id: 'usr-officer-2', fullName: 'Officer Free', role: 'FIELD_OFFICER', isActive: true, deletedAt: null, assignedIncidents: [{}] },
        ]),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.id === 'usr-officer-2') {
            return { id: 'usr-officer-2', fullName: 'Officer Free', role: 'FIELD_OFFICER', isActive: true, deletedAt: null };
          }
          return { id: 'usr-cmd-1', fullName: 'Commander', role: 'COMMANDER', isActive: true, deletedAt: null };
        }),
      },
      incident: {
        findUnique: vi.fn().mockResolvedValue({ id: inc.id, status: 'ACTIVE', deletedAt: null }),
        update: vi.fn().mockResolvedValue({ id: inc.id, status: 'DISPATCHED' }),
      },
      assignment: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: 'asg-2',
          ...data,
          assignedAt: new Date(),
        })),
      },
      $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrisma)),
    };

    const assignmentService = new AssignmentService(mockRepo, undefined, undefined, undefined, mockPrisma as any);
    const result = await assignmentService.autoReassign(inc.id, 'dept-fire', 'usr-cmd-1');

    expect(result.id).toBe(inc.id);
  });

  it('should escalate priority and log timeline event', async () => {
    const mockRepo = new MockIncidentRepository();
    const inc = await mockRepo.create({
      title: 'Gas Leak',
      description: 'Minor pipeline leak',
      status: 'ACTIVE',
      severity: 'MEDIUM',
      category: 'HAZMAT',
      department: 'ENVIRONMENTAL',
      riskScore: 50,
      locationName: 'Refinery South',
    });

    const mockPrisma = {
      incident: {
        findUnique: vi.fn().mockResolvedValue({ id: inc.id, severity: 'MEDIUM', riskScore: 50, deletedAt: null }),
        update: vi.fn().mockImplementation(async ({ data }) => ({ id: inc.id, ...data })),
      },
      $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrisma)),
    };

    const mockTimeline = { recordEvent: vi.fn().mockResolvedValue(undefined) };
    const assignmentService = new AssignmentService(mockRepo, undefined, undefined, mockTimeline as any, mockPrisma as any);

    const escalated = await assignmentService.escalatePriority(inc.id, 'CRITICAL', 'usr-cmd-1', 'Hazard expanding');

    expect(escalated.severity).toBe('CRITICAL');
    expect(mockTimeline.recordEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'PRIORITY_ESCALATED' }));
  });
});
