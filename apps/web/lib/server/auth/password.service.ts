// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Password Hashing & Security Service
// Uses bcryptjs (12 salt rounds) and crypto token hashing
// ──────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PasswordValidator, PasswordValidationResult } from './password.validator';
import { ValidationError } from '../errors';
import { logger } from '../logger';

export interface PasswordResetTokenResult {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export interface IPasswordService {
  hashPassword(password: string, saltRounds?: number): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  validateStrength(password: string): PasswordValidationResult;
  generateResetToken(ttlMinutes?: number): PasswordResetTokenResult;
  verifyResetToken(plainToken: string, hashedToken: string, expiresAt: Date): boolean;
}

export class PasswordService implements IPasswordService {
  private readonly defaultSaltRounds = 12;

  async hashPassword(password: string, saltRounds = this.defaultSaltRounds): Promise<string> {
    const validation = this.validateStrength(password);
    if (!validation.isValid) {
      throw new ValidationError('Password does not meet complexity requirements', {
        password: validation.errors,
      });
    }

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      logger.error('[PasswordService] Failed to hash password:', error);
      throw error;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  validateStrength(password: string): PasswordValidationResult {
    return PasswordValidator.validate(password);
  }

  generateResetToken(ttlMinutes = 60): PasswordResetTokenResult {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return {
      token,
      hashedToken,
      expiresAt,
    };
  }

  verifyResetToken(plainToken: string, hashedToken: string, expiresAt: Date): boolean {
    if (!plainToken || !hashedToken || !expiresAt) return false;

    // Check expiration
    if (new Date() > new Date(expiresAt)) {
      return false;
    }

    const computedHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hashedToken));
  }
}

export const passwordService = new PasswordService();
