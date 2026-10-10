import { describe, it, expect } from 'vitest';
import { POST as LoginHandler } from '../../app/api/v1/auth/login/route';
import { POST as LogoutHandler } from '../../app/api/v1/auth/logout/route';
import { POST as RefreshHandler } from '../../app/api/v1/auth/refresh/route';
import { POST as ForgotPasswordHandler } from '../../app/api/v1/auth/forgot-password/route';
import { POST as ResetPasswordHandler } from '../../app/api/v1/auth/reset-password/route';
import { GET as MeHandler } from '../../app/api/v1/auth/me/route';
import { NextRequest } from 'next/server';

describe('Phase 6.3.6 — Authentication API Endpoints Verification', () => {
  it('should return 400 Bad Request on login with invalid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: 'short' }),
    });

    const res = await LoginHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('should process forgot password requests securely without disclosing user existence', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown.user@earthmind.gov' }),
    });

    const res = await ForgotPasswordHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.message).toContain('dispatched');
  }, 15000);

  it('should process reset password request validation', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-reset-token-sample',
        newPassword: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!',
      }),
    });

    const res = await ResetPasswordHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
  }, 15000);

  it('should return 401 Unauthorized for /api/v1/auth/me when token is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/me', {
      method: 'GET',
    });

    const res = await MeHandler(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });
});
