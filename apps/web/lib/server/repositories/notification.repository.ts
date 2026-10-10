// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Notification Repository Interface & Prisma Implementation
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../database/prisma';
import type { IBaseRepository, FindAllOptions } from './base.repository';

// ── Entity Shape ──────────────────────────────────────────────
export interface NotificationEntity {
  id: string;
  type: 'INCIDENT_DISPATCHED' | 'EVIDENCE_ANALYZED' | 'SYSTEM_ALERT' | 'ASSIGNMENT' | 'ESCALATION' | string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | string;
  isRead: boolean;
  recipientId?: string | null;
  recipientRole?: string | null;
  linkedEntityId?: string | null;
  linkedEntityType?: string | null;
  channelEmail: boolean;
  channelSms: boolean;
  channelPush: boolean;
  sentAt?: Date | null;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interface Contract ─────────────────────────────────────────
export interface INotificationRepository extends IBaseRepository<NotificationEntity> {
  findUnreadByUser(userId: string): Promise<NotificationEntity[]>;
  findByType(type: NotificationEntity['type']): Promise<NotificationEntity[]>;
  findByRecipientRole(role: string): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsReadForUser(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}

// ── Prisma Implementation ─────────────────────────────────────
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<NotificationEntity | null> {
    const item = await this.client.notification.findUnique({ where: { id } });
    if (!item) return null;
    return item as unknown as NotificationEntity;
  }

  async findAll(options?: FindAllOptions): Promise<NotificationEntity[]> {
    const items = await this.client.notification.findMany({
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as NotificationEntity[];
  }

  async create(data: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationEntity> {
    const item = await this.client.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity || 'info',
        isRead: data.isRead || false,
        recipientId: data.recipientId || undefined,
        recipientRole: data.recipientRole || undefined,
        linkedEntityId: data.linkedEntityId || undefined,
        linkedEntityType: data.linkedEntityType || undefined,
        channelEmail: data.channelEmail || false,
        channelSms: data.channelSms || false,
        channelPush: data.channelPush !== undefined ? data.channelPush : true,
        sentAt: data.sentAt || new Date(),
      },
    });
    return item as unknown as NotificationEntity;
  }

  async update(id: string, data: Partial<Omit<NotificationEntity, 'id' | 'createdAt'>>): Promise<NotificationEntity> {
    const item = await this.client.notification.update({
      where: { id },
      data: {
        ...(data.isRead !== undefined ? { isRead: data.isRead } : {}),
        ...(data.readAt ? { readAt: data.readAt } : {}),
      },
    });
    return item as unknown as NotificationEntity;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.notification.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.client.notification.count();
  }

  async findUnreadByUser(userId: string): Promise<NotificationEntity[]> {
    const items = await this.client.notification.findMany({
      where: { recipientId: userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as NotificationEntity[];
  }

  async findByType(type: NotificationEntity['type']): Promise<NotificationEntity[]> {
    const items = await this.client.notification.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as NotificationEntity[];
  }

  async findByRecipientRole(role: string): Promise<NotificationEntity[]> {
    const items = await this.client.notification.findMany({
      where: { recipientRole: role },
      orderBy: { createdAt: 'desc' },
    });
    return items as unknown as NotificationEntity[];
  }

  async markAsRead(id: string): Promise<void> {
    await this.client.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsReadForUser(userId: string): Promise<void> {
    await this.client.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.client.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }
}
