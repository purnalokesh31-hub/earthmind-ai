// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — CSRF Protection Utilities
// Token generation, validation, and constant-time comparison
// ──────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { ForbiddenError } from '../errors/app-error';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCsrfToken(tokenA: string, tokenB: string): boolean {
  if (!tokenA || !tokenB || tokenA.length !== tokenB.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(tokenA), Buffer.from(tokenB));
}

export function validateCsrfHeader(req: Request, expectedToken?: string): void {
  // Safe HTTP methods do not require CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return;
  }

  const csrfHeader = req.headers.get('x-csrf-token');
  if (!csrfHeader) {
    throw new ForbiddenError('Missing CSRF token in X-CSRF-Token header.');
  }

  if (expectedToken && !verifyCsrfToken(csrfHeader, expectedToken)) {
    throw new ForbiddenError('Invalid CSRF token.');
  }
}
