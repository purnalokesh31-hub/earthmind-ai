// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Incident Application Domain Service
// Clean Architecture Application Service Layer
// Orchestrates Domain Aggregate, Repositories, Audit, Notifications, Timeline & Event Bus
// ──────────────────────────────────────────────────────────────

import { IncidentFactory, IncidentStatus, IncidentSeverity } from '../../domain/incident';
import type { IIncidentRepository, IncidentEntity, IncidentSearchFilter } from '../repositories/incident.repository';
import type { IEvidenceRepository } from '../repositories/evidence.repository';
import type { IAuditRepository } from '../repositories/audit.repository';
import type { INotificationRepository } from '../repositories/notification.repository';
import type { ITimelineService } from './timeline.service';
import type { IEventBus } from '../events/event-bus';
import { eventBus as defaultEventBus } from '../events/event-bus';
import { CreateIncidentDto, UpdateIncidentDto, IncidentResponseDto, IncidentListResponseDto, toIncidentResponseDto } from '../dto/incident.dto';
import { NotFoundError, BadRequestError } from '../errors';
import { logger } from '../logger';

export interface IIncidentService {
  createIncident(dto: CreateIncidentDto, actorId?: string): Promise<IncidentResponseDto>;
  updateIncident(id: string, dto: UpdateIncidentDto, actorId?: string): Promise<IncidentResponseDto>;
  assignOfficer(incidentId: string, officerId: string, assignedByUserId?: string, note?: string): Promise<IncidentResponseDto>;
  changeStatus(incidentId: string, newStatus: string, changedByUserId?: string, note?: string): Promise<IncidentResponseDto>;
  verifyIncident(incidentId: string, verifiedByUserId?: string, note?: string): Promise<IncidentResponseDto>;
  resolveIncident(incidentId: string, resolvedByUserId?: string, note?: string): Promise<IncidentResponseDto>;
  archiveIncident(incidentId: string, archivedByUserId?: string, note?: string): Promise<IncidentResponseDto>;
  restoreIncident(incidentId: string, restoredByUserId?: string): Promise<IncidentResponseDto>;
  mergeIncident(primaryIncidentId: string, duplicateIncidentId: string, mergedByUserId?: string): Promise<IncidentResponseDto>;
  deleteIncident(incidentId: string, deletedByUserId?: string): Promise<boolean>;
  getIncidentById(id: string): Promise<IncidentResponseDto | null>;
  searchIncidents(query: string, filter?: IncidentSearchFilter): Promise<IncidentResponseDto[]>;
  searchIncidentsPaginated(query: string, filter?: IncidentSearchFilter): Promise<IncidentListResponseDto>;
  linkEvidence(incidentId: string, evidenceId: string, actorId?: string): Promise<void>;
  recalculateRisk(incidentId: string, damageScore: number, aiConfidence: number): Promise<IncidentResponseDto>;
}

export class IncidentService implements IIncidentService {
  constructor(
    private readonly incidentRepo: IIncidentRepository,
    private readonly evidenceRepo?: IEvidenceRepository,
    private readonly auditRepo?: IAuditRepository,
    private readonly notificationRepo?: INotificationRepository,
    private readonly timelineService?: ITimelineService,
    private readonly bus: IEventBus = defaultEventBus
  ) {}

  private mapToDto(entity: IncidentEntity): IncidentResponseDto {
    return toIncidentResponseDto(entity);
  }

