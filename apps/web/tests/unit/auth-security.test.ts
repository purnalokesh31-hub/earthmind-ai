import { describe, it, expect, beforeEach } from 'vitest';
import { AuthSecurityService } from '../../lib/server/auth';
import { MemoryCacheProvider } from '../../lib/server/cache';
import { ForbiddenError } from '../../lib/server/errors';

describe('Phase 6.3.8 — Enterprise Auth Security Layer Verification', () => {
  let securityService: AuthSecurityService;

  beforeEach(() => {
    securityService = new AuthSecurityService(new MemoryCacheProvider());
  });

  it('should track failed logins and trigger lockout on 5th failure', async () => {
    const email = 'target@earthmind.gov';
    const ip = '192.168.1.50';

    // 4 failed attempts should reduce attempts left
    for (let i = 1; i <= 4; i++) {
      const status = await securityService.trackFailedLogin(email, ip);
      expect(status.isLocked).toBe(false);
      expect(status.attemptsLeft).toBe(5 - i);
    }

    // 5th failed attempt should trigger ForbiddenError account lockout
    await expect(securityService.trackFailedLogin(email, ip)).rejects.toThrow(ForbiddenError);

    // Subsequent lockout check should return locked status
    const lockout = await securityService.checkLockout(email);
    expect(lockout.isLocked).toBe(true);
  });

  it('should clear failed attempts counter on resetFailedLogins()', async () => {
    const email = 'user@earthmind.gov';
    await securityService.trackFailedLogin(email, '127.0.0.1');

    await securityService.resetFailedLogins(email);
    const status = await securityService.checkLockout(email);
    expect(status.attemptsLeft).toBe(5);
  });

  it('should generate deterministic device fingerprint', () => {
    const fp1 = securityService.generateDeviceFingerprint('192.168.1.1', 'Mozilla/5.0');
    const fp2 = securityService.generateDeviceFingerprint('192.168.1.1', 'Mozilla/5.0');
    const fp3 = securityService.generateDeviceFingerprint('192.168.1.2', 'Mozilla/5.0');

    expect(fp1).toHaveLength(32);
    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });

  it('should return strict enterprise HTTP security headers', () => {
    const headers = securityService.getSecurityHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Strict-Transport-Security']).toContain('max-age=');
  });
});
