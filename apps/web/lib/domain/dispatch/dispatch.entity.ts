// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Domain Entity
// DDD Entity enforcing business rules & valid status state transitions
// ──────────────────────────────────────────────────────────────

import { DispatchEntityProps, DispatchStatusType, StateTransitionResult } from './dispatch.types';
import { isValidDispatchStatusTransition } from './dispatch-status';

export class DispatchEntity {
  private props: DispatchEntityProps;

  constructor(props: DispatchEntityProps) {
    this.props = { ...props };
  }

  get id(): string { return this.props.id; }
  get incidentId(): string { return this.props.incidentId; }
  get assignedOfficerId(): string | null | undefined { return this.props.assignedOfficerId; }
  get departmentId(): string | null | undefined { return this.props.departmentId; }
  get priority(): DispatchEntityProps['priority'] { return this.props.priority; }
  get status(): DispatchStatusType { return this.props.status; }
  get dispatchReason(): string { return this.props.dispatchReason; }
  get assignedAt(): Date { return this.props.assignedAt; }
  get acknowledgedAt(): Date | null | undefined { return this.props.acknowledgedAt; }
  get dispatchedAt(): Date | null | undefined { return this.props.dispatchedAt; }
  get enRouteAt(): Date | null | undefined { return this.props.enRouteAt; }
  get onSceneAt(): Date | null | undefined { return this.props.onSceneAt; }
  get estimatedResponseTime(): number | null | undefined { return this.props.estimatedResponseTime; }
  get actualResponseTime(): number | null | undefined { return this.props.actualResponseTime; }
  get completedAt(): Date | null | undefined { return this.props.completedAt; }
  get escalationLevel(): number { return this.props.escalationLevel; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  private transitionTo(newStatus: DispatchStatusType): StateTransitionResult {
    const previousStatus = this.props.status;
    if (!isValidDispatchStatusTransition(previousStatus, newStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus,
        error: `Illegal dispatch state transition from '${previousStatus}' to '${newStatus}'`,
      };
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
    return { success: true, previousStatus, newStatus };
  }

  assignOfficer(officerId: string, departmentId?: string): StateTransitionResult {
    this.props.assignedOfficerId = officerId;
    if (departmentId) this.props.departmentId = departmentId;
    return this.transitionTo('ASSIGNED');
  }

  dispatch(): StateTransitionResult {
    this.props.dispatchedAt = new Date();
    return this.transitionTo('DISPATCHED');
  }

  acknowledge(): StateTransitionResult {
    this.props.acknowledgedAt = new Date();
    return this.transitionTo('ACKNOWLEDGED');
  }

  markEnRoute(): StateTransitionResult {
    this.props.enRouteAt = new Date();
    return this.transitionTo('EN_ROUTE');
  }

  markOnScene(): StateTransitionResult {
    this.props.onSceneAt = new Date();
    // Compute actual response time in minutes if assignedAt exists
    if (this.props.assignedAt) {
      const diffMs = Date.now() - this.props.assignedAt.getTime();
      this.props.actualResponseTime = Math.round(diffMs / 60000);
    }
    return this.transitionTo('ON_SCENE');
  }

  investigate(): StateTransitionResult {
    return this.transitionTo('INVESTIGATING');
  }

  resolve(): StateTransitionResult {
    this.props.completedAt = new Date();
    return this.transitionTo('RESOLVED');
  }

  escalate(reason?: string): StateTransitionResult {
    this.props.escalationLevel += 1;
    if (reason) {
      this.props.dispatchReason = `${this.props.dispatchReason} [ESCALATED L${this.props.escalationLevel}: ${reason}]`;
    }
    return this.transitionTo('ESCALATED');
  }

  reassign(newOfficerId: string, reason?: string): StateTransitionResult {
    this.props.assignedOfficerId = newOfficerId;
    if (reason) {
      this.props.dispatchReason = `${this.props.dispatchReason} [REASSIGNED: ${reason}]`;
    }
    return this.transitionTo('ASSIGNED');
  }

  cancel(): StateTransitionResult {
    return this.transitionTo('CANCELLED');
  }

  toProps(): DispatchEntityProps {
    return { ...this.props };
  }
}