  async createIncident(dto: CreateIncidentDto, actorId?: string): Promise<IncidentResponseDto> {
    // 1. Instantiate & validate pure Domain Aggregate Root
    const domainAggregate = IncidentFactory.createCitizenReport({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      severity: (dto.severity as any) || IncidentSeverity.MEDIUM,
      locationName: dto.locationName,
      lat: dto.lat,
      lng: dto.lng,
      reportedByUserId: actorId,
    });

    // 2. Persist Entity via Repository
    const createdEntity = await this.incidentRepo.create({
      title: domainAggregate.title,
      description: domainAggregate.description,
      status: domainAggregate.status,
      severity: domainAggregate.severity,
      category: domainAggregate.category,
      department: dto.department || 'GENERAL',
      departmentId: dto.departmentId,
      riskScore: domainAggregate.riskScore,
      locationName: domainAggregate.locationName,
      lat: domainAggregate.lat,
      lng: domainAggregate.lng,
      createdById: actorId,
      aiSummary: dto.aiSummary,
      repairCostEstimate: dto.repairCostEstimate,
    });

    // 3. Link initial evidence item if supplied
    if (dto.evidenceId && this.evidenceRepo) {
      await this.evidenceRepo.linkToIncident(dto.evidenceId, createdEntity.id);
    }

    // 4. Audit Log Recording
    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_CREATED',
        category: 'INCIDENT',
        actorId: actorId || 'SYSTEM',
        targetId: createdEntity.id,
        targetType: 'INCIDENT',
        description: `Incident '${createdEntity.incidentCode}' created: ${createdEntity.title}`,
      });
    }

    // 5. Automated Immutable Timeline Event Generation
    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId: createdEntity.id,
        action: 'INCIDENT_CREATED',
        actorId: actorId || 'SYSTEM',
        newStatus: createdEntity.status,
        note: `Incident ${createdEntity.incidentCode} created: ${createdEntity.title}`,
        metadata: {
          category: createdEntity.category,
          severity: createdEntity.severity,
          locationName: createdEntity.locationName,
        },
      });
    }

    // 6. Send Notification if CRITICAL severity
    if ((createdEntity.severity === 'CRITICAL' || createdEntity.severity === 'critical') && this.notificationRepo) {
      await this.notificationRepo.create({
        type: 'INCIDENT_ESCALATION',
        title: `CRITICAL Incident Reported: ${createdEntity.title}`,
        message: `High risk incident detected at ${createdEntity.locationName}`,
        severity: 'critical',
        isRead: false,
        channelEmail: false,
        channelSms: false,
        channelPush: true,
      });
    }

    // 7. Publish Domain Event for Event-Driven Analytics
    await this.bus.publish('INCIDENT_CREATED', {
      incidentId: createdEntity.id,
      incidentCode: createdEntity.incidentCode,
      title: createdEntity.title,
      severity: createdEntity.severity,
      category: createdEntity.category,
      department: createdEntity.department,
      departmentId: createdEntity.departmentId,
      riskScore: createdEntity.riskScore,
      locationName: createdEntity.locationName,
      lat: createdEntity.lat,
      lng: createdEntity.lng,
      createdByUserId: actorId || 'SYSTEM',
      evidenceId: dto.evidenceId,
    });

    logger.info(`[IncidentService] Created incident ${createdEntity.incidentCode}`);
    return this.mapToDto(createdEntity);
  }

  async updateIncident(id: string, dto: UpdateIncidentDto, actorId = 'SYSTEM'): Promise<IncidentResponseDto> {
    const existing = await this.incidentRepo.findById(id);
    if (!existing) throw new NotFoundError(`Incident with ID '${id}' not found`);

    const updated = await this.incidentRepo.update(id, dto);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_UPDATED',
        category: 'INCIDENT',
        actorId,
        targetId: id,
        targetType: 'INCIDENT',
        description: `Incident '${updated.incidentCode}' updated`,
      });
    }

    await this.bus.publish('INCIDENT_UPDATED', {
      incidentId: id,
      updatedFields: Object.keys(dto),
      actorId,
    });

    return this.mapToDto(updated);
  }

  async assignOfficer(
    incidentId: string,
    officerId: string,
    assignedByUserId = 'SYSTEM',
    note?: string
  ): Promise<IncidentResponseDto> {
    const existing = await this.incidentRepo.findById(incidentId);
    if (!existing) throw new NotFoundError(`Incident with ID '${incidentId}' not found`);

    const updated = await this.incidentRepo.assignOfficer(incidentId, officerId, assignedByUserId, note);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'OFFICER_ASSIGNED',
        category: 'INCIDENT',
        actorId: assignedByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Officer '${officerId}' assigned to incident '${updated.incidentCode}'`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'OFFICER_ASSIGNED',
        actorId: assignedByUserId,
        previousStatus: existing.status,
        newStatus: updated.status,
        note: note || `Dispatched officer ${officerId}`,
        metadata: { officerId, assignedByUserId },
      });
    }

    if (this.notificationRepo) {
      await this.notificationRepo.create({
        type: 'INCIDENT_ASSIGNMENT',
        title: `You have been assigned to Incident ${updated.incidentCode}`,
        message: `Assigned: ${updated.title} at ${updated.locationName}`,
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
      assignedByUserId,
      previousStatus: existing.status,
      newStatus: updated.status,
      note,
    });

    return this.mapToDto(updated);
  }

  async changeStatus(
    incidentId: string,
    newStatus: string,
    changedByUserId = 'SYSTEM',
    note?: string
  ): Promise<IncidentResponseDto> {
    const existing = await this.incidentRepo.findById(incidentId);
    if (!existing) throw new NotFoundError(`Incident with ID '${incidentId}' not found`);

    const aggregate = IncidentFactory.reconstitute({
      id: existing.id,
      incidentNumber: existing.incidentCode,
      title: existing.title,
      description: existing.description,
      status: existing.status as IncidentStatus,
      severity: existing.severity as IncidentSeverity,
      category: existing.category,
      riskScore: existing.riskScore,
      locationName: existing.locationName,
      lat: existing.lat,
      lng: existing.lng,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });

    aggregate.transitionTo(newStatus as IncidentStatus, changedByUserId, note);

    const updated = await this.incidentRepo.changeStatus(incidentId, newStatus, changedByUserId, note);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'STATUS_CHANGED',
        category: 'INCIDENT',
        actorId: changedByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Incident '${updated.incidentCode}' status updated from '${existing.status}' to '${newStatus}'`,
      });
    }

    if (this.timelineService) {
      const actionName =
        newStatus === 'INVESTIGATING'
          ? 'INVESTIGATION_STARTED'
          : newStatus === 'RESOLVED'
          ? 'INCIDENT_RESOLVED'
          : 'STATUS_CHANGED';

      await this.timelineService.recordEvent({
        incidentId,
        action: actionName,
        actorId: changedByUserId,
        previousStatus: existing.status,
        newStatus,
        note: note || `Status changed to ${newStatus}`,
        metadata: { previousStatus: existing.status, newStatus },
      });
    }

    await this.bus.publish('STATUS_CHANGED', {
      incidentId,
      previousStatus: existing.status,
      newStatus,
      changedByUserId,
      note,
    });

    return this.mapToDto(updated);
  }

  async verifyIncident(incidentId: string, verifiedByUserId = 'SYSTEM', note?: string): Promise<IncidentResponseDto> {
    const updated = await this.changeStatus(incidentId, IncidentStatus.VERIFIED, verifiedByUserId, note || 'Incident verified by operator');

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'INCIDENT_VERIFIED',
        actorId: verifiedByUserId,
        newStatus: IncidentStatus.VERIFIED,
        note: note || 'Incident verified',
        metadata: { verifiedByUserId },
      });
    }

    await this.bus.publish('INCIDENT_VERIFIED', {
      incidentId,
      verifiedByUserId,
      note,
    });

    return updated;
  }

  async resolveIncident(incidentId: string, resolvedByUserId = 'SYSTEM', note?: string): Promise<IncidentResponseDto> {
    const updated = await this.changeStatus(incidentId, IncidentStatus.RESOLVED, resolvedByUserId, note || 'Incident hazard resolved');

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_RESOLVED',
        category: 'INCIDENT',
        actorId: resolvedByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Incident '${updated.incidentCode}' marked as RESOLVED`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'INCIDENT_RESOLVED',
        actorId: resolvedByUserId,
        newStatus: IncidentStatus.RESOLVED,
        note: note || 'Incident hazard resolved',
        metadata: { resolvedByUserId },
      });
    }

    await this.bus.publish('INCIDENT_RESOLVED', {
      incidentId,
      resolvedByUserId,
      note,
    });

    return updated;
  }

  async archiveIncident(incidentId: string, archivedByUserId = 'SYSTEM', note?: string): Promise<IncidentResponseDto> {
    const updated = await this.incidentRepo.archive(incidentId, archivedByUserId, note);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_ARCHIVED',
        category: 'INCIDENT',
        actorId: archivedByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Incident '${updated.incidentCode}' archived`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'INCIDENT_ARCHIVED',
        actorId: archivedByUserId,
        newStatus: IncidentStatus.ARCHIVED,
        note: note || 'Incident archived',
        metadata: { archivedByUserId },
      });
    }

    await this.bus.publish('INCIDENT_ARCHIVED', {
      incidentId,
      archivedByUserId,
      reason: note,
    });

    return this.mapToDto(updated);
  }

  async restoreIncident(incidentId: string, restoredByUserId = 'SYSTEM'): Promise<IncidentResponseDto> {
    const restored = await this.incidentRepo.restore(incidentId);

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_RESTORED',
        category: 'INCIDENT',
        actorId: restoredByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Incident '${restored.incidentCode}' restored from archive`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'INCIDENT_RESTORED',
        actorId: restoredByUserId,
        newStatus: restored.status,
        note: 'Incident restored from archive',
        metadata: { restoredByUserId },
      });
    }

    await this.bus.publish('INCIDENT_RESTORED', {
      incidentId,
      restoredByUserId,
    });

    return this.mapToDto(restored);
  }

  async mergeIncident(
    primaryIncidentId: string,
    duplicateIncidentId: string,
    mergedByUserId = 'SYSTEM'
  ): Promise<IncidentResponseDto> {
    if (!primaryIncidentId || !duplicateIncidentId) {
      throw new BadRequestError('Both primaryIncidentId and duplicateIncidentId must be provided');
    }

    if (primaryIncidentId === duplicateIncidentId) {
      throw new BadRequestError('Cannot merge an incident into itself');
    }

    const primary = await this.incidentRepo.findById(primaryIncidentId);
    if (!primary) throw new NotFoundError(`Primary incident '${primaryIncidentId}' not found`);

    const duplicate = await this.incidentRepo.findById(duplicateIncidentId);
    if (!duplicate) throw new NotFoundError(`Duplicate incident '${duplicateIncidentId}' not found`);

    if (primary.status === 'ARCHIVED' || primary.status === 'DELETED') {
      throw new BadRequestError(`Cannot merge into archived or deleted primary incident '${primaryIncidentId}'`);
    }

    if (duplicate.status === 'ARCHIVED' || duplicate.status === 'DELETED') {
      throw new BadRequestError(`Duplicate incident '${duplicateIncidentId}' is already archived or deleted`);
    }

    // 1. Evidence Transfer: Re-link all evidence items from duplicate to primary
    let transferredEvidenceCount = 0;
    if (this.evidenceRepo && typeof this.evidenceRepo.findByIncidentId === 'function') {
      const duplicateEvidence = await this.evidenceRepo.findByIncidentId(duplicateIncidentId);
      for (const ev of (duplicateEvidence || [])) {
        if (typeof this.evidenceRepo.linkToIncident === 'function') {
          await this.evidenceRepo.linkToIncident(ev.id, primaryIncidentId);
        }
        transferredEvidenceCount++;
      }
    }

    // 2. Aggregate Description & Risk Score
    const mergedDescriptionMarker = `[Merged from ${duplicate.incidentCode}]:`;
    let updatedDescription = primary.description;
    if (duplicate.description && !primary.description.includes(mergedDescriptionMarker)) {
      updatedDescription = `${primary.description}\n\n${mergedDescriptionMarker} ${duplicate.description}`;
    }

    const newRiskScore = Math.max(primary.riskScore || 0, duplicate.riskScore || 0);

    const updatedPrimary = await this.incidentRepo.update(primaryIncidentId, {
      description: updatedDescription,
      riskScore: newRiskScore,
    });

    // 3. Timeline Events for Primary and Duplicate
    await this.incidentRepo.addTimelineEvent(
      primaryIncidentId,
      primary.status,
      primary.status,
      mergedByUserId,
      `Merged duplicate incident ${duplicate.incidentCode} into this incident (${transferredEvidenceCount} evidence item(s) transferred)`
    );

    await this.incidentRepo.archive(
      duplicateIncidentId,
      mergedByUserId,
      `Merged into primary incident ${primary.incidentCode}`
    );

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId: primaryIncidentId,
        action: 'INCIDENT_MERGED',
        actorId: mergedByUserId,
        previousStatus: primary.status,
        newStatus: updatedPrimary.status,
        note: `Merged duplicate incident ${duplicate.incidentCode} (${transferredEvidenceCount} evidence items linked)`,
        metadata: {
          primaryIncidentId,
          duplicateIncidentId,
          duplicateIncidentCode: duplicate.incidentCode,
          transferredEvidenceCount,
        },
      });

      await this.timelineService.recordEvent({
        incidentId: duplicateIncidentId,
        action: 'INCIDENT_MERGED_AND_ARCHIVED',
        actorId: mergedByUserId,
        previousStatus: duplicate.status,
        newStatus: 'ARCHIVED',
        note: `Archived following merge into primary incident ${primary.incidentCode}`,
        metadata: {
          targetIncidentId: primaryIncidentId,
          targetIncidentCode: primary.incidentCode,
        },
      });
    }

    // 4. Audit Trail Logging
    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_MERGED',
        category: 'INCIDENT',
        actorId: mergedByUserId,
        targetId: primaryIncidentId,
        targetType: 'INCIDENT',
        description: `Merged incident '${duplicate.incidentCode}' into primary '${primary.incidentCode}' with ${transferredEvidenceCount} evidence transferred`,
      });

      await this.auditRepo.logEvent({
        action: 'INCIDENT_MERGED_AND_ARCHIVED',
        category: 'INCIDENT',
        actorId: mergedByUserId,
        targetId: duplicateIncidentId,
        targetType: 'INCIDENT',
        description: `Archived incident '${duplicate.incidentCode}' after merging into primary '${primary.incidentCode}'`,
      });
    }

    // 5. Publish to Event Bus
    await this.bus.publish('INCIDENT_MERGED', {
      primaryIncidentId,
      duplicateIncidentId,
      primaryIncidentCode: primary.incidentCode,
      duplicateIncidentCode: duplicate.incidentCode,
      mergedByUserId,
      transferredEvidenceCount,
    });

    return this.mapToDto(updatedPrimary);
  }

  async deleteIncident(incidentId: string, deletedByUserId = 'SYSTEM'): Promise<boolean> {
    const existing = await this.incidentRepo.findById(incidentId);
    if (!existing) throw new NotFoundError(`Incident with ID '${incidentId}' not found`);

    const success = await this.incidentRepo.delete(incidentId);

    if (success && this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'INCIDENT_DELETED',
        category: 'INCIDENT',
        actorId: deletedByUserId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Incident '${existing.incidentCode}' soft-deleted`,
      });
    }

    return success;
  }

  async getIncidentById(id: string): Promise<IncidentResponseDto | null> {
    const entity = await this.incidentRepo.findById(id);
    return entity ? this.mapToDto(entity) : null;
  }

  async searchIncidents(query: string, filter?: IncidentSearchFilter): Promise<IncidentResponseDto[]> {
    const entities = await this.incidentRepo.search(query, filter);
    return entities.map((e) => this.mapToDto(e));
  }

  async searchIncidentsPaginated(query: string, filter?: IncidentSearchFilter): Promise<IncidentListResponseDto> {
    const result = await this.incidentRepo.searchPaginated(query, filter);
    return {
      incidents: result.incidents.map((e) => this.mapToDto(e)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async linkEvidence(incidentId: string, evidenceId: string, actorId = 'SYSTEM'): Promise<void> {
    if (this.evidenceRepo) {
      await this.evidenceRepo.linkToIncident(evidenceId, incidentId);
    }

    if (this.auditRepo) {
      await this.auditRepo.logEvent({
        action: 'EVIDENCE_LINKED',
        category: 'INCIDENT',
        actorId,
        targetId: incidentId,
        targetType: 'INCIDENT',
        description: `Linked evidence '${evidenceId}' to incident '${incidentId}'`,
      });
    }

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'EVIDENCE_ADDED',
        actorId,
        note: `Linked evidence item '${evidenceId}'`,
        metadata: { evidenceId },
      });
    }
  }

  async recalculateRisk(incidentId: string, damageScore: number, aiConfidence: number): Promise<IncidentResponseDto> {
    const existing = await this.incidentRepo.findById(incidentId);
    if (!existing) throw new NotFoundError(`Incident with ID '${incidentId}' not found`);

    const aggregate = IncidentFactory.reconstitute({
      id: existing.id,
      incidentNumber: existing.incidentCode,
      title: existing.title,
      description: existing.description,
      status: existing.status as IncidentStatus,
      severity: existing.severity as IncidentSeverity,
      category: existing.category,
      riskScore: existing.riskScore,
      locationName: existing.locationName,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });

    const previousRiskScore = existing.riskScore;
    const newRiskScore = aggregate.updateRiskScore(damageScore, aiConfidence);
    const updated = await this.incidentRepo.update(incidentId, { riskScore: newRiskScore });

    if (this.timelineService) {
      await this.timelineService.recordEvent({
        incidentId,
        action: 'AI_ANALYSIS_COMPLETED',
        actorId: 'AI_VISION_ENGINE',
        note: `AI Risk analysis computed score ${newRiskScore}`,
        metadata: { damageScore, aiConfidence, newRiskScore },
      });
    }

    await this.bus.publish('RISK_RECALCULATED', {
      incidentId,
      previousRiskScore,
      newRiskScore,
      damageScore,
      aiConfidence,
    });

    logger.info(`[IncidentService] Recalculated risk score for ${incidentId}: ${newRiskScore}`);
    return this.mapToDto(updated);
  }
}
