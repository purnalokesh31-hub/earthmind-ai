// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dispatch Policy Rules & Threshold Constants
// ──────────────────────────────────────────────────────────────

import { DispatchPriorityType } from './dispatch.types';

export interface SlaPolicyRule {
  acknowledgementSlaMinutes: number;
  dispatchSlaMinutes: number;
  responseSlaMinutes: number;
  resolutionTargetHours: number;
  autoEscalationTriggerMinutes: number;
}

export const SLA_POLICIES: Record<DispatchPriorityType, SlaPolicyRule> = {
  CRITICAL: {
    acknowledgementSlaMinutes: 15,
    dispatchSlaMinutes: 5,
    responseSlaMinutes: 120, // 2 hours
    resolutionTargetHours: 6,
    autoEscalationTriggerMinutes: 15,
  },
  HIGH: {
    acknowledgementSlaMinutes: 30,
    dispatchSlaMinutes: 15,
    responseSlaMinutes: 240, // 4 hours
    resolutionTargetHours: 12,
    autoEscalationTriggerMinutes: 30,
  },
  MEDIUM: {
    acknowledgementSlaMinutes: 120,
    dispatchSlaMinutes: 60,
    responseSlaMinutes: 720, // 12 hours
    resolutionTargetHours: 24,
    autoEscalationTriggerMinutes: 120,
  },
  LOW: {
    acknowledgementSlaMinutes: 240,
    dispatchSlaMinutes: 120,
    responseSlaMinutes: 1440, // 24 hours
    resolutionTargetHours: 48,
    autoEscalationTriggerMinutes: 240,
  },
};

export class DispatchPolicy {
  static getSlaRule(priority: DispatchPriorityType): SlaPolicyRule {
    return SLA_POLICIES[priority] || SLA_POLICIES.MEDIUM;
  }

  static isAcknowledgementBreached(assignedAt: Date, priority: DispatchPriorityType): boolean {
    const rule = this.getSlaRule(priority);
    const elapsedMinutes = (Date.now() - assignedAt.getTime()) / 60000;
    return elapsedMinutes > rule.acknowledgementSlaMinutes;
  }
}
