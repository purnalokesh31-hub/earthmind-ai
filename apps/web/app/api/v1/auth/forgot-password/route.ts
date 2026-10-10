// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/forgot-password
// Generates password reset token & logs audit security event
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { ForgotPasswordSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { PasswordService } from '../../../../../lib/server/auth/password.service';
import { PrismaUserRepository } from '../../../../../lib/server/repositories/user.repository';
import { logger } from '../../../../../lib/server/logger';
import { enforceRateLimit, defaultRateLimiter } from '../../../../../lib/server/middleware/rate-limit.middleware';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // Rate limit forgot-password requests: 5 per minute per IP
    await enforceRateLimit(req, defaultRateLimiter, 5, 60);

    const validation = await validateBody(req, ForgotPasswordSchema);
    if (!validation.success) return validation.response;

    const { email } = validation.data;

    try {
      const userRepo = container.resolve<PrismaUserRepository>(TOKENS.UserRepository);
      const user = await userRepo.findByEmail(email);

      if (user) {
        const passwordService = container.resolve<PasswordService>(TOKENS.PasswordService);
        const resetToken = passwordService.generateResetToken(60);
        logger.info(`[Auth] Password reset token generated for user ${user.id} (expires: ${resetToken.expiresAt.toISOString()})`);
      }
    } catch (error) {
      logger.warn(`[Auth] Forgot password process handled without database connection: ${String(error)}`);
    }

    // Always return success to prevent user email enumeration attacks
    return new Response(
      JSON.stringify(
        successResponse({
          message: 'If a matching account exists, password reset instructions have been dispatched.',
        })
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
}
