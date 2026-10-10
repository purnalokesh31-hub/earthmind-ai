// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Evidence Repository Interface & Prisma Implementation
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface EvidenceEntity {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'document' | 'sensor' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'SENSOR';
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  status: 'pending' | 'processing' | 'analyzed' | 'failed' | 'PENDING' | 'PROCESSING' | 'ANALYZED' | 'FAILED';
  linkedIncidentId?: string | null;
  uploadedByUserId?: string | null;
  ocrText?: string | null;
  aiConfidence?: number | null;
  aiTaskLabel?: string | null;
  damageScore?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interface Contract ─────────────────────────────────────────
export interface IEvidenceRepository extends IBaseRepository<EvidenceEntity> {
  findByIncidentId(incidentId: string): Promise<EvidenceEntity[]>;
  findByStatus(status: EvidenceEntity['status']): Promise<EvidenceEntity[]>;
  findByFileType(fileType: EvidenceEntity['fileType']): Promise<EvidenceEntity[]>;
  findByUploader(userId: string): Promise<EvidenceEntity[]>;
  updateStatus(id: string, status: EvidenceEntity['status']): Promise<void>;
  linkToIncident(evidenceId: string, incidentId: string): Promise<void>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaEvidenceRepository implements IEvidenceRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  private mapType(type: string): any {
    return type.toUpperCase();
  }

  private mapStatus(status: string): any {
    return status.toUpperCase();
  }

  async findById(id: string): Promise<EvidenceEntity | null> {
    const item = await this.client.evidenceItem.findUnique({ where: { id } });
    if (!item) return null;
    return item as unknown as EvidenceEntity;
  }

  async findAll(options?: FindAllOptions): Promise<EvidenceEntity[]> {
    const items = await this.client.evidenceItem.findMany({
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as EvidenceEntity[];
  }

  async create(data: Omit<EvidenceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvidenceEntity> {
    const item = await this.client.evidenceItem.create({
      data: {
        fileName: data.fileName,
        fileType: this.mapType(data.fileType),
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        storageUrl: data.storageUrl,
        status: this.mapStatus(data.status || 'PENDING'),
        linkedIncidentId: data.linkedIncidentId || undefined,
        uploadedByUserId: data.uploadedByUserId || undefined,
      },
    });
    return item as unknown as EvidenceEntity;
  }

  async update(id: string, data: Partial<Omit<EvidenceEntity, 'id' | 'createdAt'>>): Promise<EvidenceEntity> {
    const item = await this.client.evidenceItem.update({
      where: { id },
      data: {
        ...(data.status ? { status: this.mapStatus(data.status) } : {}),
        ...(data.linkedIncidentId !== undefined ? { linkedIncidentId: data.linkedIncidentId } : {}),
      },
    });
    return item as unknown as EvidenceEntity;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.evidenceItem.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.client.evidenceItem.count();
  }

  async findByIncidentId(incidentId: string): Promise<EvidenceEntity[]> {
    const items = await this.client.evidenceItem.findMany({
      where: { linkedIncidentId: incidentId },
    });
    return items as unknown as EvidenceEntity[];
  }

  async findByStatus(status: EvidenceEntity['status']): Promise<EvidenceEntity[]> {
    const items = await this.client.evidenceItem.findMany({
      where: { status: this.mapStatus(status) },
    });
    return items as unknown as EvidenceEntity[];
  }

  async findByFileType(fileType: EvidenceEntity['fileType']): Promise<EvidenceEntity[]> {
    const items = await this.client.evidenceItem.findMany({
      where: { fileType: this.mapType(fileType) },
    });
    return items as unknown as EvidenceEntity[];
  }

  async findByUploader(userId: string): Promise<EvidenceEntity[]> {
    const items = await this.client.evidenceItem.findMany({
      where: { uploadedByUserId: userId },
    });
    return items as unknown as EvidenceEntity[];
  }

  async updateStatus(id: string, status: EvidenceEntity['status']): Promise<void> {
    await this.client.evidenceItem.update({
      where: { id },
      data: { status: this.mapStatus(status) },
    });
  }

  async linkToIncident(evidenceId: string, incidentId: string): Promise<void> {
    await this.client.evidenceItem.update({
      where: { id: evidenceId },
      data: { linkedIncidentId: incidentId },
    });
  }
}

// ── In-Memory Fallback Implementation for Isolated Testing ──────
export class MemoryEvidenceRepository implements IEvidenceRepository {
  private items = new Map<string, EvidenceEntity>();

  async findById(id: string): Promise<EvidenceEntity | null> {
    return this.items.get(id) || null;
  }

  async findAll(options?: FindAllOptions): Promise<EvidenceEntity[]> {
    let list = Array.from(this.items.values());
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (options?.offset) list = list.slice(options.offset);
    if (options?.limit) list = list.slice(0, options.limit);
    return list;
  }

  async create(data: Omit<EvidenceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvidenceEntity> {
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const item: EvidenceEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      status: (data.status || 'PENDING') as any,
    };
    this.items.set(id, item);
    return item;
  }

  async update(id: string, data: Partial<Omit<EvidenceEntity, 'id' | 'createdAt'>>): Promise<EvidenceEntity> {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`Evidence '${id}' not found`);
    const updated: EvidenceEntity = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async findByIncidentId(incidentId: string): Promise<EvidenceEntity[]> {
    return Array.from(this.items.values()).filter((i) => i.linkedIncidentId === incidentId);
  }

  async findByStatus(status: EvidenceEntity['status']): Promise<EvidenceEntity[]> {
    return Array.from(this.items.values()).filter((i) => i.status === status);
  }

  async findByFileType(fileType: EvidenceEntity['fileType']): Promise<EvidenceEntity[]> {
    return Array.from(this.items.values()).filter((i) => i.fileType === fileType);
  }

  async findByUploader(userId: string): Promise<EvidenceEntity[]> {
    return Array.from(this.items.values()).filter((i) => i.uploadedByUserId === userId);
  }

  async updateStatus(id: string, status: EvidenceEntity['status']): Promise<void> {
    const item = this.items.get(id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
    }
  }

  async linkToIncident(evidenceId: string, incidentId: string): Promise<void> {
    const item = this.items.get(evidenceId);
    if (item) {
      item.linkedIncidentId = incidentId;
      item.updatedAt = new Date();
    }
  }
}

export const memoryEvidenceRepository = new MemoryEvidenceRepository();
