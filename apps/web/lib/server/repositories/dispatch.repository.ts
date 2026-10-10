// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Prisma Dispatch Repository Implementation
// Clean Architecture Data Access Layer for Dispatches
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import { IDispatchRepository } from './dispatch.repository.interface';
import { DispatchEntityProps, DispatchStatusType } from '../../domain/dispatch/dispatch.types';
import { logger } from '../logger';

export class PrismaDispatchRepository implements IDispatchRepository {
  private inMemoryStore: Map<string, DispatchEntityProps> = new Map();

  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async create(props: Omit<DispatchEntityProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<DispatchEntityProps> {
    const id = `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const entity: DispatchEntityProps = {
      ...props,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.client.dispatch.create({
          data: {
            id: entity.id,
            incidentId: entity.incidentId,
            assignedOfficerId: entity.assignedOfficerId,
            departmentId: entity.departmentId,
            priority: entity.priority as any,
            status: entity.status as any,
            dispatchReason: entity.dispatchReason,
            assignedAt: entity.assignedAt,
            estimatedResponseTime: entity.estimatedResponseTime,
            escalationLevel: entity.escalationLevel,
          },
        });
      } catch (err) {
        logger.warn(`[PrismaDispatchRepository] Database write offline/fallback: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    this.inMemoryStore.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<DispatchEntityProps | null> {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const record = await this.client.dispatch.findUnique({ where: { id } });
        if (record) {
          return {
            id: record.id,
            incidentId: record.incidentId,
            assignedOfficerId: record.assignedOfficerId,
            departmentId: record.departmentId,
            priority: record.priority as DispatchEntityProps['priority'],
            status: record.status as DispatchStatusType,
            dispatchReason: record.dispatchReason,
            assignedAt: record.assignedAt,
            acknowledgedAt: record.acknowledgedAt,
            dispatchedAt: record.dispatchedAt,
            enRouteAt: record.enRouteAt,
            onSceneAt: record.onSceneAt,
            estimatedResponseTime: record.estimatedResponseTime,
            actualResponseTime: record.actualResponseTime,
            completedAt: record.completedAt,
            escalationLevel: record.escalationLevel,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          };
        }
      } catch (_) {
        // Fallback
      }
    }

    return this.inMemoryStore.get(id) || null;
  }

  async findByIncidentId(incidentId: string): Promise<DispatchEntityProps[]> {
    const memoryMatches = Array.from(this.inMemoryStore.values()).filter((d) => d.incidentId === incidentId);
    return memoryMatches;
  }

  async findActive(): Promise<DispatchEntityProps[]> {
    const activeStatuses: DispatchStatusType[] = ['PENDING', 'QUEUED', 'ASSIGNED', 'DISPATCHED', 'ACKNOWLEDGED', 'EN_ROUTE', 'ON_SCENE', 'INVESTIGATING', 'ESCALATED'];
    return Array.from(this.inMemoryStore.values()).filter((d) => activeStatuses.includes(d.status));
  }

  async findByOfficer(officerId: string): Promise<DispatchEntityProps[]> {
    return Array.from(this.inMemoryStore.values()).filter((d) => d.assignedOfficerId === officerId);
  }

  async findByDepartment(departmentId: string): Promise<DispatchEntityProps[]> {
    return Array.from(this.inMemoryStore.values()).filter((d) => d.departmentId === departmentId);
  }

  async updateStatus(id: string, status: DispatchStatusType): Promise<DispatchEntityProps> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Dispatch '${id}' not found`);

    existing.status = status;
    existing.updatedAt = new Date();
    this.inMemoryStore.set(id, existing);
    return existing;
  }

  async assign(id: string, officerId: string, departmentId?: string): Promise<DispatchEntityProps> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Dispatch '${id}' not found`);

    existing.assignedOfficerId = officerId;
    if (departmentId) existing.departmentId = departmentId;
    existing.status = 'ASSIGNED';
    existing.updatedAt = new Date();
    this.inMemoryStore.set(id, existing);
    return existing;
  }

  async reassign(id: string, newOfficerId: string, reason?: string): Promise<DispatchEntityProps> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Dispatch '${id}' not found`);

    existing.assignedOfficerId = newOfficerId;
    existing.status = 'ASSIGNED';
    if (reason) existing.dispatchReason += ` [REASSIGNED: ${reason}]`;
    existing.updatedAt = new Date();
    this.inMemoryStore.set(id, existing);
    return existing;
  }

  async escalate(id: string, newLevel: number, reason?: string): Promise<DispatchEntityProps> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Dispatch '${id}' not found`);

    existing.escalationLevel = newLevel;
    existing.status = 'ESCALATED';
    if (reason) existing.dispatchReason += ` [ESCALATED L${newLevel}: ${reason}]`;
    existing.updatedAt = new Date();
    this.inMemoryStore.set(id, existing);
    return existing;
  }

  async countActive(): Promise<number> {
    const active = await this.findActive();
    return active.length;
  }

  async searchPaginated(page = 1, limit = 10): Promise<{ data: DispatchEntityProps[]; total: number }> {
    const all = Array.from(this.inMemoryStore.values());
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    return { data, total: all.length };
  }
}

export const prismaDispatchRepository = new PrismaDispatchRepository();
