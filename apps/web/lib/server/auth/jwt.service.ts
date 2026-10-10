// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise JWT Token Service (using 'jose')
// Signed JWT generation, validation, expiration, and claims verification
// ──────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { envConfig } from '../config';
import { logger } from '../logger';
import { AppError, UnauthorizedError } from '../errors';

export interface JwtAccessTokenInput {
  sub: string; // userId
  email: string;
  role: string;
  departmentId?: string;
  jti: string; // unique token ID for revocation tracking
}

export interface JwtRefreshTokenInput {
  sub: string; // userId
  jti: string; // unique token ID for rotation tracking
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  departmentId?: string;
  jti: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export interface IJwtService {
  generateAccessToken(payload: JwtAccessTokenInput): Promise<string>;
  generateRefreshToken(payload: JwtRefreshTokenInput): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}

export class JwtService implements IJwtService {
  private readonly secretKey: Uint8Array;
  private readonly issuer: string;

  constructor() {
    this.secretKey = new TextEncoder().encode(envConfig.JWT_SECRET);
    this.issuer = 'earthmind-pios-auth';
  }

  async generateAccessToken(payload: JwtAccessTokenInput): Promise<string> {
    try {
      const jwt = await new SignJWT({
        email: payload.email,
        role: payload.role,
        departmentId: payload.departmentId,
        type: 'access',
      })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuer(this.issuer)
        .setSubject(payload.sub)
        .setJti(payload.jti)
        .setIssuedAt()
        .setExpirationTime(envConfig.JWT_EXPIRES_IN || '15m')
        .sign(this.secretKey);

      return jwt;
    } catch (error) {
      logger.error('[JwtService] Failed to generate access token:', error);
      throw new AppError('Failed to generate access token', 500, 'TOKEN_GENERATION_FAILED');
    }
  }

  async generateRefreshToken(payload: JwtRefreshTokenInput): Promise<string> {
    try {
      const jwt = await new SignJWT({ type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuer(this.issuer)
        .setSubject(payload.sub)
        .setJti(payload.jti)
        .setIssuedAt()
        .setExpirationTime(envConfig.JWT_REFRESH_EXPIRES_IN || '7d')
        .sign(this.secretKey);

      return jwt;
    } catch (error) {
      logger.error('[JwtService] Failed to generate refresh token:', error);
      throw new AppError('Failed to generate refresh token', 500, 'TOKEN_GENERATION_FAILED');
    }
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        issuer: this.issuer,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedError('Provided token is not an access token');
      }

      return payload as unknown as AccessTokenPayload;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.warn('[JwtService] Access token verification failed:', error?.message);
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        issuer: this.issuer,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Provided token is not a refresh token');
      }

      return payload as unknown as RefreshTokenPayload;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.warn('[JwtService] Refresh token verification failed:', error?.message);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}

export const jwtService = new JwtService();
