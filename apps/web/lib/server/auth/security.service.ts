// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Auth Security Layer
// Brute-force prevention, account lockout, login rate limiting, device fingerprinting, & security headers
// ──────────────────────────────────────────────────────────────

import { createHash } from 'crypto';
import { ICacheProvider } from '../cache';
import { MemoryCacheProvider } from '../cache';
import { logger } from '../logger';
import { ForbiddenError } from '../errors';

export interface LockoutStatus {
  isLocked: boolean;
  attemptsLeft: number;
  lockRemainingSeconds: number;
}

export class AuthSecurityService {
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDurationSeconds = 900; // 15 minutes window

  constructor(private readonly cache: ICacheProvider = new MemoryCacheProvider()) {}

  /**
   * Checks if an identifier (email or IP address) is currently locked out.
   */
  async checkLockout(identifier: string): Promise<LockoutStatus> {
    const key = `lockout:${identifier.toLowerCase()}`;
    const failedKey = `failed_attempts:${identifier.toLowerCase()}`;

    const isLocked = await this.cache.get<boolean>(key);
    if (isLocked) {
      return {
        isLocked: true,
        attemptsLeft: 0,
        lockRemainingSeconds: this.lockoutDurationSeconds,
      };
    }

    const attempts = (await this.cache.get<number>(failedKey)) || 0;
    return {
      isLocked: false,
      attemptsLeft: Math.max(0, this.maxFailedAttempts - attempts),
      lockRemainingSeconds: 0,
    };
  }

  /**
   * Increments failed login count and triggers 15-minute account lockout if threshold is exceeded.
   */
  async trackFailedLogin(identifier: string, ipAddress: string): Promise<LockoutStatus> {
    const normIdentifier = identifier.toLowerCase();
    const failedKey = `failed_attempts:${normIdentifier}`;
    const lockoutKey = `lockout:${normIdentifier}`;

    const currentAttempts = ((await this.cache.get<number>(failedKey)) || 0) + 1;
    await this.cache.set(failedKey, currentAttempts, this.lockoutDurationSeconds);

    logger.warn(`[AuthSecurity] Failed login attempt #${currentAttempts} for ${normIdentifier} from IP ${ipAddress}`);

    if (currentAttempts >= this.maxFailedAttempts) {
      await this.cache.set(lockoutKey, true, this.lockoutDurationSeconds);
      logger.error(`[AuthSecurity LOCKOUT] Account/IP ${normIdentifier} locked for 15 minutes due to ${currentAttempts} failed attempts`);
      
      throw new ForbiddenError(
        'Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.'
      );
    }

    return {
      isLocked: false,
      attemptsLeft: this.maxFailedAttempts - currentAttempts,
      lockRemainingSeconds: 0,
    };
  }

  /**
   * Resets failed login counter on successful password authentication.
   */
  async resetFailedLogins(identifier: string): Promise<void> {
    const normIdentifier = identifier.toLowerCase();
    await this.cache.delete(`failed_attempts:${normIdentifier}`);
    await this.cache.delete(`lockout:${normIdentifier}`);
  }

  /**
   * Generates a device fingerprint hash based on client IP address and User-Agent string.
   */
  generateDeviceFingerprint(ipAddress: string, userAgent: string): string {
    return createHash('sha256')
      .update(`${ipAddress.trim()}:${userAgent.trim()}`)
      .digest('hex')
      .slice(0, 32);
  }

  /**
   * Returns enterprise HTTP security headers.
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    };
  }
}

export const authSecurityService = new AuthSecurityService();
