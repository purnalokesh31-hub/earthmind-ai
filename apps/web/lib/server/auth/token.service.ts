// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Token Rotation & Revocation Service
// Manages token pairing, rotation, revocation blacklists, & expiration strategy
// ──────────────────────────────────────────────────────────────

import { JwtService, AccessTokenPayload, RefreshTokenPayload } from './jwt.service';
import { ICacheProvider, MemoryCacheProvider } from '../cache';
import { logger } from '../logger';
import { UnauthorizedError } from '../errors';
import { PrismaUserRepository, IUserRepository } from '../repositories/user.repository';

/** Refresh tokens intentionally carry only { sub, jti } — no role/email claims — so
 *  rotation must re-derive current identity from the source of truth, not trust the payload. */
export type UserLookup = Pick<IUserRepository, 'findById'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  tokenType: 'Bearer';
}

export interface TokenUserClaims {
  id: string;
  email: string;
  role: string;
  departmentId?: string;
}

export interface ITokenService {
  issueTokenPair(user: TokenUserClaims): Promise<TokenPair>;
  rotateRefreshToken(refreshToken: string): Promise<TokenPair>;
  revokeToken(jti: string, expiresInSeconds?: number): Promise<void>;
  isTokenRevoked(jti: string): Promise<boolean>;
}

export class TokenService implements ITokenService {
  constructor(
    private readonly jwt: JwtService = new JwtService(),
    private readonly cache: ICacheProvider = new MemoryCacheProvider(),
    private readonly userRepo: UserLookup = new PrismaUserRepository()
  ) {}

  async issueTokenPair(user: TokenUserClaims): Promise<TokenPair> {
    const accessJti = `access-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const refreshJti = `refresh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const accessToken = await this.jwt.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      jti: accessJti,
    });

    const refreshToken = await this.jwt.generateRefreshToken({
      sub: user.id,
      jti: refreshJti,
    });

    logger.info(`[TokenService] Issued token pair for user ${user.id} (JTI: ${accessJti})`);

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 900, // 15 minutes
      tokenType: 'Bearer',
    };
  }

  async rotateRefreshToken(refreshTokenString: string): Promise<TokenPair> {
    // 1. Verify refresh token signature & expiration
    const payload: RefreshTokenPayload = await this.jwt.verifyRefreshToken(refreshTokenString);

    // 2. Check if refresh token JTI has been revoked
    const revoked = await this.isTokenRevoked(payload.jti);
    if (revoked) {
      logger.warn(`[TokenService] Attempted reuse of revoked refresh token JTI: ${payload.jti}`);
      throw new UnauthorizedError('Refresh token has been revoked or already rotated');
    }

    // 3. Re-derive current identity (role/email/department) from the source of truth.
    //    The refresh token payload has no role/email claims, so this MUST come from a real lookup —
    //    never default/assume a role here, since that silently mis-authorizes the rotated session.
    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or no longer exists');
    }

    // 4. Blacklist current refresh token to prevent reuse (Rotation strategy)
    await this.revokeToken(payload.jti, 604800); // 7 days TTL

    // 5. Issue new token pair
    const newAccessJti = `access-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newRefreshJti = `refresh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const accessToken = await this.jwt.generateAccessToken({
      sub: payload.sub,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ?? undefined,
      jti: newAccessJti,
    });

    const newRefreshToken = await this.jwt.generateRefreshToken({
      sub: payload.sub,
      jti: newRefreshJti,
    });

    logger.info(`[TokenService] Successfully rotated refresh token for user ${payload.sub}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresInSeconds: 900,
      tokenType: 'Bearer',
    };
  }

  async revokeToken(jti: string, expiresInSeconds: number = 86400): Promise<void> {
    const key = `token:revoked:${jti}`;
    await this.cache.set(key, true, expiresInSeconds);
    logger.info(`[TokenService] Token JTI ${jti} revoked and blacklisted for ${expiresInSeconds}s`);
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const key = `token:revoked:${jti}`;
    const value = await this.cache.get<boolean>(key);
    return value === true;
  }
}
