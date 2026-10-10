// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Status State Machine & Transition Rules
// ──────────────────────────────────────────────────────────────

import { DispatchStatusType } from './dispatch.types';

export const VALID_DISPATCH_TRANSITIONS: Record<DispatchStatusType, DispatchStatusType[]> = {
  PENDING: ['QUEUED', 'ASSIGNED', 'DISPATCHED', 'CANCELLED'],
  QUEUED: ['ASSIGNED', 'DISPATCHED', 'CANCELLED'],
  ASSIGNED: ['DISPATCHED', 'ACKNOWLEDGED', 'ESCALATED', 'REASSIGNED' as unknown as DispatchStatusType, 'CANCELLED'],
  DISPATCHED: ['ACKNOWLEDGED', 'EN_ROUTE', 'ESCALATED', 'FAILED', 'CANCELLED'],
  ACKNOWLEDGED: ['EN_ROUTE', 'ON_SCENE', 'ESCALATED', 'CANCELLED'],
  EN_ROUTE: ['ON_SCENE', 'INVESTIGATING', 'ESCALATED', 'FAILED', 'CANCELLED'],
  ON_SCENE: ['INVESTIGATING', 'RESOLVED', 'ESCALATED', 'FAILED'],
  INVESTIGATING: ['RESOLVED', 'ESCALATED', 'FAILED'],
  RESOLVED: ['CLOSED' as unknown as DispatchStatusType],
  FAILED: ['QUEUED', 'ASSIGNED', 'ESCALATED', 'CANCELLED'],
  ESCALATED: ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'CANCELLED', 'RESOLVED'],
  CANCELLED: [],
};

export function isValidDispatchStatusTransition(
  currentStatus: DispatchStatusType,
  nextStatus: DispatchStatusType
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_DISPATCH_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}
