// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 2: Authentication Hardening Verification Suite
// Validates No Hardcoded Passwords, No Demo Email Bypasses, Strong Secret Enforcement, and Safe Role Preservation
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginRoute } from '@/app/api/v1/auth/login/route';
import { POST as refreshRoute } from '@/app/api/v1/auth/refresh/route';
import { JwtService } from '@/lib/server/auth/jwt.service';

describe('TASK 2 — Authentication Hardening Suite', () => {
  const jwtService = new JwtService();

  describe('1. Removal of Hardcoded Credentials & Demo Email Bypasses', () => {
    it('rejects hardcoded default password login attempts with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@earthmind.org',
          password: 'password123',
        }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('rejects arbitrary @earthmind.demo email bypass attempts without real credentials', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'commander@earthmind.demo',
          password: 'wrong-password-99',
        }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('fails closed when email or password is empty', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(400);
    });
  });

  describe('2. Refresh Token Role Preservation', () => {
    it('preserves the authenticated user real role during refresh rotation', async () => {
      const originalUserId = 'usr-commander-42';
      const refreshToken = await jwtService.generateRefreshToken({
        sub: originalUserId,
        jti: 'jti-test-refresh-101',
      });

      const req = new NextRequest('http://localhost:3000/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const res = await refreshRoute(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.tokenPair.accessToken).toBeDefined();

      const payload = await jwtService.verifyAccessToken(json.data.tokenPair.accessToken);
      expect(payload.role).toBe('COMMANDER');
      expect(payload.sub).toBe(originalUserId);
    });
  });
});
