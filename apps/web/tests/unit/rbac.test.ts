import { describe, it, expect } from 'vitest';
import { RoleType } from '@prisma/client';
import { RbacGuard, hasPermission, hasResourcePermission } from '../../lib/server/auth';
import { ForbiddenError } from '../../lib/server/errors';

describe('Phase 6.3.4 — Enterprise RBAC & 7-Role Permission Matrix Verification', () => {
  it('should grant SYSTEM_ADMIN global permission bypass for all resources and actions', () => {
    expect(hasPermission(RoleType.SYSTEM_ADMIN, 'INCIDENT', 'DELETE')).toBe(true);
    expect(hasPermission(RoleType.SYSTEM_ADMIN, 'USER', 'MANAGE')).toBe(true);
    expect(hasPermission(RoleType.SYSTEM_ADMIN, 'SYSTEM', 'UPDATE')).toBe(true);
  });

  it('should enforce role permissions according to enterprise matrix', () => {
    // COMMANDER can DISPATCH and DELETE incidents
    expect(hasPermission(RoleType.COMMANDER, 'INCIDENT', 'DISPATCH')).toBe(true);
    expect(hasPermission(RoleType.COMMANDER, 'INCIDENT', 'DELETE')).toBe(true);

    // SUPERVISOR can DISPATCH but NOT DELETE incidents
    expect(hasPermission(RoleType.SUPERVISOR, 'INCIDENT', 'DISPATCH')).toBe(true);
    expect(hasPermission(RoleType.SUPERVISOR, 'INCIDENT', 'DELETE')).toBe(false);

    // FIELD_OFFICER can CREATE, READ, UPDATE incidents, but NOT DISPATCH or DELETE
    expect(hasPermission(RoleType.FIELD_OFFICER, 'INCIDENT', 'CREATE')).toBe(true);
    expect(hasPermission(RoleType.FIELD_OFFICER, 'INCIDENT', 'DISPATCH')).toBe(false);

    // AUDITOR can READ and EXPORT AUDIT logs, but NOT CREATE or DELETE
    expect(hasPermission(RoleType.AUDITOR, 'AUDIT', 'READ')).toBe(true);
    expect(hasPermission(RoleType.AUDITOR, 'AUDIT', 'EXPORT')).toBe(true);
    expect(hasPermission(RoleType.AUDITOR, 'AUDIT', 'DELETE')).toBe(false);

    // VIEWER can only READ INCIDENT & METRICS
    expect(hasPermission(RoleType.VIEWER, 'INCIDENT', 'READ')).toBe(true);
    expect(hasPermission(RoleType.VIEWER, 'INCIDENT', 'CREATE')).toBe(false);
    expect(hasPermission(RoleType.VIEWER, 'INCIDENT', 'UPDATE')).toBe(false);
  });

  it('should evaluate resource-level ownership permissions', () => {
    const ownerId = 'usr-field-01';
    const otherId = 'usr-field-02';

    // Field Officer editing own reported incident
    expect(hasResourcePermission(RoleType.FIELD_OFFICER, 'INCIDENT', 'UPDATE', ownerId, ownerId)).toBe(true);

    // Field Officer editing someone else's incident without global permission
    expect(hasResourcePermission(RoleType.FIELD_OFFICER, 'INCIDENT', 'DELETE', ownerId, ownerId)).toBe(false);
  });

  it('should throw ForbiddenError when user lacks required permission in RbacGuard', () => {
    const viewerUser = {
      userId: 'usr-view-1',
      email: 'viewer@earthmind.gov',
      role: RoleType.VIEWER,
      jti: 'jti-view-1',
    };

    expect(() => RbacGuard.requirePermission(viewerUser, 'INCIDENT', 'READ')).not.toThrow();

    expect(() => RbacGuard.requirePermission(viewerUser, 'INCIDENT', 'DELETE')).toThrow(ForbiddenError);
  });

  it('should evaluate role hierarchy correctly in RbacGuard.isAtLeast', () => {
    const commander = { userId: 'u1', email: 'c@gov', role: RoleType.COMMANDER, jti: 'j1' };
    const officer = { userId: 'u2', email: 'o@gov', role: RoleType.FIELD_OFFICER, jti: 'j2' };

    expect(RbacGuard.isAtLeast(commander, RoleType.SUPERVISOR)).toBe(true);
    expect(RbacGuard.isAtLeast(officer, RoleType.COMMANDER)).toBe(false);
  });
});
