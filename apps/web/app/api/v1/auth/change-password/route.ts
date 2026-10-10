// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/change-password
// Authenticates user, validates current password, & updates password hash
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { ChangePasswordSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { AuthMiddleware } from '../../../../../lib/server/auth/auth.middleware';
import { PasswordService } from '../../../../../lib/server/auth/password.service';
import { PrismaUserRepository } from '../../../../../lib/server/repositories/user.repository';
import { UnauthorizedError } from '../../../../../lib/server/errors';

export async function POST(req: NextRequest): Promise<Response> {
  return handleRequest(req, async () => {
    // 1. Authenticate Request
    const authMiddleware = container.resolve<AuthMiddleware>(TOKENS.AuthMiddleware);
    const context = await authMiddleware.authenticateRequest(req);

    // 2. Validate Request Body
    const validation = await validateBody(req, ChangePasswordSchema);
    if (!validation.success) return validation.response;

    const { currentPassword, newPassword } = validation.data;

    // 3. Verify Current Password
    const userRepo = container.resolve<PrismaUserRepository>(TOKENS.UserRepository);
    const user = await userRepo.findById(context.userId);
    if (!user) throw new UnauthorizedError('User profile not found');

    const passwordService = container.resolve<PasswordService>(TOKENS.PasswordService);
    const isValid = await passwordService.comparePassword(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    // 4. Hash New Password & Save
    const newHash = await passwordService.hashPassword(newPassword);
    await userRepo.update(user.id, { passwordHash: newHash });

    return new Response(
      JSON.stringify(successResponse({ message: 'Password changed successfully' })),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });
}
