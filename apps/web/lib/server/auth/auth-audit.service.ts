// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Authentication Audit Logger Subsystem
// Records every security & authentication event directly to the AuditLog database table
// ──────────────────────────────────────────────────────────────

import { IAuditRepository } from '../repositories/audit.repository';
import container, { TOKENS } from '../container';
import { logger } from '../logger';

export interface IAuthAuditService {
  logLoginSuccess(userId: string, email: string, role: string, ipAddress?: string, userAgent?: string): Promise<void>;
  logLogout(userId: string, email: string, ipAddress?: string): Promise<void>;
  logFailedLogin(email: string, ipAddress?: string, userAgent?: string, reason?: string): Promise<void>;
  logPasswordChange(userId: string, email: string, ipAddress?: string): Promise<void>;
  logPasswordResetRequested(email: string, ipAddress?: string): Promise<void>;
  logPasswordResetCompleted(email: string, ipAddress?: string): Promise<void>;
  logTokenRefresh(userId: string, ipAddress?: string): Promise<void>;
  logAccountLockout(email: string, ipAddress?: string, failedAttempts?: number): Promise<void>;
}

export class AuthAuditService implements IAuthAuditService {
  private auditRepo?: IAuditRepository;

  constructor(auditRepo?: IAuditRepository) {
    this.auditRepo = auditRepo;
  }

  private getAuditRepo(): IAuditRepository {
    if (!this.auditRepo) {
      this.auditRepo = container.resolve<IAuditRepository>(TOKENS.AuditRepository);
    }
    return this.auditRepo;
  }

  async logLoginSuccess(userId: string, email: string, role: string, ipAddress = '127.0.0.1', userAgent = 'Browser/Client'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_LOGIN_SUCCESS',
        category: 'AUTH',
        actorId: userId,
        actorEmail: email,
        actorRole: role,
        description: `User '${email}' logged in successfully`,
        ipAddress,
        userAgent,
      });
      logger.info(`[AuthAudit] AUTH_LOGIN_SUCCESS logged for user ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist login audit event to database: ${String(error)}`);
    }
  }

  async logLogout(userId: string, email: string, ipAddress = '127.0.0.1'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_LOGOUT',
        category: 'AUTH',
        actorId: userId,
        actorEmail: email,
        description: `User '${email}' logged out`,
        ipAddress,
      });
      logger.info(`[AuthAudit] AUTH_LOGOUT logged for user ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist logout audit event: ${String(error)}`);
    }
  }

  async logFailedLogin(email: string, ipAddress = '127.0.0.1', userAgent = 'Browser/Client', reason = 'Invalid credentials'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_LOGIN_FAILED',
        category: 'AUTH',
        actorId: 'anonymous',
        actorEmail: email,
        description: `Failed login attempt for '${email}': ${reason}`,
        ipAddress,
        userAgent,
      });
      logger.warn(`[AuthAudit] AUTH_LOGIN_FAILED logged for email ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist failed login audit event: ${String(error)}`);
    }
  }

  async logPasswordChange(userId: string, email: string, ipAddress = '127.0.0.1'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_PASSWORD_CHANGE',
        category: 'AUTH',
        actorId: userId,
        actorEmail: email,
        description: `Password updated for user '${email}'`,
        ipAddress,
      });
      logger.info(`[AuthAudit] AUTH_PASSWORD_CHANGE logged for user ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist password change audit event: ${String(error)}`);
    }
  }

  async logPasswordResetRequested(email: string, ipAddress = '127.0.0.1'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_PASSWORD_RESET_REQUESTED',
        category: 'AUTH',
        actorId: 'anonymous',
        actorEmail: email,
        description: `Password reset token requested for '${email}'`,
        ipAddress,
      });
      logger.info(`[AuthAudit] AUTH_PASSWORD_RESET_REQUESTED logged for email ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist reset request audit event: ${String(error)}`);
    }
  }

  async logPasswordResetCompleted(email: string, ipAddress = '127.0.0.1'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_PASSWORD_RESET_COMPLETED',
        category: 'AUTH',
        actorId: 'anonymous',
        actorEmail: email,
        description: `Password reset successfully completed for '${email}'`,
        ipAddress,
      });
      logger.info(`[AuthAudit] AUTH_PASSWORD_RESET_COMPLETED logged for email ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist reset complete audit event: ${String(error)}`);
    }
  }

  async logTokenRefresh(userId: string, ipAddress = '127.0.0.1'): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_TOKEN_REFRESH',
        category: 'AUTH',
        actorId: userId,
        description: `JWT Token Pair rotated for user '${userId}'`,
        ipAddress,
      });
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist token refresh audit event: ${String(error)}`);
    }
  }

  async logAccountLockout(email: string, ipAddress = '127.0.0.1', failedAttempts = 5): Promise<void> {
    try {
      await this.getAuditRepo().logEvent({
        action: 'AUTH_ACCOUNT_LOCKOUT',
        category: 'AUTH',
        actorId: 'anonymous',
        actorEmail: email,
        description: `Account/IP locked out for 15 minutes after ${failedAttempts} failed login attempts`,
        ipAddress,
      });
      logger.error(`[AuthAudit SECURITY ALERT] AUTH_ACCOUNT_LOCKOUT logged for ${email}`);
    } catch (error) {
      logger.warn(`[AuthAudit] Failed to persist lockout audit event: ${String(error)}`);
    }
  }
}

export const authAuditService = new AuthAuditService();
