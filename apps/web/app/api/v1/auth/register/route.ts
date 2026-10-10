// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — POST /api/v1/auth/register
// Validates registration payload, hashes password, and creates account
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { validateBody } from '../../../../../lib/server/validation/validate';
import { RegisterSchema } from '../../../../../lib/server/validation/auth.schema';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import container, { TOKENS } from '../../../../../lib/server/container';
import { IUserRepository } from '../../../../../lib/server/repositories/user.repository';
import { PasswordService } from '../../../../../lib/server/auth/password.service';
import { ConflictError } from '../../../../../lib/server/errors';
import { logger } from '../../../../../lib/server/logger';

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, async () => {
    // 1. Validate Registration Payload
    const validation = await validateBody(req, RegisterSchema);
    if (!validation.success) return validation.response;

    const { email, password, fullName, departmentId } = validation.data;

    // 2. Verify Email Uniqueness
    const userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository);
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // 3. Hash Password
    const passwordService = new PasswordService();
    const passwordHash = await passwordService.hashPassword(password);

    // 4. Create User Record
    const newUser = await userRepo.create({
      email,
      passwordHash,
      fullName,
      role: 'FIELD_OFFICER',
      departmentId: departmentId || null,
      isActive: true,
    });

    logger.info(`[AuthRegister] New user registered successfully: ${newUser.email} (ID: ${newUser.id})`);

    const { passwordHash: _, ...userDto } = newUser;

    return new Response(
      JSON.stringify(
        successResponse({
          user: userDto,
          requireOtp: true,
          message: 'Account created successfully. Please verify your OTP to complete setup.',
        })
      ),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}
