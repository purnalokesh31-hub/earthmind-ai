import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { RoleType } from '../../lib/server/auth/permissions';
import container, { TOKENS } from '../../lib/server/container';
import { JwtService, TokenService, AuthMiddleware, RbacGuard } from '../../lib/server/auth';
import { MemoryCacheProvider } from '../../lib/server/cache';
import { ForbiddenError } from '../../lib/server/errors';
import type { UserLookup } from '../../lib/server/auth/token.service';
import type { UserEntity } from '../../lib/server/repositories/user.repository';

describe('Phase 6.3.1 & 6.3.2 — Enterprise JWT Authentication & Token Management Verification', () => {
  let jwt: JwtService;
  let cache: MemoryCacheProvider;
  let tokenService: TokenService;
  let authMiddleware: AuthMiddleware;

  // rotateRefreshToken re-derives role/email from a real user lookup rather than trusting the
  // refresh payload (see token.service.ts) — this fixture stands in for that repository lookup.
  const testUsers: Record<string, UserEntity> = {
    'usr-789': {
      id: 'usr-789',
      email: 'admin@earthmind.gov',
      passwordHash: 'unused',
      fullName: 'Test Admin',
      role: 'SYSTEM_ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  const testUserRepo: UserLookup = {
    findById: async (id: string) => testUsers[id] ?? null,
  };

  beforeEach(() => {
    jwt = new JwtService();
    cache = new MemoryCacheProvider();
    tokenService = new TokenService(jwt, cache, testUserRepo);
    authMiddleware = new AuthMiddleware(jwt, tokenService);
  });

  it('should resolve JwtService, TokenService, and AuthMiddleware from IoC container', () => {
    expect(container.resolve(TOKENS.JwtService)).toBeDefined();
    expect(container.resolve(TOKENS.TokenService)).toBeDefined();
    expect(container.resolve(TOKENS.AuthMiddleware)).toBeDefined();
  });

  it('should generate and verify signed JWT access tokens', async () => {
    const token = await jwt.generateAccessToken({
      sub: 'usr-123',
      email: 'commander@earthmind.gov',
      role: 'COMMANDER',
      departmentId: 'dept-456',
      jti: 'jti-001',
    });

    expect(typeof token).toBe('string');

    const payload = await jwt.verifyAccessToken(token);
    expect(payload.sub).toBe('usr-123');
    expect(payload.email).toBe('commander@earthmind.gov');
    expect(payload.role).toBe('COMMANDER');
    expect(payload.type).toBe('access');
  });

  it('should issue token pairs and support token revocation', async () => {
    const pair = await tokenService.issueTokenPair({
      id: 'usr-456',
      email: 'officer@earthmind.gov',
      role: 'FIELD_OFFICER',
    });

    expect(pair.accessToken).toBeDefined();
    expect(pair.refreshToken).toBeDefined();

    // Revoke token
    await tokenService.revokeToken('jti-test-revoke');
    const isRevoked = await tokenService.isTokenRevoked('jti-test-revoke');
    expect(isRevoked).toBe(true);
  });

  it('should rotate refresh tokens and blacklist previous token', async () => {
    const pair = await tokenService.issueTokenPair({
      id: 'usr-789',
      email: 'admin@earthmind.gov',
      role: 'SYSTEM_ADMIN',
    });

    const rotatedPair = await tokenService.rotateRefreshToken(pair.refreshToken);
    expect(rotatedPair.accessToken).toBeDefined();
    expect(rotatedPair.refreshToken).toBeDefined();

    // The rotated access token must carry the user's REAL current role/email (re-derived from
    // the repository), not a placeholder — a prior bug here silently downgraded every refreshed
    // session to a nonexistent 'USER' role.
    const rotatedPayload = await jwt.verifyAccessToken(rotatedPair.accessToken);
    expect(rotatedPayload.role).toBe('SYSTEM_ADMIN');
    expect(rotatedPayload.email).toBe('admin@earthmind.gov');
    expect(rotatedPayload.sub).toBe('usr-789');

    // Rotating for an unknown/inactive user must fail closed, not fabricate a session.
    await expect(
      tokenService.rotateRefreshToken(
        (await tokenService.issueTokenPair({ id: 'usr-does-not-exist', email: 'x@x.com', role: 'CITIZEN' })).refreshToken
      )
    ).rejects.toThrow(/inactive or no longer exists/);

    // Re-using old refresh token should throw error
    await expect(tokenService.rotateRefreshToken(pair.refreshToken)).rejects.toThrow();
  });

  it('should authenticate HTTP request via Authorization header', async () => {
    const pair = await tokenService.issueTokenPair({
      id: 'usr-999',
      email: 'analyst@earthmind.gov',
      role: 'ANALYST',
    });

    const req = new NextRequest('http://localhost:3000/api/v1/incidents', {
      headers: {
        Authorization: `Bearer ${pair.accessToken}`,
      },
    });

    const context = await authMiddleware.authenticateRequest(req);
    expect(context.userId).toBe('usr-999');
    expect(context.email).toBe('analyst@earthmind.gov');
    expect(context.role).toBe('ANALYST');
  });

  it('should enforce Role-Based Access Control (RBAC)', () => {
    const context = {
      userId: 'usr-1',
      email: 'officer@earthmind.gov',
      role: RoleType.FIELD_OFFICER,
      jti: 'jti-1',
    };

    // FIELD_OFFICER allowed for FIELD_OFFICER role
    expect(() => RbacGuard.checkPermission(context, [RoleType.FIELD_OFFICER])).not.toThrow();

    // COMMANDER role requirement should throw ForbiddenError for FIELD_OFFICER
    expect(() => RbacGuard.checkPermission(context, [RoleType.COMMANDER])).toThrow(ForbiddenError);

    // SYSTEM_ADMIN context bypasses all restrictions
    const adminContext = { ...context, role: RoleType.SYSTEM_ADMIN };
    expect(() => RbacGuard.checkPermission(adminContext, [RoleType.COMMANDER])).not.toThrow();
  });
});
