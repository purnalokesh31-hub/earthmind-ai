// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Assignment & Dispatch Engine Subsystem
// Handles Officer Assignments, Department Transfers, Priority Escalations,
// Workload-based Reassignment, and Dispatch History
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { IncidentStatus as PrismaStatus, RoleType } from '../database/enums';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IIncidentRepository } from '../repositories/incident.repository';
import type { IAuditRepository } from '../repositories/audit.repository';
import type { INotificationRepository } from '../repositories/notification.repository';
import type { ITimelineService } from './timeline.service';
import type { IEventBus } from '../events/event-bus';
import { eventBus as defaultEventBus } from '../events/event-bus';
import { IncidentResponseDto, toIncidentResponseDto } from '../dto/incident.dto';
import { NotFoundError, ValidationError } from '../errors';
import { logger } from '../logger';

export interface DispatchHistoryDto {
  incidentId: string;
  assignments: Array<{
    id: string;
    assigneeId: string;
    assigneeName?: string;
    assignedById: string;
    assignedByName?: string;
    role: string;
    status: string;
    notes?: string | null;
    createdAt: Date;
  }>;
}

export interface IAssignmentService {
  assignOfficer(incidentId: string, officerId: string, assignedById: string, notes?: string): Promise<IncidentResponseDto>;
  assignDepartment(incidentId: string, departmentId: string, departmentName: string, assignedById: string, notes?: string): Promise<IncidentResponseDto>;
  escalatePriority(incidentId: string, newSeverity: string, escalatedById: string, reason?: string): Promise<IncidentResponseDto>;
  autoReassign(incidentId: string, departmentId: string, assignedById: string): Promise<IncidentResponseDto>;
  getDispatchHistory(incidentId: string): Promise<DispatchHistoryDto>;
}

export class AssignmentService implements IAssignmentService {
  constructor(
    private readonly incidentRepo: IIncidentRepository,
    private readonly auditRepo?: IAuditRepository,
    private readonly notificationRepo?: INotificationRepository,
    private readonly timelineService?: ITimelineService,
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly bus: IEventBus = defaultEventBus
  ) {}

  async assignOfficer(
    incidentId: string,
    officerId: string,
    assignedById: string,
    notes?: string
  ): Promise<IncidentResponseDto> {
    const incident = await this.incidentRepo.findById(incidentId);
    if (!incident) throw new NotFoundError(`Incident '${incidentId}' not found`);

    const officer = await this.prisma.user.findUnique({ where: { id: officerId } });
    if (!officer || officer.deletedAt || !officer.isActive) {
      throw new ValidationError(`Active officer with ID '${officerId}' not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.assignment.updateMany({
        where: { incidentId, status: 'ASSIGNED' },
        data: { status: 'REASSIGNED' },
      });

      await tx.assignment.create({
        data: {
          incidentId,
          assigneeId: officerId,
          assignedById,
          role: 'FIELD_OFFICER',
          status: 'ASSIGNED',
          notes: notes || undefined,
        },
      });

      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: {
          assignedOfficerId: officerId,
          status: PrismaStatus.DISPATCHED,
        },
      });

      return updated;
    });

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'OFFICER_ASSIGNED',
        category: 'ASSIGNMENT',
        actorId: assignedById,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Dispatched officer '${officer.fullName}' (${officerId}) to incident '${incident.incidentCode}'`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'OFFICER_ASSIGNED',
        actorId: assignedById,
        previousStatus: incident.status,
        newStatus: 'DISPATCHED',
        note: notes || `Dispatched officer ${officer.fullName}`,
        metadata: { officerId, officerName: officer.fullName, assignedById },
      });
    }

    if (this.notificationRepo) {
      await this.notificationRepo.create({
        type: 'INCIDENT_ASSIGNMENT',
        title: `Dispatch Notice: Incident ${incident.incidentCode}`,
        message: `You have been assigned to ${incident.title} at ${incident.locationName}`,
        recipientId: officerId,
        severity: 'high',
        isRead: false,
        channelEmail: false,
        channelSms: false,
        channelPush: true,
      });
    }

    await this.bus.publish('OFFICER_ASSIGNED', {
      incidentId,
      officerId,
      assignedByUserId: assignedById,
      previousStatus: incident.status,
      newStatus: 'DISPATCHED',
      note: notes,
    });

