// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Route Guard & Middleware Helpers
// High-level wrapper functions: authenticate, authorize, optionalAuth, adminOnly, etc.
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { RoleType } from './permissions';
import { authMiddleware, AuthenticatedUserContext } from './auth.middleware';
import { RbacGuard } from './rbac.guard';
import { PermissionResource, PermissionAction } from './permissions';
import container, { TOKENS } from '../container';
import { IUserRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../errors';
import { envConfig } from '../config';

/**
 * Extracts, validates, and returns the authenticated user context.
 * Throws UnauthorizedError (401) if token is missing, invalid, or revoked.
 */
export async function authenticate(req: NextRequest): Promise<AuthenticatedUserContext> {
  const context = await authMiddleware.authenticateRequest(req);

  // Optional User Status Verification (with safe timeout fallback)
  try {
    const userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository);
    const userPromise = userRepo.findById(context.userId);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 200));

    const user = await Promise.race([userPromise, timeoutPromise]);
    if (user && !user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
  }

  return context;
}

export async function authenticateOrPrototypeUser(req: NextRequest): Promise<AuthenticatedUserContext> {
  try {
    return await authenticate(req);
  } catch (error) {
    if (envConfig.NODE_ENV === 'test' || envConfig.REPOSITORY_DRIVER !== 'memory') {
      throw error;
    }

    return {
      userId: 'usr-prototype-citizen',
      email: 'prototype@earthmind.test',
      role: 'CITIZEN',
      jti: 'prototype-offline-session',
    };
  }
}

/**
 * Performs authentication AND enforces that the user possesses one of the allowed roles.
 */
export async function authorize(
  req: NextRequest,
  allowedRoles: RoleType[]
): Promise<AuthenticatedUserContext> {
  const context = await authenticate(req);
  RbacGuard.checkPermission(context, allowedRoles);
  return context;
}

/**
 * Performs authentication AND enforces specific resource-level permissions.
 */
export async function authorizePermission(
  req: NextRequest,
  resource: PermissionResource,
  action: PermissionAction,
  ownerId?: string
): Promise<AuthenticatedUserContext> {
  const context = await authenticate(req);
  RbacGuard.requirePermission(context, resource, action, ownerId);
  return context;
}

/**
 * Attempts authentication, but if token is missing or invalid, returns null (or guest context).
 * Useful for public endpoints with optional user customization.
 */
export async function optionalAuth(req: NextRequest): Promise<AuthenticatedUserContext | null> {
  try {
    return await authMiddleware.authenticateRequest(req);
  } catch {
    return null;
  }
}

/**
 * Shorthand middleware: Restricts access strictly to SYSTEM_ADMIN role.
 */
export async function adminOnly(req: NextRequest): Promise<AuthenticatedUserContext> {
  return authorize(req, [RoleType.SYSTEM_ADMIN]);
}

/**
 * Shorthand middleware: Restricts access to COMMANDER or SYSTEM_ADMIN roles.
 */
export async function commanderOnly(req: NextRequest): Promise<AuthenticatedUserContext> {
  return authorize(req, [RoleType.COMMANDER, RoleType.SYSTEM_ADMIN]);
}

/**
 * Shorthand middleware: Restricts access to FIELD_OFFICER, COMMANDER, or SYSTEM_ADMIN roles.
 */
export async function fieldOfficerOnly(req: NextRequest): Promise<AuthenticatedUserContext> {
  return authorize(req, [RoleType.FIELD_OFFICER, RoleType.COMMANDER, RoleType.SYSTEM_ADMIN]);
}
