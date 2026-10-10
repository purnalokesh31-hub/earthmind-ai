import { describe, it, expect, beforeEach } from 'vitest';
import container, { TOKENS } from '../../lib/server/container';
import { SessionService, UserSession } from '../../lib/server/auth';
import { MemoryCacheProvider } from '../../lib/server/cache';

describe('Phase 6.3.5 — Enterprise Session Management Verification', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService(new MemoryCacheProvider());
  });

  it('should resolve SessionService from IoC container', () => {
    const resolved = container.resolve<SessionService>(TOKENS.SessionService);
    expect(resolved).toBeDefined();
    expect(typeof resolved.createSession).toBe('function');
  });

  it('should create user session, retrieve session data, and update lastActiveAt', async () => {
    const session = await sessionService.createSession(
      'usr-101',
      'commander@earthmind.gov',
      'COMMANDER',
      'jti-ref-1',
      { ipAddress: '192.168.1.10', userAgent: 'Chrome/120' }
    );

    expect(session.sessionId).toContain('sess_');
    expect(session.userId).toBe('usr-101');
    expect(session.email).toBe('commander@earthmind.gov');
    expect(session.ipAddress).toBe('192.168.1.10');

    const fetched = await sessionService.getSession(session.sessionId);
    expect(fetched).toBeDefined();
    expect(fetched?.sessionId).toBe(session.sessionId);

    // Touch session
    await sessionService.touchSession(session.sessionId);
    const touched = await sessionService.getSession(session.sessionId);
    expect(touched?.lastActiveAt).toBeDefined();
  });

  it('should enforce max 5 concurrent sessions per user by revoking oldest', async () => {
    const userId = 'usr-concurrent-user';

    // Create 6 sessions (max limit is 5)
    const sessions: UserSession[] = [];
    for (let i = 0; i < 6; i++) {
      const s = await sessionService.createSession(userId, 'user@gov', 'FIELD_OFFICER', `jti-${i}`);
      sessions.push(s);
    }

    const activeSessions = await sessionService.getUserSessions(userId);
    expect(activeSessions.length).toBeLessThanOrEqual(5);

    // Oldest session (index 0) should be invalidated
    const oldestSession = await sessionService.getSession(sessions[0].sessionId);
    expect(oldestSession).toBeNull();
  });

  it('should invalidate individual session and all user sessions', async () => {
    const userId = 'usr-inv-user';

    const s1 = await sessionService.createSession(userId, 'u@gov', 'ANALYST', 'jti-1');
    const s2 = await sessionService.createSession(userId, 'u@gov', 'ANALYST', 'jti-2');

    // Invalidate single session
    await sessionService.invalidateSession(s1.sessionId);
    expect(await sessionService.getSession(s1.sessionId)).toBeNull();

    // Invalidate all user sessions
    await sessionService.invalidateAllUserSessions(userId);
    const active = await sessionService.getUserSessions(userId);
    expect(active).toHaveLength(0);
  });
});
