// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — User Repository Interface & Prisma Implementation
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'SUPERVISOR' | 'COMMANDER' | 'FIELD_OFFICER' | 'ANALYST' | 'CITIZEN';
  departmentId?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interface Contract ─────────────────────────────────────────
export interface IUserRepository extends IBaseRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByRole(role: UserEntity['role']): Promise<UserEntity[]>;
  findByDepartment(departmentId: string): Promise<UserEntity[]>;
  updateLastLogin(id: string, timestamp: Date): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<void>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    if (!user) return null;
    return user as unknown as UserEntity;
  }

  async findAll(options?: FindAllOptions): Promise<UserEntity[]> {
    const users = await this.client.user.findMany({
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
    return users as unknown as UserEntity[];
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const user = await this.client.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role as any,
        departmentId: data.departmentId,
        isActive: data.isActive,
      },
    });
    return user as unknown as UserEntity;
  }

  async update(id: string, data: Partial<Omit<UserEntity, 'id' | 'createdAt'>>): Promise<UserEntity> {
    const user = await this.client.user.update({
      where: { id },
      data: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.role ? { role: data.role as any } : {}),
        ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.lastLoginAt ? { lastLoginAt: data.lastLoginAt } : {}),
      },
    });
    return user as unknown as UserEntity;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.client.user.count();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { email } });
    if (!user) return null;
    return user as unknown as UserEntity;
  }

  async findByRole(role: UserEntity['role']): Promise<UserEntity[]> {
    const users = await this.client.user.findMany({ where: { role: role as any } });
    return users as unknown as UserEntity[];
  }

  async findByDepartment(departmentId: string): Promise<UserEntity[]> {
    const users = await this.client.user.findMany({ where: { departmentId } });
    return users as unknown as UserEntity[];
  }

  async updateLastLogin(id: string, timestamp: Date): Promise<void> {
    await this.client.user.update({
      where: { id },
      data: { lastLoginAt: timestamp },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.client.user.update({
      where: { id },
      data: { isActive },
    });
  }
}

// ── In-Memory Fallback Implementation for Testing & Offline Execution ──────
export class MemoryUserRepository implements IUserRepository {
  private users = new Map<string, UserEntity>();

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    const defaultUsers: UserEntity[] = [
      {
        id: 'usr-commander-42',
        email: 'commander@earthmind.test',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        fullName: 'Test Commander',
        role: 'COMMANDER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-test-officer',
        email: 'officer@earthmind.test',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        fullName: 'Test Field Officer',
        role: 'FIELD_OFFICER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    for (const u of defaultUsers) {
      this.users.set(u.id, u);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findByRole(role: UserEntity['role']): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  async findByDepartment(departmentId: string): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter((u) => u.departmentId === departmentId);
  }

  async updateLastLogin(id: string, timestamp: Date): Promise<void> {
    const u = this.users.get(id);
    if (u) u.lastLoginAt = timestamp;
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const u = this.users.get(id);
    if (u) u.isActive = isActive;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const user: UserEntity = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async update(id: string, data: Partial<Omit<UserEntity, 'id' | 'createdAt'>>): Promise<UserEntity> {
    const existing = this.users.get(id);
    if (!existing) throw new Error(`User '${id}' not found`);
    const updated: UserEntity = { ...existing, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }
}

export const memoryUserRepository = new MemoryUserRepository();
