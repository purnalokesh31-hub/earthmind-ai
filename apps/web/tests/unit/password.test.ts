import { describe, it, expect } from 'vitest';
import container, { TOKENS } from '../../lib/server/container';
import { PasswordValidator, PasswordService } from '../../lib/server/auth';
import { ValidationError } from '../../lib/server/errors';

describe('Phase 6.3.3 — Password Security & Hashing Verification', () => {
  const service = new PasswordService();

  it('should resolve PasswordService from IoC container', () => {
    const resolved = container.resolve<PasswordService>(TOKENS.PasswordService);
    expect(resolved).toBeDefined();
    expect(typeof resolved.hashPassword).toBe('function');
  });

  it('should validate password complexity rules', () => {
    const weak = PasswordValidator.validate('weak');
    expect(weak.isValid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    const strong = PasswordValidator.validate('SecurePass2026!');
    expect(strong.isValid).toBe(true);
    expect(strong.errors).toHaveLength(0);
    expect(strong.score).toBe(100);
  });

  it('should reject hashing weak passwords with ValidationError', async () => {
    await expect(service.hashPassword('123456')).rejects.toThrow(ValidationError);
  });

  it('should hash valid password with bcrypt and verify comparison', async () => {
    const plain = 'P@ssword123!';
    const hash = await service.hashPassword(plain);

    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);

    const isValid = await service.comparePassword(plain, hash);
    expect(isValid).toBe(true);

    const isInvalid = await service.comparePassword('WrongPassword123!', hash);
    expect(isInvalid).toBe(false);
  }, 15000);

  it('should generate secure reset token and verify hash signature', () => {
    const reset = service.generateResetToken(60);
    expect(reset.token).toHaveLength(64);
    expect(reset.hashedToken).toHaveLength(64);
    expect(reset.expiresAt.getTime()).toBeGreaterThan(Date.now());

    const isVerified = service.verifyResetToken(reset.token, reset.hashedToken, reset.expiresAt);
    expect(isVerified).toBe(true);

    const expired = service.verifyResetToken(
      reset.token,
      reset.hashedToken,
      new Date(Date.now() - 1000)
    );
    expect(expired).toBe(false);
  });
});
