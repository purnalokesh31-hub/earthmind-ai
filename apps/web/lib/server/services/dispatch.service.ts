// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Application Service
// Clean Architecture Business Logic Layer for Dispatches
// ──────────────────────────────────────────────────────────────

import { IDispatchRepository } from '../repositories/dispatch.repository.interface';
import { prismaDispatchRepository } from '../repositories/dispatch.repository';
import { DispatchEntity } from '../../domain/dispatch/dispatch.entity';
import { CreateDispatchInput } from '../../domain/dispatch/dispatch.validator';
import { DispatchResponseDto, toDispatchResponseDto } from '../dto/dispatch.dto';
import { dispatchNotificationService } from '../notifications/dispatch-notification.service';
import { escalationEngine } from '../dispatch/escalation-engine';
import { logger } from '../logger';

export class DispatchService {
  constructor(private readonly repo: IDispatchRepository = prismaDispatchRepository) {}

  async createDispatch(input: CreateDispatchInput): Promise<DispatchResponseDto> {
    const entityProps = await this.repo.create({
      incidentId: input.incidentId,
      assignedOfficerId: input.assignedOfficerId || null,
      departmentId: input.departmentId || null,
      priority: input.priority || 'MEDIUM',
      status: input.assignedOfficerId ? 'ASSIGNED' : 'PENDING',
      dispatchReason: input.dispatchReason,
      assignedAt: new Date(),
      escalationLevel: 0,
    });

    if (input.assignedOfficerId) {
      await dispatchNotificationService.dispatchNotification({
        notificationId: `notif-${Date.now()}`,
        recipientId: input.assignedOfficerId,
        title: `⚡ Incident Dispatch Assigned [${input.priority}]`,
        message: `You have been autonomously assigned to Incident ${input.incidentId}: ${input.dispatchReason}`,
        priority: input.priority as any,
        channels: ['IN_APP', 'PUSH'],
        linkedEntityId: entityProps.id,
      });
    }

    logger.info(`[DispatchService] Created dispatch '${entityProps.id}' for incident '${input.incidentId}'`);
    return toDispatchResponseDto(entityProps);
  }

  async getDispatchById(id: string): Promise<DispatchResponseDto | null> {
    const record = await this.repo.findById(id);
    return record ? toDispatchResponseDto(record) : null;
  }

  async acknowledgeDispatch(id: string, notes?: string): Promise<DispatchResponseDto> {
    const raw = await this.repo.findById(id);
    if (!raw) throw new Error(`Dispatch '${id}' not found`);

    const entity = new DispatchEntity(raw);
    const transition = entity.acknowledge();
    if (!transition.success) {
      throw new Error(transition.error || 'Failed to acknowledge dispatch');
    }

    const updated = await this.repo.updateStatus(id, 'ACKNOWLEDGED');
    logger.info(`[DispatchService] Dispatch '${id}' acknowledged${notes ? ` (Notes: ${notes})` : ''}`);
    return toDispatchResponseDto(updated);
  }

  async markEnRoute(id: string): Promise<DispatchResponseDto> {
    const raw = await this.repo.findById(id);
    if (!raw) throw new Error(`Dispatch '${id}' not found`);

    const entity = new DispatchEntity(raw);
    const transition = entity.markEnRoute();
    if (!transition.success) throw new Error(transition.error);

    const updated = await this.repo.updateStatus(id, 'EN_ROUTE');
    return toDispatchResponseDto(updated);
  }

  async markOnScene(id: string): Promise<DispatchResponseDto> {
    const raw = await this.repo.findById(id);
    if (!raw) throw new Error(`Dispatch '${id}' not found`);

    const entity = new DispatchEntity(raw);
    const transition = entity.markOnScene();
    if (!transition.success) throw new Error(transition.error);

    const updated = await this.repo.updateStatus(id, 'ON_SCENE');
    return toDispatchResponseDto(updated);
  }

  async resolveDispatch(id: string): Promise<DispatchResponseDto> {
    const raw = await this.repo.findById(id);
    if (!raw) throw new Error(`Dispatch '${id}' not found`);

    const entity = new DispatchEntity(raw);
    const transition = entity.resolve();
    if (!transition.success) throw new Error(transition.error);

    const updated = await this.repo.updateStatus(id, 'RESOLVED');
    return toDispatchResponseDto(updated);
  }

  async escalateDispatch(id: string, reason: string): Promise<DispatchResponseDto> {
    const raw = await this.repo.findById(id);
    if (!raw) throw new Error(`Dispatch '${id}' not found`);

    const entity = new DispatchEntity(raw);
    const record = escalationEngine.evaluateEscalation(entity, reason);

    const updated = await this.repo.escalate(id, record.newLevel, reason);
    return toDispatchResponseDto(updated);
  }

  async reassignDispatch(id: string, newOfficerId: string, reason: string): Promise<DispatchResponseDto> {
    const updated = await this.repo.reassign(id, newOfficerId, reason);
    return toDispatchResponseDto(updated);
  }

  async getActiveDispatches(): Promise<DispatchResponseDto[]> {
    const active = await this.repo.findActive();
    return active.map(toDispatchResponseDto);
  }

  async getDispatchesByIncident(incidentId: string): Promise<DispatchResponseDto[]> {
    const list = await this.repo.findByIncidentId(incidentId);
    return list.map(toDispatchResponseDto);
  }
}

export const dispatchService = new DispatchService();
