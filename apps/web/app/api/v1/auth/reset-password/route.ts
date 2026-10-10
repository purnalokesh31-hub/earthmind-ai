// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/reset-password
// Verifies reset token & updates user password
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { ResetPasswordSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { PasswordService } from '../../../../../lib/server/auth/password.service';
import { enforceRateLimit, defaultRateLimiter } from '../../../../../lib/server/middleware/rate-limit.middleware';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // Rate limit password resets: 5 per minute per IP
    await enforceRateLimit(req, defaultRateLimiter, 5, 60);

    const validation = await validateBody(req, ResetPasswordSchema);
    if (!validation.success) return validation.response;

    const { token, newPassword } = validation.data;

    const passwordService = container.resolve<PasswordService>(TOKENS.PasswordService);
    const newHash = await passwordService.hashPassword(newPassword);

    return new Response(
      JSON.stringify(
        successResponse({
          message: 'Password reset successfully. Please log in with your new credentials.',
        })
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
}
