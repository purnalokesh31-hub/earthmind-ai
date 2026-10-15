// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Role-Based Access Control (RBAC) Guard
// Enforces role permissions and resource-level access rules across 7 enterprise roles
// ──────────────────────────────────────────────────────────────

import { RoleType } from './permissions';
import { AuthenticatedUserContext } from './auth.middleware';
import { PermissionResource, PermissionAction, hasResourcePermission } from './permissions';
import { ForbiddenError } from '../errors';

const ROLE_HIERARCHY: Record<string, number> = {
  [RoleType.SYSTEM_ADMIN]: 100,
  [RoleType.COMMANDER]: 80,
  [RoleType.SUPERVISOR]: 70,
  [RoleType.FIELD_OFFICER]: 50,
  [RoleType.ANALYST]: 50,
  [RoleType.AUDITOR]: 40,
  [RoleType.VIEWER]: 10,
  [RoleType.CITIZEN]: 5,
};

export class RbacGuard {
  static checkPermission(user: AuthenticatedUserContext, allowedRoles: RoleType[]): void {
    if (!user || !user.role) {
      throw new ForbiddenError('User role missing from authentication context');
    }

    if (user.role === RoleType.SYSTEM_ADMIN) {
      return;
    }

    const roleEnum = user.role as RoleType;
    const hasRole = allowedRoles.some((role) => role === roleEnum);
    if (!hasRole) {
      throw new ForbiddenError(`Role '${user.role}' is not authorized to perform this operation`);
    }
  }

  static requirePermission(
    user: AuthenticatedUserContext,
    resource: PermissionResource,
    action: PermissionAction,
    ownerId?: string
  ): void {
    if (!user || !user.role) {
      throw new ForbiddenError('User role missing from authentication context');
    }

    const roleEnum = user.role as RoleType;
    const allowed = hasResourcePermission(roleEnum, resource, action, ownerId, user.userId);
    if (!allowed) {
      throw new ForbiddenError(
        `Role '${user.role}' does not have permission to ${action} resource '${resource}'`
      );
    }
  }

  static isAtLeast(user: AuthenticatedUserContext, minimumRole: RoleType): boolean {
    const userWeight = ROLE_HIERARCHY[user.role] || 0;
    const requiredWeight = ROLE_HIERARCHY[minimumRole] || 0;
    return userWeight >= requiredWeight;
  }
}
