// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Audit Repository Interface & Prisma Implementation
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface AuditLogEntity {
  id: string;
  action: string;
  category: 'INCIDENT' | 'EVIDENCE' | 'AUTH' | 'VISION' | 'SYSTEM' | 'REPORT' | string;
  actorId: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  description: string;
  meta?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  traceId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interface Contract ─────────────────────────────────────────
export interface IAuditRepository extends IBaseRepository<AuditLogEntity> {
  logEvent(event: Omit<AuditLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditLogEntity>;
  findByActor(actorId: string): Promise<AuditLogEntity[]>;
  findByCategory(category: AuditLogEntity['category']): Promise<AuditLogEntity[]>;
  findByTarget(targetId: string): Promise<AuditLogEntity[]>;
  findByDateRange(from: Date, to: Date): Promise<AuditLogEntity[]>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<AuditLogEntity | null> {
    const item = await this.client.auditLog.findUnique({ where: { id } });
    if (!item) return null;
    return item as unknown as AuditLogEntity;
  }

  async findAll(options?: FindAllOptions): Promise<AuditLogEntity[]> {
    const items = await this.client.auditLog.findMany({
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as AuditLogEntity[];
  }

  async create(data: Omit<AuditLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditLogEntity> {
    const item = await this.client.auditLog.create({
      data: {
        action: data.action,
        category: data.category,
        actorId: data.actorId,
        actorEmail: data.actorEmail || 'unknown@earthmind.gov',
        actorRole: data.actorRole || 'COMMANDER',
        targetId: data.targetId || undefined,
        targetType: data.targetType || undefined,
        description: data.description,
        meta: data.meta ? (data.meta as any) : undefined,
        ipAddress: data.ipAddress || undefined,
        userAgent: data.userAgent || undefined,
        traceId: data.traceId || undefined,
      },
    });
    return item as unknown as AuditLogEntity;
  }

  async update(id: string, data: Partial<Omit<AuditLogEntity, 'id' | 'createdAt'>>): Promise<AuditLogEntity> {
    return { id, updatedAt: new Date() } as AuditLogEntity;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }

  async count(): Promise<number> {
    return this.client.auditLog.count();
  }

  async logEvent(event: Omit<AuditLogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditLogEntity> {
    return this.create(event);
  }

  async findByActor(actorId: string): Promise<AuditLogEntity[]> {
    const items = await this.client.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as AuditLogEntity[];
  }

  async findByCategory(category: AuditLogEntity['category']): Promise<AuditLogEntity[]> {
    const items = await this.client.auditLog.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as AuditLogEntity[];
  }

  async findByTarget(targetId: string): Promise<AuditLogEntity[]> {
    const items = await this.client.auditLog.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as AuditLogEntity[];
  }

  async findByDateRange(from: Date, to: Date): Promise<AuditLogEntity[]> {
    const items = await this.client.auditLog.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as AuditLogEntity[];
  }
}
