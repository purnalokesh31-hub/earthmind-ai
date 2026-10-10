// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/logout
// Authenticates user, revokes token JTI, invalidates session, & clears auth cookie
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { AuthMiddleware } from '../../../../../lib/server/auth/auth.middleware';
import { TokenService } from '../../../../../lib/server/auth/token.service';
import { SessionService } from '../../../../../lib/server/auth/session.service';

export async function POST(req: NextRequest): Promise<Response> {
  return handleRequest(req, async () => {
    // 1. Authenticate Request Context
    const authMiddleware = container.resolve<AuthMiddleware>(TOKENS.AuthMiddleware);
    const context = await authMiddleware.authenticateRequest(req);

    // 2. Revoke Access Token JTI
    const tokenService = container.resolve<TokenService>(TOKENS.TokenService);
    await tokenService.revokeToken(context.jti);

    // 3. Invalidate Session
    const sessionService = container.resolve<SessionService>(TOKENS.SessionService);
    await sessionService.invalidateAllUserSessions(context.userId);

    const response = new Response(
      JSON.stringify(successResponse({ message: 'Logged out successfully' })),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // 4. Clear Auth Cookie
    response.headers.append(
      'Set-Cookie',
      `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );

    return response;
  });
}
