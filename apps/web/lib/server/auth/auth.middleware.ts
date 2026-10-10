// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Authentication Middleware & Route Guard
// Extracts Bearer JWT tokens, validates signature & revocation status
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { JwtService, AccessTokenPayload } from './jwt.service';
import { TokenService } from './token.service';
import { UnauthorizedError } from '../errors';
import { logger } from '../logger';

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  role: string;
  departmentId?: string;
  jti: string;
}

export interface IAuthMiddleware {
  authenticateRequest(req: NextRequest): Promise<AuthenticatedUserContext>;
}

export class AuthMiddleware implements IAuthMiddleware {
  constructor(
    private readonly jwt: JwtService = new JwtService(),
    private readonly tokenService: TokenService = new TokenService()
  ) {}

  async authenticateRequest(req: NextRequest): Promise<AuthenticatedUserContext> {
    // 1. Extract token from Authorization header or auth_token cookie
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = req.cookies.get('auth_token')?.value;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing from request');
    }

    // 2. Verify JWT signature & expiration
    const payload: AccessTokenPayload = await this.jwt.verifyAccessToken(token);

    // 3. Verify token JTI is not blacklisted/revoked
    const isRevoked = await this.tokenService.isTokenRevoked(payload.jti);
    if (isRevoked) {
      logger.warn(`[AuthMiddleware] Revoked access token rejected (JTI: ${payload.jti})`);
      throw new UnauthorizedError('Authentication token has been revoked');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      departmentId: payload.departmentId,
      jti: payload.jti,
    };
  }
}

export const authMiddleware = new AuthMiddleware();
