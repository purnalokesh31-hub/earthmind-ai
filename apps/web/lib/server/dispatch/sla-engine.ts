// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — SLA & Priority Deadlines Engine
// Calculates Deterministic Operational SLAs for Incidents & Dispatches
// ──────────────────────────────────────────────────────────────

import { DispatchPriorityType } from '../../domain/dispatch/dispatch.types';
import { SLA_POLICIES, SlaPolicyRule } from '../../domain/dispatch/dispatch-policy';
import { logger } from '../logger';

export interface SlaDeadlines {
  priority: DispatchPriorityType;
  assignedAt: Date;
  acknowledgementDeadline: Date;
  dispatchDeadline: Date;
  responseDeadline: Date;
  resolutionTarget: Date;
  escalationDeadline: Date;
  isAcknowledgementBreached: boolean;
  isResponseBreached: boolean;
}

export class SlaEngine {
  calculateDeadlines(priority: DispatchPriorityType, assignedAt: Date = new Date()): SlaDeadlines {
    const policy: SlaPolicyRule = SLA_POLICIES[priority] || SLA_POLICIES.MEDIUM;
    const baseTime = assignedAt.getTime();

    const acknowledgementDeadline = new Date(baseTime + policy.acknowledgementSlaMinutes * 60000);
    const dispatchDeadline = new Date(baseTime + policy.dispatchSlaMinutes * 60000);
    const responseDeadline = new Date(baseTime + policy.responseSlaMinutes * 60000);
    const resolutionTarget = new Date(baseTime + policy.resolutionTargetHours * 3600000);
    const escalationDeadline = new Date(baseTime + policy.autoEscalationTriggerMinutes * 60000);

    const now = Date.now();
    const isAcknowledgementBreached = now > acknowledgementDeadline.getTime();
    const isResponseBreached = now > responseDeadline.getTime();

    logger.info(`[SlaEngine] Calculated SLAs for priority ${priority}: Ack Deadline ${acknowledgementDeadline.toISOString()}`);

    return {
      priority,
      assignedAt,
      acknowledgementDeadline,
      dispatchDeadline,
      responseDeadline,
      resolutionTarget,
      escalationDeadline,
      isAcknowledgementBreached,
      isResponseBreached,
    };
  }
}

export const slaEngine = new SlaEngine();
