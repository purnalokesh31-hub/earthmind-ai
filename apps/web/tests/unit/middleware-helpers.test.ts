import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { RoleType } from '@prisma/client';
import {
  authenticate,
  authorize,
  optionalAuth,
  adminOnly,
  commanderOnly,
  fieldOfficerOnly,
  JwtService,
  TokenService,
} from '../../lib/server/auth';
import { MemoryCacheProvider } from '../../lib/server/cache';
import { UnauthorizedError, ForbiddenError } from '../../lib/server/errors';

describe('Phase 6.3.7 — Enterprise Middleware Helpers Verification', () => {
  let jwt: JwtService;
  let tokenService: TokenService;

  beforeEach(() => {
    jwt = new JwtService();
    tokenService = new TokenService(jwt, new MemoryCacheProvider());
  });

  it('should authenticate request with valid Bearer token', async () => {
    const pair = await tokenService.issueTokenPair({
      id: 'usr-admin-1',
      email: 'admin@earthmind.gov',
      role: RoleType.SYSTEM_ADMIN,
    });

    const req = new NextRequest('http://localhost:3000/api/v1/incidents', {
      headers: { Authorization: `Bearer ${pair.accessToken}` },
    });

    const context = await authenticate(req);
    expect(context.userId).toBe('usr-admin-1');
    expect(context.role).toBe(RoleType.SYSTEM_ADMIN);
  });

  it('should throw UnauthorizedError when token is missing in authenticate()', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/incidents');
    await expect(authenticate(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should return null in optionalAuth() when token is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/incidents');
    const context = await optionalAuth(req);
    expect(context).toBeNull();
  });

  it('should enforce adminOnly() shorthand middleware', async () => {
    const adminPair = await tokenService.issueTokenPair({
      id: 'usr-admin',
      email: 'admin@earthmind.gov',
      role: RoleType.SYSTEM_ADMIN,
    });

    const adminReq = new NextRequest('http://localhost:3000/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${adminPair.accessToken}` },
    });
    const adminContext = await adminOnly(adminReq);
    expect(adminContext.role).toBe(RoleType.SYSTEM_ADMIN);

    const officerPair = await tokenService.issueTokenPair({
      id: 'usr-officer',
      email: 'officer@earthmind.gov',
      role: RoleType.FIELD_OFFICER,
    });

    const officerReq = new NextRequest('http://localhost:3000/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${officerPair.accessToken}` },
    });
    await expect(adminOnly(officerReq)).rejects.toThrow(ForbiddenError);
  });

  it('should enforce commanderOnly() and fieldOfficerOnly() shorthand guards', async () => {
    const commanderPair = await tokenService.issueTokenPair({
      id: 'usr-cmd',
      email: 'cmd@earthmind.gov',
      role: RoleType.COMMANDER,
    });

    const cmdReq = new NextRequest('http://localhost:3000/api/v1/dispatch', {
      headers: { Authorization: `Bearer ${commanderPair.accessToken}` },
    });
    const cmdContext = await commanderOnly(cmdReq);
    expect(cmdContext.role).toBe(RoleType.COMMANDER);

    const fieldReq = new NextRequest('http://localhost:3000/api/v1/evidence', {
      headers: { Authorization: `Bearer ${commanderPair.accessToken}` },
    });
    const fieldContext = await fieldOfficerOnly(fieldReq);
    expect(fieldContext).toBeDefined();
  });
});
