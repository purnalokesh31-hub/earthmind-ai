// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Utility Functions
// ──────────────────────────────────────────────────────────────

import type { Severity, IncidentStatus } from '../types';

export function cn(...classes: any[]): string {
  return classes.filter(Boolean).join(' ');
}

export function severityBadgeClass(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'badge-critical';
    case 'high':     return 'badge-high';
    case 'medium':   return 'badge-medium';
    case 'low':      return 'badge-low';
  }
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high':     return '#f97316';
    case 'medium':   return '#f59e0b';
    case 'low':      return '#10b981';
  }
}

export function statusDotClass(status: IncidentStatus): string {
  switch (status) {
    case 'reported':
    case 'evidence_collection':
    case 'ai_processing':
    case 'created':
    case 'analyzing' as any:
    case 'classified' as any: return 'status-dot-pending';
    case 'verified':
    case 'assigned':
    case 'investigating':
    case 'in_progress' as any: return 'status-dot-active';
    case 'resolved':
    case 'archived': return 'status-dot-resolved';
    default: return 'status-dot-pending';
  }
}

export function statusLabel(status: IncidentStatus): string {
  switch (status) {
    case 'reported':            return 'Reported';
    case 'evidence_collection': return 'Evidence Collection';
    case 'ai_processing':       return 'AI Processing';
    case 'created':             return 'Created';
    case 'verified':            return 'Verified';
    case 'assigned':            return 'Assigned';
    case 'investigating':       return 'Investigating';
    case 'resolved':            return 'Resolved';
    case 'archived':            return 'Archived';
    default: return String(status).replace('_', ' ').toUpperCase();
  }
}

export function categoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}