    logger.info(`[AssignmentService] Assigned officer ${officerId} to incident ${incidentId}`);
    return toIncidentResponseDto(result);
  }

  async assignDepartment(
    incidentId: string,
    departmentId: string,
    departmentName: string,
    assignedById: string,
    notes?: string
  ): Promise<IncidentResponseDto> {
    const incident = await this.incidentRepo.findById(incidentId);
    if (!incident) throw new NotFoundError(`Incident '${incidentId}' not found`);

    const updated = await this.incidentRepo.update(incidentId, {
      department: departmentName,
      departmentId,
    });

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'DEPARTMENT_ASSIGNED',
        category: 'ASSIGNMENT',
        actorId: assignedById,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Transferred incident '${incident.incidentCode}' to department '${departmentName}' (${departmentId})`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'DEPARTMENT_ASSIGNED',
        actorId: assignedById,
        note: notes || `Transferred to department ${departmentName}`,
        metadata: { departmentId, departmentName },
      });
    }

    await this.bus.publish('DEPARTMENT_ASSIGNED', {
      incidentId,
      departmentId,
      departmentName,
      assignedByUserId: assignedById,
    });

    return toIncidentResponseDto(updated);
  }

  async escalatePriority(
    incidentId: string,
    newSeverity: string,
    escalatedById: string,
    reason?: string
  ): Promise<IncidentResponseDto> {
    const incident = await this.incidentRepo.findById(incidentId);
    if (!incident) throw new NotFoundError(`Incident '${incidentId}' not found`);

    const previousSeverity = incident.severity;
    const previousRiskScore = incident.riskScore;
    const newRiskScore = Math.min(100, incident.riskScore + 20);

    const updated = await this.incidentRepo.update(incidentId, {
      severity: newSeverity,
      riskScore: newRiskScore,
    });

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'PRIORITY_ESCALATED',
        category: 'INCIDENT',
        actorId: escalatedById,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Escalated priority of '${incident.incidentCode}' to '${newSeverity}' (Risk: ${newRiskScore}). Reason: ${reason || 'N/A'}`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'PRIORITY_ESCALATED',
        actorId: escalatedById,
        note: reason || `Severity escalated to ${newSeverity}`,
        metadata: { previousSeverity, newSeverity, newRiskScore, escalatedById },
      });
    }

    await this.bus.publish('PRIORITY_ESCALATED', {
      incidentId,
      previousSeverity,
      newSeverity,
      previousRiskScore,
      newRiskScore,
      escalatedByUserId: escalatedById,
      reason,
    });

    return toIncidentResponseDto(updated);
  }

  async autoReassign(incidentId: string, departmentId: string, assignedById: string): Promise<IncidentResponseDto> {
    const officers = await this.prisma.user.findMany({
      where: {
        departmentId,
        isActive: true,
        deletedAt: null,
        role: { in: [RoleType.FIELD_OFFICER, RoleType.SUPERVISOR] },
      },
      include: {
        assignedIncidents: {
          where: { status: { in: [PrismaStatus.DISPATCHED, PrismaStatus.ACTIVE] } },
        },
      },
    });

    if (officers.length === 0) {
      throw new ValidationError(`No active field officers available in department '${departmentId}'`);
    }

    let lowestWorkloadOfficer = officers[0];
    let minCount = officers[0].assignedIncidents.length;

    for (let i = 1; i < officers.length; i++) {
      const count = officers[i].assignedIncidents.length;
      if (count < minCount) {
        minCount = count;
        lowestWorkloadOfficer = officers[i];
      }
    }

    logger.info(`[AssignmentService] Auto-selected officer ${lowestWorkloadOfficer.fullName} (Workload: ${minCount})`);
    return this.assignOfficer(incidentId, lowestWorkloadOfficer.id, assignedById, `Auto-dispatched based on lowest active workload (${minCount} active incidents)`);
  }

  async getDispatchHistory(incidentId: string): Promise<DispatchHistoryDto> {
    const incident = await this.incidentRepo.findById(incidentId);
    if (!incident) throw new NotFoundError(`Incident '${incidentId}' not found`);

    const assignments = await this.prisma.assignment.findMany({
      where: { incidentId },
      include: {
        assignee: { select: { id: true, fullName: true } },
        assignedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      incidentId,
      assignments: assignments.map((a) => ({
        id: a.id,
        assigneeId: a.assigneeId,
        assigneeName: a.assignee?.fullName,
        assignedById: a.assignedById,
        assignedByName: a.assignedBy?.fullName,
        role: a.role,
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt,
      })),
    };
  }
}
