// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Audit & Notification DTOs
// ──────────────────────────────────────────────────────────────

// ── Audit Log Responses ────────────────────────────────────────

export interface AuditLogResponseDto {
  id: string;
  action: string;
  category: string;
  actorId: string;
  actorEmail?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  description: string;
  meta?: Record<string, any>;
  ipAddress?: string;
  traceId?: string;
  createdAt: string;
}

export interface AuditLogListResponseDto {
  logs: AuditLogResponseDto[];
  total: number;
}

// ── Notification Responses ─────────────────────────────────────

export interface NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  linkedEntityId?: string;
  linkedEntityType?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  total: number;
}

// ── Mappers ────────────────────────────────────────────────────

export function toAuditLogResponseDto(entity: any): AuditLogResponseDto {
  return {
    id: entity.id,
    action: entity.action,
    category: entity.category,
    actorId: entity.actorId,
    actorEmail: entity.actorEmail,
    actorRole: entity.actorRole,
    targetId: entity.targetId,
    targetType: entity.targetType,
    description: entity.description,
    meta: entity.meta,
    ipAddress: entity.ipAddress,
    traceId: entity.traceId,
    createdAt: entity.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function toNotificationResponseDto(entity: any): NotificationResponseDto {
  return {
    id: entity.id,
    type: entity.type,
    title: entity.title,
    message: entity.message,
    severity: entity.severity,
    isRead: entity.isRead,
    linkedEntityId: entity.linkedEntityId,
    linkedEntityType: entity.linkedEntityType,
    sentAt: entity.sentAt?.toISOString?.(),
    readAt: entity.readAt?.toISOString?.(),
    createdAt: entity.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
