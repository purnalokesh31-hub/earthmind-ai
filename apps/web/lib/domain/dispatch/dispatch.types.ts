// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Domain Types & Interfaces
// ──────────────────────────────────────────────────────────────

export type DispatchStatusType =
  | 'PENDING'
  | 'QUEUED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'ACKNOWLEDGED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'FAILED'
  | 'ESCALATED'
  | 'CANCELLED';

export type DispatchPriorityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DispatchEntityProps {
  id: string;
  incidentId: string;
  assignedOfficerId?: string | null;
  departmentId?: string | null;
  priority: DispatchPriorityType;
  status: DispatchStatusType;
  dispatchReason: string;
  assignedAt: Date;
  acknowledgedAt?: Date | null;
  dispatchedAt?: Date | null;
  enRouteAt?: Date | null;
  onSceneAt?: Date | null;
  estimatedResponseTime?: number | null; // in minutes
  actualResponseTime?: number | null;    // in minutes
  completedAt?: Date | null;
  escalationLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StateTransitionResult {
  success: boolean;
  previousStatus: DispatchStatusType;
  newStatus: DispatchStatusType;
  error?: string;
}
