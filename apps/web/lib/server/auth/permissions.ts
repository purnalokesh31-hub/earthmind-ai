// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Role-Based Permission Matrix
// Declarative resource & action level permission mapping across 7 roles
// ──────────────────────────────────────────────────────────────

import { RoleType } from '../database/enums';
export { RoleType };

export type PermissionResource =
  | 'INCIDENT'
  | 'EVIDENCE'
  | 'USER'
  | 'DEPARTMENT'
  | 'AUDIT'
  | 'METRICS'
  | 'SYSTEM';

export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'DISPATCH'
  | 'EXPORT'
  | 'MANAGE';

// Matrix mapping: Role -> Resource -> Actions[]
export const PERMISSION_MATRIX: Record<RoleType, Partial<Record<PermissionResource, PermissionAction[]>>> = {
  [RoleType.SYSTEM_ADMIN]: {
    INCIDENT: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'DISPATCH', 'EXPORT', 'MANAGE'],
    EVIDENCE: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'MANAGE'],
    USER: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'MANAGE'],
    DEPARTMENT: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
    AUDIT: ['READ', 'EXPORT', 'MANAGE'],
    METRICS: ['READ', 'EXPORT', 'MANAGE'],
    SYSTEM: ['READ', 'UPDATE', 'MANAGE'],
  },
  [RoleType.COMMANDER]: {
    INCIDENT: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'DISPATCH', 'EXPORT'],
    EVIDENCE: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
    USER: ['READ', 'UPDATE'],
    DEPARTMENT: ['READ'],
    AUDIT: ['READ', 'EXPORT'],
    METRICS: ['READ', 'EXPORT'],
    SYSTEM: ['READ'],
  },
  [RoleType.SUPERVISOR]: {
    INCIDENT: ['CREATE', 'READ', 'UPDATE', 'DISPATCH', 'EXPORT'],
    EVIDENCE: ['CREATE', 'READ', 'UPDATE', 'EXPORT'],
    USER: ['READ'],
    DEPARTMENT: ['READ'],
    AUDIT: ['READ'],
    METRICS: ['READ', 'EXPORT'],
  },
  [RoleType.FIELD_OFFICER]: {
    INCIDENT: ['CREATE', 'READ', 'UPDATE'],
    EVIDENCE: ['CREATE', 'READ', 'UPDATE'],
    USER: ['READ'],
    DEPARTMENT: ['READ'],
    METRICS: ['READ'],
  },
  [RoleType.ANALYST]: {
    INCIDENT: ['READ', 'EXPORT'],
    EVIDENCE: ['READ', 'EXPORT'],
    USER: ['READ'],
    DEPARTMENT: ['READ'],
    AUDIT: ['READ'],
    METRICS: ['READ', 'EXPORT'],
  },
  [RoleType.AUDITOR]: {
    INCIDENT: ['READ', 'EXPORT'],
    EVIDENCE: ['READ', 'EXPORT'],
    USER: ['READ'],
    DEPARTMENT: ['READ'],
    AUDIT: ['READ', 'EXPORT'],
    METRICS: ['READ', 'EXPORT'],
  },
  [RoleType.VIEWER]: {
    INCIDENT: ['READ'],
    EVIDENCE: ['READ'],
    DEPARTMENT: ['READ'],
    METRICS: ['READ'],
  },
  [RoleType.CITIZEN]: {
    INCIDENT: ['CREATE', 'READ'],
    EVIDENCE: ['CREATE', 'READ'],
  },
};

/**
 * Checks if a given role has global permission for a resource action.
 */
export function hasPermission(
  role: RoleType,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  if (role === RoleType.SYSTEM_ADMIN) return true;

  const rolePermissions = PERMISSION_MATRIX[role];
  if (!rolePermissions) return false;

  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;

  return resourceActions.includes(action);
}

/**
 * Checks resource-level ownership permissions (e.g. Field Officer editing own reported incident/evidence).
 */
export function hasResourcePermission(
  role: RoleType,
  resource: PermissionResource,
  action: PermissionAction,
  ownerId?: string,
  currentUserId?: string
): boolean {
  // 1. Check global role permission first
  if (hasPermission(role, resource, action)) {
    return true;
  }

  // 2. Resource ownership check (Field officers can update their own evidence/incidents)
  if (ownerId && currentUserId && ownerId === currentUserId) {
    if (action === 'READ' || action === 'UPDATE') {
      return true;
    }
  }

  return false;
}
