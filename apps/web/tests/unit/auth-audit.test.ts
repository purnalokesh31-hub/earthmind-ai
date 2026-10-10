import { describe, it, expect, vi } from 'vitest';
import { AuthAuditService } from '../../lib/server/auth';

describe('Phase 6.3.10 — Authentication Audit Subsystem Verification', () => {
  const mockAuditRepo = {
    findById: vi.fn(),
    create: vi.fn(),
    logEvent: vi.fn().mockResolvedValue({ id: 'aud-test-101' }),
    findByActor: vi.fn(),
    findByCategory: vi.fn(),
    findByTarget: vi.fn(),
    findByDateRange: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  const auditService = new AuthAuditService(mockAuditRepo as any);

  it('should log successful login security event', async () => {
    await auditService.logLoginSuccess('usr-001', 'commander@earthmind.gov', 'COMMANDER', '192.168.1.10');

    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'AUTH_LOGIN_SUCCESS',
        category: 'AUTH',
        actorId: 'usr-001',
        actorEmail: 'commander@earthmind.gov',
        actorRole: 'COMMANDER',
      })
    );
  });

  it('should log failed login and lockout security audit events', async () => {
    await auditService.logFailedLogin('attacker@earthmind.gov', '10.0.0.99');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'AUTH_LOGIN_FAILED',
        actorEmail: 'attacker@earthmind.gov',
      })
    );

    await auditService.logAccountLockout('attacker@earthmind.gov', '10.0.0.99', 5);
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'AUTH_ACCOUNT_LOCKOUT',
        actorEmail: 'attacker@earthmind.gov',
      })
    );
  });

  it('should log logout, password change, reset, and token refresh events', async () => {
    await auditService.logLogout('usr-001', 'commander@earthmind.gov');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUTH_LOGOUT' }));

    await auditService.logPasswordChange('usr-001', 'commander@earthmind.gov');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUTH_PASSWORD_CHANGE' }));

    await auditService.logPasswordResetRequested('commander@earthmind.gov');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUTH_PASSWORD_RESET_REQUESTED' }));

    await auditService.logPasswordResetCompleted('commander@earthmind.gov');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUTH_PASSWORD_RESET_COMPLETED' }));

    await auditService.logTokenRefresh('usr-001');
    expect(mockAuditRepo.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUTH_TOKEN_REFRESH' }));
  });
});
