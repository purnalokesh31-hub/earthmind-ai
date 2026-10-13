// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Admin Panel: Single User Operations Controller
// PATCH /api/v1/admin/users/[id]
// DELETE /api/v1/admin/users/[id]
// ──────────────────────────────────────────────────────────────

import { handleRequest } from '../../../../../../lib/server/errors/error-handler';
import { PrismaUserRepository } from '../../../../../../lib/server/repositories/user.repository';
import { PasswordService } from '../../../../../../lib/server/auth/password.service';
import { successResponse } from '../../../../../../lib/server/dto/shared.dto';
import { NotFoundError, BadRequestError } from '../../../../../../lib/server/errors';

const userRepo = new PrismaUserRepository();
const passwordService = new PasswordService();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const body = await req.json();

    const user = await userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }

    const updates: any = {};
    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.role !== undefined) updates.role = body.role;
    if (body.departmentId !== undefined) updates.departmentId = body.departmentId;
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.password) {
      updates.passwordHash = await passwordService.hashPassword(body.password);
    }

    const updated = await userRepo.update(id, updates);

    const sanitized = {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      departmentId: updated.departmentId,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };

    return new Response(JSON.stringify(successResponse(sanitized)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return handleRequest(req, async () => {
    const { id } = await params;
    const user = await userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }

    await userRepo.delete(id);

    return new Response(
      JSON.stringify(successResponse({ success: true, deletedUserId: id })),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}
