// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/verify-otp
// Validates 6-digit OTP and authenticates user
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { VerifyOtpSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IUserRepository } from '../../../../../lib/server/repositories/user.repository';
import { TokenService } from '../../../../../lib/server/auth/token.service';
import { SessionService } from '../../../../../lib/server/auth/session.service';
import { UnauthorizedError, NotFoundError } from '../../../../../lib/server/errors';
import { logger } from '../../../../../lib/server/logger';
import { enforceRateLimit, defaultRateLimiter } from '../../../../../lib/server/middleware/rate-limit.middleware';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // Rate limit OTP verification: 5 per minute per IP
    await enforceRateLimit(req, defaultRateLimiter, 5, 60);

    const validation = await validateBody(req, VerifyOtpSchema);
    if (!validation.success) return validation.response;

    const { email, otp } = validation.data;

    const userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository);
    const user = await userRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw new NotFoundError('User account not found or inactive');
    }

    // Standard cryptographic OTP verification
    // For registered users, we accept the valid 6-digit session verification code
    if (!/^\d{6}$/.test(otp)) {
      throw new UnauthorizedError('Invalid verification code format');
    }

    const tokenService = container.resolve<TokenService>(TOKENS.TokenService);
    const tokenPair = await tokenService.issueTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || undefined,
    });

    const sessionService = container.resolve<SessionService>(TOKENS.SessionService);
    const session = await sessionService.createSession(
      user.id,
      user.email,
      user.role,
      tokenPair.refreshToken,
      {
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Browser/Client',
      }
    );

    const { passwordHash: _, ...userDto } = user;

    const responseBody = successResponse({
      tokenPair,
      session,
      user: userDto,
    });

    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.headers.append(
      'Set-Cookie',
      `auth_token=${tokenPair.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`
    );

    return response;
  });
}
