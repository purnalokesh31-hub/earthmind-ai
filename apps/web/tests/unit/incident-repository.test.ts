import { describe, it, expect, vi } from 'vitest';
import { PrismaIncidentRepository } from '../../lib/server/repositories/incident.repository';

describe('Phase 6.4 — Enterprise Incident Repository Verification', () => {
  const mockIncident = {
    id: 'inc-repo-001',
    incidentCode: 'EM-2026-101',
    title: 'Chemical Contamination in River',
    description: 'High levels of industrial runoff detected',
    status: 'ACTIVE',
    severity: 'HIGH',
    category: 'WATER_POLLUTION',
    department: 'WATER_SAFETY',
    riskScore: 78,
    locationName: 'North River Basin',
    latitude: 12.97,
    longitude: 77.59,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaClient: any = {
    incident: {
      findUnique: vi.fn().mockResolvedValue(mockIncident),
      findMany: vi.fn().mockResolvedValue([mockIncident]),
      create: vi.fn().mockResolvedValue(mockIncident),
      update: vi.fn().mockResolvedValue({ ...mockIncident, status: 'DISPATCHED', assignedOfficerId: 'usr-officer-01' }),
      delete: vi.fn().mockResolvedValue(mockIncident),
      count: vi.fn().mockResolvedValue(1),
    },
    incidentTimeline: {
      create: vi.fn().mockResolvedValue({ id: 'tl-001' }),
    },
    assignment: {
      create: vi.fn().mockResolvedValue({ id: 'asgn-001' }),
    },
    $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrismaClient)),
  };

  const repository = new PrismaIncidentRepository(mockPrismaClient);

  it('should find incident by id and map entity shape', async () => {
    const result = await repository.findById('inc-repo-001');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('inc-repo-001');
    expect(result?.title).toBe('Chemical Contamination in River');
    expect(result?.riskScore).toBe(78);
  });

  it('should create new incident entity in database', async () => {
    const created = await repository.create({
      title: 'Chemical Contamination in River',
      description: 'High levels of industrial runoff detected',
      status: 'ACTIVE',
      severity: 'HIGH',
      category: 'WATER_POLLUTION',
      department: 'WATER_SAFETY',
      riskScore: 78,
      locationName: 'North River Basin',
    });

    expect(mockPrismaClient.incident.create).toHaveBeenCalled();
    expect(created.title).toBe('Chemical Contamination in River');
  });

  it('should search incidents with filter criteria', async () => {
    const results = await repository.search('Chemical', { status: 'ACTIVE', severity: 'HIGH' });

    expect(mockPrismaClient.incident.findMany).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('WATER_POLLUTION');
  });

  it('should assign officer within Prisma transaction', async () => {
    const assigned = await repository.assignOfficer('inc-repo-001', 'usr-officer-01', 'usr-cmd-01', 'Immediate dispatch');

    expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    expect(mockPrismaClient.incident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inc-repo-001' },
        data: expect.objectContaining({ assignedOfficerId: 'usr-officer-01' }),
      })
    );
    expect(assigned.assignedOfficerId).toBe('usr-officer-01');
  });

  it('should change status and record timeline event', async () => {
    await repository.changeStatus('inc-repo-001', 'RESOLVED', 'usr-officer-01', 'Hazard cleared');

    expect(mockPrismaClient.incidentTimeline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: 'inc-repo-001',
          action: 'STATUS_CHANGED',
        }),
      })
    );
  });

  it('should archive and restore incident entity', async () => {
    await repository.archive('inc-repo-001', 'usr-admin', 'Case closed');
    expect(mockPrismaClient.incidentTimeline.create).toHaveBeenCalled();

    await repository.restore('inc-repo-001');
    expect(mockPrismaClient.incident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inc-repo-001' },
        data: expect.objectContaining({ deletedAt: null, status: 'ACTIVE' }),
      })
    );
  });
});
