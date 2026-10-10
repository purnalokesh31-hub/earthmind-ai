// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Department Repository Interface & Prisma Implementation
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions, PaginatedResult } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface DepartmentEntity {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interface Contract ─────────────────────────────────────────
export interface IDepartmentRepository extends IBaseRepository<DepartmentEntity> {
  findByCode(code: string): Promise<DepartmentEntity | null>;
  findPaginated(page: number, pageSize: number, search?: string): Promise<PaginatedResult<DepartmentEntity>>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaDepartmentRepository implements IDepartmentRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<DepartmentEntity | null> {
    const dept = await this.client.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!dept) return null;
    return dept as unknown as DepartmentEntity;
  }

  async findByCode(code: string): Promise<DepartmentEntity | null> {
    const dept = await this.client.department.findFirst({
      where: { code, deletedAt: null },
    });
    if (!dept) return null;
    return dept as unknown as DepartmentEntity;
  }

  async findAll(options?: FindAllOptions): Promise<DepartmentEntity[]> {
    const orderField = options?.orderBy || 'createdAt';
    const orderDir = options?.orderDir || 'desc';

    const depts = await this.client.department.findMany({
      where: { deletedAt: null },
      take: options?.limit,
      skip: options?.offset,
      orderBy: { [orderField]: orderDir },
    });
    return depts as unknown as DepartmentEntity[];
  }

  async findPaginated(page: number, pageSize: number, search?: string): Promise<PaginatedResult<DepartmentEntity>> {
    const skip = (page - 1) * pageSize;
    const where: any = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.client.department.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.client.department.count({ where }),
    ]);

    return {
      data: data as unknown as DepartmentEntity[],
      total,
      page,
      pageSize,
    };
  }

  async create(data: Omit<DepartmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DepartmentEntity> {
    const dept = await this.client.department.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      },
    });
    return dept as unknown as DepartmentEntity;
  }

  async update(id: string, data: Partial<Omit<DepartmentEntity, 'id' | 'createdAt'>>): Promise<DepartmentEntity> {
    const dept = await this.client.department.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
    return dept as unknown as DepartmentEntity;
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Soft Delete
      await this.client.department.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.client.department.count({ where: { deletedAt: null } });
  }
}
