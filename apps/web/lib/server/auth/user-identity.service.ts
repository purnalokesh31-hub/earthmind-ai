// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized User Identity Subsystem
// Aggregates user profile, department, assigned incidents, role permissions, & activity history
// ──────────────────────────────────────────────────────────────

import { RoleType } from './permissions';
import { AuthenticatedUserContext } from './auth.middleware';
import { PERMISSION_MATRIX, PermissionResource, PermissionAction } from './permissions';
import { IUserRepository } from '../repositories/user.repository';
import { IDepartmentRepository } from '../repositories/department.repository';
import { IIncidentRepository } from '../repositories/incident.repository';
import { IAuditRepository } from '../repositories/audit.repository';
import container, { TOKENS } from '../container';
import { NotFoundError } from '../errors';
import { logger } from '../logger';

export interface UserIdentityProfile {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  departmentId: string | null;
  departmentName: string | null;
  department: any | null;
  permissions: Partial<Record<PermissionResource, PermissionAction[]>>;
  lastLoginAt: Date | null;
  assignedIncidentsCount: number;
  assignedIncidents: any[];
  recentActivity: any[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserIdentityService {
  getUserIdentity(userId: string): Promise<UserIdentityProfile>;
  getCurrentUserContext(context: AuthenticatedUserContext): Promise<UserIdentityProfile>;
  getUserDepartment(userId: string): Promise<any | null>;
  getUserAssignedIncidents(userId: string): Promise<any[]>;
  getUserPermissions(userId: string): Promise<Partial<Record<PermissionResource, PermissionAction[]>>>;
  getUserActivityHistory(userId: string, limit?: number): Promise<any[]>;
  recordUserActivity(userId: string, action: string, details?: Record<string, any>): Promise<void>;
  updateLastLogin(userId: string, ipAddress?: string): Promise<void>;
}

export class UserIdentityService implements IUserIdentityService {
  private userRepo?: IUserRepository;
  private departmentRepo?: IDepartmentRepository;
  private incidentRepo?: IIncidentRepository;
  private auditRepo?: IAuditRepository;

  constructor(
    userRepo?: IUserRepository,
    departmentRepo?: IDepartmentRepository,
    incidentRepo?: IIncidentRepository,
    auditRepo?: IAuditRepository
  ) {
    this.userRepo = userRepo;
    this.departmentRepo = departmentRepo;
    this.incidentRepo = incidentRepo;
    this.auditRepo = auditRepo;
  }

  private getUserRepo(): IUserRepository {
    if (!this.userRepo) {
      this.userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository);
    }
    return this.userRepo;
  }

  private getDepartmentRepo(): IDepartmentRepository {
    if (!this.departmentRepo) {
      this.departmentRepo = container.resolve<IDepartmentRepository>(TOKENS.DepartmentRepository);
    }
    return this.departmentRepo;
  }

  private getIncidentRepo(): IIncidentRepository {
    if (!this.incidentRepo) {
      this.incidentRepo = container.resolve<IIncidentRepository>(TOKENS.IncidentRepository);
    }
    return this.incidentRepo;
  }

  private getAuditRepo(): IAuditRepository {
    if (!this.auditRepo) {
      this.auditRepo = container.resolve<IAuditRepository>(TOKENS.AuditRepository);
    }
    return this.auditRepo;
  }

  async getUserIdentity(userId: string): Promise<UserIdentityProfile> {
    const user = await this.getUserRepo().findById(userId);
    if (!user) {
      throw new NotFoundError(`User profile '${userId}' not found`);
    }

    // 1. Fetch Department Details
    let department: any = null;
    if (user.departmentId) {
      department = await this.getDepartmentRepo().findById(user.departmentId);
    }

    // 2. Fetch Assigned Incidents
    const assignedIncidents = await this.getUserAssignedIncidents(userId);

    // 3. Fetch Recent Activity
    const recentActivity = await this.getUserActivityHistory(userId, 10);

    // 4. Role Permissions Matrix
    const permissions = PERMISSION_MATRIX[user.role as RoleType] || {};

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as RoleType,
      departmentId: user.departmentId || null,
      departmentName: department?.name || null,
      department,
      permissions,
      lastLoginAt: user.lastLoginAt || null,
      assignedIncidentsCount: assignedIncidents.length,
      assignedIncidents,
      recentActivity,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getCurrentUserContext(context: AuthenticatedUserContext): Promise<UserIdentityProfile> {
    return this.getUserIdentity(context.userId);
  }

  async getUserDepartment(userId: string): Promise<any | null> {
    const user = await this.getUserRepo().findById(userId);
    if (!user || !user.departmentId) return null;
    return this.getDepartmentRepo().findById(user.departmentId);
  }

  async getUserAssignedIncidents(userId: string): Promise<any[]> {
    const incidents = await this.getIncidentRepo().findAll();
    return incidents.filter((inc) => inc.assignedOfficerId === userId);
  }

  async getUserPermissions(userId: string): Promise<Partial<Record<PermissionResource, PermissionAction[]>>> {
    const user = await this.getUserRepo().findById(userId);
    if (!user) return {};
    return PERMISSION_MATRIX[user.role as RoleType] || {};
  }

  async getUserActivityHistory(userId: string, limit = 20): Promise<any[]> {
    const logs = await this.getAuditRepo().findByActor(userId);
    return logs.slice(0, limit);
  }

  async recordUserActivity(userId: string, action: string, details?: Record<string, any>): Promise<void> {
    await this.getAuditRepo().logEvent({
      action,
      category: 'AUTH',
      actorId: userId,
      description: `User activity: ${action}`,
      meta: details || null,
    });
    logger.info(`[UserIdentityService] Recorded activity '${action}' for user ${userId}`);
  }

  async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
    await this.getUserRepo().update(userId, { lastLoginAt: new Date() });
    await this.recordUserActivity(userId, 'USER_LOGIN', { ipAddress: ipAddress || '127.0.0.1' });
  }
}
