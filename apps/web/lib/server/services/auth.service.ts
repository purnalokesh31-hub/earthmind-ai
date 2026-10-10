// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Authentication Service Layer
// Orchestrates User Repository, Token Service, Password Hashing, & Security Policies
// ──────────────────────────────────────────────────────────────

import type { IUserRepository } from '../repositories/user.repository';
import type { ITokenService, TokenPair } from '../auth/token.service';
import type { IJwtService } from '../auth/jwt.service';
import { AuthSecurityService } from '../auth/security.service';
import { PasswordService } from '../auth/password.service';
import { UnauthorizedError } from '../errors';
import { UserResponseDto, toUserResponseDto } from '../dto/auth.dto';
import { logger } from '../logger';

export interface IAuthService {
  login(email: string, password: string): Promise<{ tokenPair: TokenPair; user: UserResponseDto }>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  logout(userId: string, refreshToken?: string): Promise<void>;
  validateUser(userId: string): Promise<UserResponseDto | null>;
}

export class AuthService implements IAuthService {
  private readonly passwordService = new PasswordService();

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly jwtService: IJwtService,
    private readonly securityService?: AuthSecurityService
  ) {}

  async login(email: string, password: string): Promise<{ tokenPair: TokenPair; user: UserResponseDto }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await this.passwordService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPair = await this.tokenService.issueTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`[AuthService] User logged in: ${user.email}`);

    return {
      tokenPair,
      user: toUserResponseDto(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.tokenService.revokeToken(refreshToken);
    }
    logger.info(`[AuthService] User logged out: ${userId}`);
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) return null;
    return toUserResponseDto(user);
  }
}
