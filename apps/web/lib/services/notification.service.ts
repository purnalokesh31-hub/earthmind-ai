// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Notification Service
// ──────────────────────────────────────────────────────────────
// Three‑layer notification system:
//   Layer 1 — Toast (ephemeral, auto‑dismiss)
//   Layer 2 — Notification Center (persistent, grouped)
//   Layer 3 — Audit History (permanent, logged)
//
// Current: In‑memory + Zustand store
// Future: WebSocket / Push / Email / SMS
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type {
  Notification,
  NotificationEventType,
  NotificationPriorityGroup,
} from '../../types';

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const now = () => new Date().toISOString();
const store = () => useAppStore.getState();

// ── Toast auto‑dismiss default (ms) ──
const TOAST_DURATION = 5000;

// ──────────────────────────────────────────────────────────────
// Layer 1 — Toast Notifications
// ──────────────────────────────────────────────────────────────

export function toast(
  title: string,
  options?: {
    message?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  },
): string {
  const id = uid('toast');
  store().addToast({
    title,
    message: options?.message,
    type: options?.type ?? 'info',
  });

  // Auto‑dismiss
  const duration = options?.duration ?? TOAST_DURATION;
  if (duration > 0) {
    setTimeout(() => {
      store().removeToast(id);
    }, duration);
  }

  return id;
}

export function dismissToast(id: string): void {
  store().removeToast(id);
}

// ──────────────────────────────────────────────────────────────
// Layer 2 — Notification Center (Persistent)
// ──────────────────────────────────────────────────────────────

export async function push(data: {
  eventType: NotificationEventType;
  title: string;
  message: string;
  incidentId?: string;
  actor?: string;
  priorityGroup?: NotificationPriorityGroup;
  type?: 'critical' | 'warning' | 'info' | 'success';
}): Promise<Notification> {
  const notification: Notification = {
    id: uid('notif'),
    eventType: data.eventType,
    priorityGroup: data.priorityGroup ?? 'P4_INFO',
    title: data.title,
    message: data.message,
    timestamp: now(),
    status: 'unread',
    incidentId: data.incidentId,
    actor: data.actor,
    type: data.type ?? 'info',
  };

  store().addNotification(notification);

  return notification;
}

export async function markRead(id: string): Promise<void> {
  useAppStore.setState((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, status: 'read' as const } : n,
    ),
  }));
}

export async function markAllRead(): Promise<void> {
  useAppStore.setState((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, status: 'read' as const })),
  }));
}

export async function archiveNotification(id: string): Promise<void> {
  useAppStore.setState((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, status: 'archived' as const } : n,
    ),
  }));
}

export function getUnreadCount(): number {
  return store().notifications.filter((n) => n.status === 'unread').length;
}

export function getNotificationsByGroup(): Record<string, Notification[]> {
  const all = store().notifications.filter((n) => n.status !== 'archived');
  const groups: Record<string, Notification[]> = {
    Critical: [],
    Warning: [],
    Success: [],
    Information: [],
    System: [],
  };

  for (const n of all) {
    if (n.type === 'critical' || n.priorityGroup === 'P1_CRITICAL') groups.Critical.push(n);
    else if (n.type === 'warning' || n.priorityGroup === 'P2_HIGH') groups.Warning.push(n);
    else if (n.type === 'success') groups.Success.push(n);
    else if (n.eventType === 'field_update') groups.System.push(n);
    else groups.Information.push(n);
  }

  return groups;
}

// ──────────────────────────────────────────────────────────────
// Layer 3 — Audit History
// ──────────────────────────────────────────────────────────────
// Audit logging is handled by incident.service.ts → logAuditEvent
// which persists to the Zustand store (LocalStorage).
// This layer simply provides query helpers.

export async function getAuditHistory(filters?: {
  incidentId?: string;
  action?: string;
  actor?: string;
  limit?: number;
}): Promise<any[]> {
  const logs: any[] = (store() as any).auditLogs ?? [];
  let filtered = logs;
  if (filters?.incidentId) filtered = filtered.filter((l: any) => l.incidentId === filters.incidentId);
  if (filters?.action) filtered = filtered.filter((l: any) => l.action === filters.action);
  if (filters?.actor) filtered = filtered.filter((l: any) => l.actor === filters.actor);
  if (filters?.limit) filtered = filtered.slice(0, filters.limit);
  return filtered;
}

export function getAuditHistoryGroupedByDate(): Record<string, any[]> {
  const logs: any[] = (store() as any).auditLogs ?? [];
  const groups: Record<string, any[]> = {};

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const log of logs) {
    const logDate = new Date(log.timestamp);
    let label: string;

    if (logDate.toDateString() === today.toDateString()) label = 'Today';
    else if (logDate.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = logDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  }

  return groups;
}

// ──────────────────────────────────────────────────────────────
// Convenience: Combined dispatch for incident lifecycle events
// ──────────────────────────────────────────────────────────────

export async function notifyIncidentEvent(
  eventType: NotificationEventType,
  title: string,
  message: string,
  incidentId: string,
  severity?: 'critical' | 'warning' | 'info' | 'success',
): Promise<void> {
  const toastType = severity === 'critical' ? 'error' : severity ?? 'info';
  toast(title, { message, type: toastType });

  // Layer 2 — Notification Center
  await push({
    eventType,
    title,
    message,
    incidentId,
    type: severity,
    priorityGroup:
      severity === 'critical' ? 'P1_CRITICAL'
      : severity === 'warning' ? 'P2_HIGH'
      : 'P3_MEDIUM',
  });
}
