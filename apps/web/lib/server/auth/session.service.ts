// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Session Management Subsystem
// Tracks active user sessions, concurrent limits, last active timestamps, & invalidations
// ──────────────────────────────────────────────────────────────

import { ICacheProvider } from '../cache';
import { MemoryCacheProvider } from '../cache';
import { logger } from '../logger';
import { UnauthorizedError } from '../errors';

export interface UserSession {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  refreshTokenJti: string;
}

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface ISessionService {
  createSession(
    userId: string,
    email: string,
    role: string,
    refreshTokenJti: string,
    metadata?: SessionMetadata
  ): Promise<UserSession>;
  getSession(sessionId: string): Promise<UserSession | null>;
  touchSession(sessionId: string): Promise<void>;
  refreshSession(sessionId: string, newRefreshTokenJti: string): Promise<UserSession>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string, exceptSessionId?: string): Promise<void>;
  getUserSessions(userId: string): Promise<UserSession[]>;
}

export class SessionService implements ISessionService {
  private readonly defaultTtlSeconds = 604800; // 7 days
  private readonly maxConcurrentSessions = 5;

  constructor(private readonly cache: ICacheProvider = new MemoryCacheProvider()) {}

  async createSession(
    userId: string,
    email: string,
    role: string,
    refreshTokenJti: string,
    metadata?: SessionMetadata
  ): Promise<UserSession> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + this.defaultTtlSeconds * 1000).toISOString();

    const session: UserSession = {
      sessionId,
      userId,
      email,
      role,
      ipAddress: metadata?.ipAddress || '127.0.0.1',
      userAgent: metadata?.userAgent || 'Unknown/Client',
      createdAt: now,
      lastActiveAt: now,
      expiresAt,
      refreshTokenJti,
    };

    // 1. Manage Concurrent Sessions Limit
    await this.enforceConcurrentLimit(userId);

    // 2. Save Session Data
    await this.cache.set(`session:${sessionId}`, session, this.defaultTtlSeconds);

    // 3. Add Session ID to User's Session Register Set/Array
    const userSessionsKey = `user:sessions:${userId}`;
    const existingSessionIds = (await this.cache.get<string[]>(userSessionsKey)) || [];
    existingSessionIds.push(sessionId);
    await this.cache.set(userSessionsKey, existingSessionIds, this.defaultTtlSeconds);

    logger.info(`[SessionService] Created session ${sessionId} for user ${userId} (${session.ipAddress})`);
    return session;
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    if (!sessionId) return null;
    const session = await this.cache.get<UserSession>(`session:${sessionId}`);
    if (!session) return null;

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      await this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  async touchSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.lastActiveAt = new Date().toISOString();
    await this.cache.set(`session:${sessionId}`, session, this.defaultTtlSeconds);
  }

  async refreshSession(sessionId: string, newRefreshTokenJti: string): Promise<UserSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedError('Session has expired or been invalidated');
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + this.defaultTtlSeconds * 1000).toISOString();

    session.refreshTokenJti = newRefreshTokenJti;
    session.lastActiveAt = now;
    session.expiresAt = expiresAt;

    await this.cache.set(`session:${sessionId}`, session, this.defaultTtlSeconds);
    logger.info(`[SessionService] Refreshed session ${sessionId} for user ${session.userId}`);
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.cache.get<UserSession>(`session:${sessionId}`);
    if (session) {
      // Remove from user's active session register
      const userSessionsKey = `user:sessions:${session.userId}`;
      const existingIds = (await this.cache.get<string[]>(userSessionsKey)) || [];
      const updatedIds = existingIds.filter((id) => id !== sessionId);
      await this.cache.set(userSessionsKey, updatedIds, this.defaultTtlSeconds);
    }

    await this.cache.delete(`session:${sessionId}`);
    logger.info(`[SessionService] Invalidated session ${sessionId}`);
  }

  async invalidateAllUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessionIds = (await this.cache.get<string[]>(userSessionsKey)) || [];

    for (const id of sessionIds) {
      if (exceptSessionId && id === exceptSessionId) continue;
      await this.cache.delete(`session:${id}`);
    }

    const remainingIds = exceptSessionId ? [exceptSessionId] : [];
    await this.cache.set(userSessionsKey, remainingIds, this.defaultTtlSeconds);
    logger.info(`[SessionService] Invalidated all sessions for user ${userId}${exceptSessionId ? ` (except ${exceptSessionId})` : ''}`);
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessionIds = (await this.cache.get<string[]>(userSessionsKey)) || [];
    const activeSessions: UserSession[] = [];

    for (const id of sessionIds) {
      const session = await this.getSession(id);
      if (session) {
        activeSessions.push(session);
      }
    }

    return activeSessions;
  }

  private async enforceConcurrentLimit(userId: string): Promise<void> {
    const activeSessions = await this.getUserSessions(userId);
    if (activeSessions.length >= this.maxConcurrentSessions) {
      // Sort oldest first and invalidate oldest sessions exceeding max limit
      activeSessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const sessionsToRevoke = activeSessions.slice(0, activeSessions.length - this.maxConcurrentSessions + 1);

      for (const s of sessionsToRevoke) {
        logger.warn(`[SessionService] Revoking oldest concurrent session ${s.sessionId} for user ${userId}`);
        await this.invalidateSession(s.sessionId);
      }
    }
  }
}

export const sessionService = new SessionService();
