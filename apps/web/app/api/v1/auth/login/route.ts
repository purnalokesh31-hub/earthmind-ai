// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/login
// Validates credentials, issues JWT token pair, creates session, & sets auth cookie
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { LoginSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { AuthService } from '../../../../../lib/server/services/auth.service';
import { SessionService } from '../../../../../lib/server/auth/session.service';
import { enforceRateLimit, defaultRateLimiter } from '../../../../../lib/server/middleware/rate-limit.middleware';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // Rate limit login attempts: 10 per minute per IP
    await enforceRateLimit(req, defaultRateLimiter, 10, 60);

    // 1. Validate Request Payload
    const validation = await validateBody(req, LoginSchema);
    if (!validation.success) return validation.response;

    const { email, password } = validation.data;

    // 2. Authenticate Credentials & Issue Tokens
    const authService = container.resolve<AuthService>(TOKENS.AuthService);
    const { tokenPair, user } = await authService.login(email, password);

    // 3. Create Session Record
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

    const responseBody = successResponse({
      tokenPair,
      session,
      user,
    });

    // 4. Return HTTP Response with Cookie
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
