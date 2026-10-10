// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Response DTO Serialization
// ──────────────────────────────────────────────────────────────

import { DispatchEntityProps } from '../../domain/dispatch/dispatch.types';

export interface DispatchResponseDto {
  id: string;
  incidentId: string;
  assignedOfficerId: string | null;
  departmentId: string | null;
  priority: string;
  status: string;
  dispatchReason: string;
  assignedAt: string;
  acknowledgedAt: string | null;
  dispatchedAt: string | null;
  enRouteAt: string | null;
  onSceneAt: string | null;
  estimatedResponseTimeMinutes: number | null;
  actualResponseTimeMinutes: number | null;
  completedAt: string | null;
  escalationLevel: number;
  createdAt: string;
  updatedAt: string;
}

export function toDispatchResponseDto(entity: DispatchEntityProps): DispatchResponseDto {
  return {
    id: entity.id,
    incidentId: entity.incidentId,
    assignedOfficerId: entity.assignedOfficerId || null,
    departmentId: entity.departmentId || null,
    priority: entity.priority,
    status: entity.status,
    dispatchReason: entity.dispatchReason,
    assignedAt: entity.assignedAt ? entity.assignedAt.toISOString() : new Date().toISOString(),
    acknowledgedAt: entity.acknowledgedAt ? entity.acknowledgedAt.toISOString() : null,
    dispatchedAt: entity.dispatchedAt ? entity.dispatchedAt.toISOString() : null,
    enRouteAt: entity.enRouteAt ? entity.enRouteAt.toISOString() : null,
    onSceneAt: entity.onSceneAt ? entity.onSceneAt.toISOString() : null,
    estimatedResponseTimeMinutes: entity.estimatedResponseTime || null,
    actualResponseTimeMinutes: entity.actualResponseTime || null,
    completedAt: entity.completedAt ? entity.completedAt.toISOString() : null,
    escalationLevel: entity.escalationLevel,
    createdAt: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString(),
  };
}
