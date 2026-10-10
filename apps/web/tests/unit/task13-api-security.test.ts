// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 13: API Security Hardening Verification Suite
// Validates Rate Limiting, OTP/Password-Reset Protection, Memory TTL Cleanup & Input Validation
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginRoute } from '@/app/api/v1/auth/login/route';
import { POST as verifyOtpRoute } from '@/app/api/v1/auth/verify-otp/route';
import { POST as forgotPasswordRoute } from '@/app/api/v1/auth/forgot-password/route';
import { POST as resetPasswordRoute } from '@/app/api/v1/auth/reset-password/route';
import { MemoryRateLimiter, enforceRateLimit } from '@/lib/server/middleware/rate-limit.middleware';

describe('TASK 13 — API Security Hardening Suite', () => {
  describe('1. MemoryRateLimiter Sliding Window & Active Cleanup', () => {
    let limiter: MemoryRateLimiter;

    beforeEach(() => {
      limiter = new MemoryRateLimiter();
    });

    it('allows requests within limit and tracks remaining hits', async () => {
      const key = 'test:ip:127.0.0.1';
      const r1 = await limiter.checkLimit(key, 3, 10);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = await limiter.checkLimit(key, 3, 10);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = await limiter.checkLimit(key, 3, 10);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      const r4 = await limiter.checkLimit(key, 3, 10);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });

    it('cleans up entries when window expires', async () => {
      const key = 'test:ip:expire';
      // 0 second window (immediately expired)
      const r1 = await limiter.checkLimit(key, 1, 0);
      expect(r1.allowed).toBe(true);

      // Next check will reset the entry
      const r2 = await limiter.checkLimit(key, 1, 10);
      expect(r2.allowed).toBe(true);
    });
  });

  describe('2. Authentication Route Rate Limiting & Malformed Input Handling', () => {
    it('rejects malformed email payloads on login with 400 Bad Request', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.1' },
        body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(400);
    });

    it('rejects malformed OTP format (non 6-digit) with 400 Bad Request', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.2' },
        body: JSON.stringify({ email: 'commander@earthmind.org', otp: '123' }), // only 3 digits
      });

      const res = await verifyOtpRoute(req);
      expect(res.status).toBe(400);
    });

    it('rejects invalid password reset payloads with missing token', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.1.3' },
        body: JSON.stringify({ token: '', newPassword: '123' }),
      });

      const res = await resetPasswordRoute(req);
      expect(res.status).toBe(400);
    });

    it('enforces rate limit error on repeated auth calls exceeding threshold', async () => {
      const customLimiter = new MemoryRateLimiter();
      const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '10.0.0.99' },
      });

      // Call 2 times with limit=2
      await enforceRateLimit(req, customLimiter, 2, 60);
      await enforceRateLimit(req, customLimiter, 2, 60);

      // 3rd call should throw RateLimitError (429)
      await expect(enforceRateLimit(req, customLimiter, 2, 60)).rejects.toThrow(/Too many requests/);
    });
  });
});
