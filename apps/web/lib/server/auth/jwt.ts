// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — JWT Utilities via 'jose'
// Access and Refresh Token issuance and verification
// ──────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { envConfig } from '../config';

export type UserRole = 'SYSTEM_ADMIN' | 'SUPERVISOR' | 'COMMANDER' | 'FIELD_OFFICER' | 'ANALYST';

export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  tokenType: 'access' | 'refresh';
}

const secretKey = new TextEncoder().encode(envConfig.JWT_SECRET);
const refreshSecretKey = new TextEncoder().encode(envConfig.JWT_REFRESH_SECRET);

// ── Sign Access Token (Default 24h) ────────────────────────────
export async function signAccessToken(
  payload: Omit<AuthTokenPayload, 'tokenType' | 'iat' | 'exp'>,
  expiresIn = envConfig.JWT_EXPIRES_IN
): Promise<string> {
  return new SignJWT({ ...payload, tokenType: 'access' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('earthmind-pios')
    .setAudience('earthmind-api')
    .sign(secretKey);
}

// ── Sign Refresh Token (Default 7d) ────────────────────────────
export async function signRefreshToken(
  payload: Omit<AuthTokenPayload, 'tokenType' | 'iat' | 'exp'>,
  expiresIn = envConfig.JWT_REFRESH_EXPIRES_IN
): Promise<string> {
  return new SignJWT({ ...payload, tokenType: 'refresh' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('earthmind-pios')
    .setAudience('earthmind-api')
    .sign(refreshSecretKey);
}

// ── Verify Access Token ────────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'earthmind-pios',
      audience: 'earthmind-api',
    });
    if (payload.tokenType !== 'access') return null;
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

// ── Verify Refresh Token ───────────────────────────────────────
export async function verifyRefreshToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey, {
      issuer: 'earthmind-pios',
      audience: 'earthmind-api',
    });
    if (payload.tokenType !== 'refresh') return null;
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}
