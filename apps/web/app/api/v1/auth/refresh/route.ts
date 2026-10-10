// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/refresh
// Rotates refresh tokens & issues new access token pair
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { RefreshTokenSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { TokenService } from '../../../../../lib/server/auth/token.service';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    const validation = await validateBody(req, RefreshTokenSchema);
    if (!validation.success) return validation.response;

    const { refreshToken } = validation.data;

    const tokenService = container.resolve<TokenService>(TOKENS.TokenService);
    const newTokenPair = await tokenService.rotateRefreshToken(refreshToken);

    const response = new Response(JSON.stringify(successResponse({ tokenPair: newTokenPair })), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.headers.append(
      'Set-Cookie',
      `auth_token=${newTokenPair.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`
    );

    return response;
  });
}
