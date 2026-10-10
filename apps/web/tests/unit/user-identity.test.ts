import { describe, it, expect, vi } from 'vitest';
import { UserIdentityService } from '../../lib/server/auth';
import { RoleType } from '@prisma/client';

describe('Phase 6.3.9 — User Identity Service Verification', () => {
  const mockUser = {
    id: 'usr-identity-01',
    email: 'officer.davis@earthmind.gov',
    fullName: 'Officer Davis',
    role: RoleType.FIELD_OFFICER,
    departmentId: 'dept-01',
    isActive: true,
    lastLoginAt: new Date('2026-08-01T10:00:00Z'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T10:00:00Z'),
  };

  const mockDepartment = { id: 'dept-01', name: 'Rapid Response Division' };
  const mockIncidents = [{ id: 'inc-01', title: 'Pollution Hazard', assignedOfficerId: 'usr-identity-01' }];
  const mockActivity = [{ id: 'audit-01', action: 'USER_LOGIN', actorId: 'usr-identity-01' }];

  const mockUserRepo = {
    findById: vi.fn().mockResolvedValue(mockUser),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue(mockUser),
    delete: vi.fn(),
    findAll: vi.fn(),
    count: vi.fn(),
  };

  const mockDeptRepo = {
    findById: vi.fn().mockResolvedValue(mockDepartment),
    findByCode: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    count: vi.fn(),
  };

  const mockIncidentRepo = {
    findById: vi.fn(),
    findByIncidentNumber: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn().mockResolvedValue(mockIncidents),
    count: vi.fn(),
  };

  const mockAuditRepo = {
    findById: vi.fn(),
    create: vi.fn(),
    logEvent: vi.fn().mockResolvedValue({ id: 'aud-new' }),
    findByActor: vi.fn().mockResolvedValue(mockActivity),
    count: vi.fn(),
  };

  const service = new UserIdentityService(
    mockUserRepo as any,
    mockDeptRepo as any,
    mockIncidentRepo as any,
    mockAuditRepo as any
  );

  it('should aggregate complete user identity profile', async () => {
    const profile = await service.getUserIdentity('usr-identity-01');

    expect(profile.id).toBe('usr-identity-01');
    expect(profile.email).toBe('officer.davis@earthmind.gov');
    expect(profile.role).toBe(RoleType.FIELD_OFFICER);
    expect(profile.departmentName).toBe('Rapid Response Division');
    expect(profile.assignedIncidentsCount).toBe(1);
    expect(profile.permissions.INCIDENT).toContain('CREATE');
    expect(profile.permissions.INCIDENT).not.toContain('DELETE');
  });

  it('should record user activity and update last login timestamp', async () => {
    await service.updateLastLogin('usr-identity-01', '192.168.1.100');

    expect(mockUserRepo.update).toHaveBeenCalledWith('usr-identity-01', expect.objectContaining({
      lastLoginAt: expect.any(Date),
    }));
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'USER_LOGIN',
      actorId: 'usr-identity-01',
    }));
  });
});
