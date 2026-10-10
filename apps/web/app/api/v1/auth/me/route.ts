// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET /api/v1/auth/me
// Returns current authenticated user context, profile data, & active sessions
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { AuthMiddleware } from '../../../../../lib/server/auth/auth.middleware';
import { PrismaUserRepository } from '../../../../../lib/server/repositories/user.repository';
import { SessionService } from '../../../../../lib/server/auth/session.service';
import { UnauthorizedError } from '../../../../../lib/server/errors';

export async function GET(req: NextRequest): Promise<Response> {
  return handleRequest(req, async () => {
    // 1. Authenticate Request
    const authMiddleware = container.resolve<AuthMiddleware>(TOKENS.AuthMiddleware);
    const context = await authMiddleware.authenticateRequest(req);

    // 2. Fetch User Profile
    const userRepo = container.resolve<PrismaUserRepository>(TOKENS.UserRepository);
    const user = await userRepo.findById(context.userId);
    if (!user) throw new UnauthorizedError('User profile not found');

    // 3. Fetch Active User Sessions
    const sessionService = container.resolve<SessionService>(TOKENS.SessionService);
    const activeSessions = await sessionService.getUserSessions(user.id);

    const { passwordHash, ...userWithoutPassword } = user;

    return new Response(
      JSON.stringify(
        successResponse({
          user: userWithoutPassword,
          authContext: context,
          activeSessions,
        })
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
}
