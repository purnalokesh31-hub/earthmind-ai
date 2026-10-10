// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Authentication Session Helpers
// ──────────────────────────────────────────────────────────────

import { signAccessToken, signRefreshToken, verifyRefreshToken, AuthTokenPayload, UserRole } from './jwt';

export interface AuthSessionUser {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: AuthSessionUser;
}

// ── Extract Bearer Token from HTTP Headers ────────────────────
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
}

// ── Create Full Token Pair (Access + Refresh) ─────────────────
export async function createAuthSession(user: AuthSessionUser): Promise<AuthSessionResponse> {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: 86400, // 24 hours in seconds
    tokenType: 'Bearer',
    user,
  };
}

// ── Refresh Auth Session via Refresh Token ─────────────────────
export async function refreshAuthSession(refreshToken: string): Promise<AuthSessionResponse | null> {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return null;

  return createAuthSession({
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    departmentId: payload.departmentId,
  });
}
