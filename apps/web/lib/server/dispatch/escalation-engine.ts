// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Automatic Escalation Engine
// Manages Level 0 to Level 4 Incident & Dispatch Escalation Chains
// ──────────────────────────────────────────────────────────────

import { DispatchEntity } from '../../domain/dispatch/dispatch.entity';
import { logger } from '../logger';

export type EscalationLevelName =
  | 'LEVEL_0_OFFICER'
  | 'LEVEL_1_SUPERVISOR'
  | 'LEVEL_2_CONTROL_ROOM'
  | 'LEVEL_3_EMERGENCY_OPS_CENTER'
  | 'LEVEL_4_MULTI_AGENCY_COORDINATION';

export interface EscalationRecord {
  escalationId: string;
  dispatchId: string;
  incidentId: string;
  previousLevel: number;
  newLevel: number;
  levelName: EscalationLevelName;
  triggerReason: string;
  escalatedAt: Date;
  targetRole: string;
}

export class EscalationEngine {
  evaluateEscalation(dispatch: DispatchEntity, reason: string): EscalationRecord {
    const previousLevel = dispatch.escalationLevel;
    const newLevel = Math.min(4, previousLevel + 1);

    const levelNames: Record<number, { name: EscalationLevelName; role: string }> = {
      0: { name: 'LEVEL_0_OFFICER', role: 'FIELD_OFFICER' },
      1: { name: 'LEVEL_1_SUPERVISOR', role: 'SUPERVISOR' },
      2: { name: 'LEVEL_2_CONTROL_ROOM', role: 'COMMANDER' },
      3: { name: 'LEVEL_3_EMERGENCY_OPS_CENTER', role: 'SYSTEM_ADMIN' },
      4: { name: 'LEVEL_4_MULTI_AGENCY_COORDINATION', role: 'SYSTEM_ADMIN' },
    };

    const targetInfo = levelNames[newLevel] || levelNames[4];

    dispatch.escalate(reason);

    const record: EscalationRecord = {
      escalationId: `esc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dispatchId: dispatch.id,
      incidentId: dispatch.incidentId,
      previousLevel,
      newLevel,
      levelName: targetInfo.name,
      triggerReason: reason,
      escalatedAt: new Date(),
      targetRole: targetInfo.role,
    };

    logger.warn(`[EscalationEngine] Escalated dispatch '${dispatch.id}' from L${previousLevel} to L${newLevel} (${targetInfo.name}): ${reason}`);

    return record;
  }
}

export const escalationEngine = new EscalationEngine();
