import { describe, it, expect, vi } from 'vitest';
import { IncidentService } from '../../lib/server/services/incident.service';

describe('Phase 6.4 — Enterprise IncidentService Unit Verification', () => {
  const mockIncidentEntity = {
    id: 'inc-svc-101',
    incidentCode: 'EM-2026-909',
    title: 'Substation Transformer Fire',
    description: 'Electrical transformer overheated causing intense blaze',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    category: 'INFRASTRUCTURE',
    department: 'POWER_GRID',
    departmentId: 'dept-power',
    riskScore: 85,
    locationName: 'Substation North',
    lat: 12.98,
    lng: 77.6,
    createdById: 'usr-citizen-01',
    assignedOfficerId: null,
    createdAt: new Date('2026-08-01T12:00:00Z'),
    updatedAt: new Date('2026-08-01T12:00:00Z'),
  };

  const mockIncidentRepo = {
    findById: vi.fn().mockResolvedValue(mockIncidentEntity),
    findMany: vi.fn().mockResolvedValue([mockIncidentEntity]),
    create: vi.fn().mockResolvedValue(mockIncidentEntity),
    update: vi.fn().mockResolvedValue({ ...mockIncidentEntity, riskScore: 92 }),
    delete: vi.fn().mockResolvedValue(true),
    search: vi.fn().mockResolvedValue([mockIncidentEntity]),
    assignOfficer: vi.fn().mockResolvedValue({ ...mockIncidentEntity, assignedOfficerId: 'usr-officer-99', status: 'DISPATCHED' }),
    changeStatus: vi.fn().mockImplementation(async (_id, status) => ({ ...mockIncidentEntity, status })),
    addTimelineEvent: vi.fn().mockResolvedValue(undefined),
    archive: vi.fn().mockResolvedValue({ ...mockIncidentEntity, status: 'ARCHIVED' }),
    restore: vi.fn().mockResolvedValue({ ...mockIncidentEntity, status: 'ACTIVE' }),
    count: vi.fn().mockResolvedValue(1),
  };

  const mockEvidenceRepo = {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    linkToIncident: vi.fn().mockResolvedValue(undefined),
  };

  const mockAuditRepo = {
    findById: vi.fn(),
    create: vi.fn(),
    logEvent: vi.fn().mockResolvedValue({ id: 'aud-svc-1' }),
  };

  const mockNotificationRepo = {
    findById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'notif-svc-1' }),
  };

  const service = new IncidentService(
    mockIncidentRepo as any,
    mockEvidenceRepo as any,
    mockAuditRepo as any,
    mockNotificationRepo as any
  );

  it('should create incident and return clean IncidentResponseDto without Prisma model exposure', async () => {
    const result = await service.createIncident(
      {
        title: 'Substation Transformer Fire',
        description: 'Electrical transformer overheated causing intense blaze',
        category: 'INFRASTRUCTURE',
        locationName: 'Substation North',
      },
      'usr-citizen-01'
    );

    expect(result.id).toBe('inc-svc-101');
    expect(result.incidentCode).toBe('EM-2026-909');
    expect(result.status).toBe('ACTIVE');
    expect(typeof result.createdAt).toBe('string'); // ISO string format
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'INCIDENT_CREATED' }));
  });

  it('should assign officer, log audit event, and send notification', async () => {
    const result = await service.assignOfficer('inc-svc-101', 'usr-officer-99', 'usr-cmd-01', 'Immediate dispatch');

    expect(result.assignedOfficerId).toBe('usr-officer-99');
    expect(result.status).toBe('DISPATCHED');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'OFFICER_ASSIGNED' }));
    expect(mockNotificationRepo.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'INCIDENT_ASSIGNMENT' }));
  });

  it('should change status and execute lifecycle transitions (verify, resolve, archive, restore)', async () => {
    const verified = await service.verifyIncident('inc-svc-101', 'usr-op-01');
    expect(verified.status).toBe('VERIFIED');

    const resolved = await service.resolveIncident('inc-svc-101', 'usr-officer-99');
    expect(resolved.status).toBe('RESOLVED');

    const archived = await service.archiveIncident('inc-svc-101', 'usr-admin');
    expect(archived.status).toBe('ARCHIVED');

    const restored = await service.restoreIncident('inc-svc-101', 'usr-admin');
    expect(restored.status).toBe('ACTIVE');
  });

  it('should merge duplicate incident into primary incident', async () => {
    const primary = await service.mergeIncident('inc-svc-101', 'inc-svc-102', 'usr-admin');

    expect(primary.id).toBe('inc-svc-101');
    expect(mockIncidentRepo.archive).toHaveBeenCalledWith('inc-svc-102', 'usr-admin', expect.any(String));
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'INCIDENT_MERGED' }));
  });

  it('should recalculate risk score using damage score and AI confidence', async () => {
    const result = await service.recalculateRisk('inc-svc-101', 90, 95);

    // Risk = (90 * 0.7) + (95 * 0.3) = 63 + 28.5 = 92
    expect(mockIncidentRepo.update).toHaveBeenCalledWith('inc-svc-101', { riskScore: 92 });
    expect(result.riskScore).toBe(92);
  });
});
