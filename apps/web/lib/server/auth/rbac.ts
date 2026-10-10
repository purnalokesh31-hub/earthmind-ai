// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Role Based Access Control (RBAC)
// Hierarchical roles and granular resource permission matrix
// ──────────────────────────────────────────────────────────────

import type { UserRole } from './jwt';

export type Permission =
  | 'incident:read'
  | 'incident:create'
  | 'incident:update'
  | 'incident:delete'
  | 'incident:assign'
  | 'evidence:read'
  | 'evidence:upload'
  | 'evidence:delete'
  | 'vision:analyze'
  | 'audit:read'
  | 'system:config'
  | 'user:manage';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SYSTEM_ADMIN: 100,
  SUPERVISOR: 80,
  COMMANDER: 60,
  FIELD_OFFICER: 40,
  ANALYST: 20,
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SYSTEM_ADMIN: [
    'incident:read',
    'incident:create',
    'incident:update',
    'incident:delete',
    'incident:assign',
    'evidence:read',
    'evidence:upload',
    'evidence:delete',
    'vision:analyze',
    'audit:read',
    'system:config',
    'user:manage',
  ],
  SUPERVISOR: [
    'incident:read',
    'incident:create',
    'incident:update',
    'incident:assign',
    'evidence:read',
    'evidence:upload',
    'vision:analyze',
    'audit:read',
  ],
  COMMANDER: [
    'incident:read',
    'incident:create',
    'incident:update',
    'incident:assign',
    'evidence:read',
    'evidence:upload',
    'vision:analyze',
  ],
  FIELD_OFFICER: [
    'incident:read',
    'incident:update',
    'evidence:read',
    'evidence:upload',
  ],
  ANALYST: [
    'incident:read',
    'evidence:read',
    'vision:analyze',
    'audit:read',
  ],
};

export function hasMinRole(userRole: UserRole, requiredMinRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredMinRole] || 0);
}

export function roleHasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}
