// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Autonomous Dispatch Workflow Orchestrator
// Idempotent Execution Pipeline across Intake, Risk, Assignment, & Dispatch
// ──────────────────────────────────────────────────────────────

import { assignmentEngine, OfficerCandidate } from './assignment-engine';
import { slaEngine } from './sla-engine';
import { escalationEngine } from './escalation-engine';
import { DispatchEntity } from '../../domain/dispatch/dispatch.entity';
import { DispatchPriorityType } from '../../domain/dispatch/dispatch.types';
import { logger } from '../logger';

export interface DispatchOrchestrationResult {
  dispatchId: string;
  incidentId: string;
  status: string;
  assignedOfficerId: string | null;
  departmentId: string | null;
  priority: DispatchPriorityType;
  assignmentScore: number;
  reasons: string[];
  estimatedResponseMinutes: number;
  acknowledgementDeadline: Date;
  idempotencyKey: string;
  isDuplicate: boolean;
}

export class DispatchOrchestrator {
  private processedKeys: Set<string> = new Set();
  private dispatchCache: Map<string, DispatchOrchestrationResult> = new Map();

  async processAutonomousDispatch(
    incidentId: string,
    category: string,
    severity: DispatchPriorityType,
    lat: number,
    lng: number,
    departmentId?: string,
    candidates: OfficerCandidate[] = [],
    idempotencyKey?: string
  ): Promise<DispatchOrchestrationResult> {
    const key = idempotencyKey || `disp-key-${incidentId}`;

    // Idempotency Check
    if (this.processedKeys.has(key) && this.dispatchCache.has(key)) {
      logger.info(`[DispatchOrchestrator] Duplicate dispatch request blocked via idempotency key '${key}'`);
      const existing = this.dispatchCache.get(key)!;
      return { ...existing, isDuplicate: true };
    }

    // 1. Assignment Recommendation
    const recommendation = assignmentEngine.recommendBestResponder(
      { incidentId, category, severity, latitude: lat, longitude: lng, departmentId },
      candidates
    );

    const officerId = recommendation ? recommendation.officerId : null;
    const targetDeptId = recommendation ? recommendation.departmentId : (departmentId || null);
    const score = recommendation ? recommendation.score : 0;
    const reasons = recommendation ? recommendation.reasons : ['Default queue routing'];
    const estMinutes = recommendation ? recommendation.estimatedResponseMinutes : 30;

    // 2. SLA Deadlines
    const sla = slaEngine.calculateDeadlines(severity);

    // 3. Create Dispatch Entity
    const dispatchId = `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const entity = new DispatchEntity({
      id: dispatchId,
      incidentId,
      assignedOfficerId: officerId,
      departmentId: targetDeptId,
      priority: severity,
      status: officerId ? 'ASSIGNED' : 'QUEUED',
      dispatchReason: `Autonomous AI dispatch based on ${severity} severity and score ${score}/100`,
      assignedAt: new Date(),
      estimatedResponseTime: estMinutes,
      escalationLevel: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (officerId) {
      entity.dispatch();
    }

    const result: DispatchOrchestrationResult = {
      dispatchId: entity.id,
      incidentId: entity.incidentId,
      status: entity.status,
      assignedOfficerId: entity.assignedOfficerId || null,
      departmentId: entity.departmentId || null,
      priority: entity.priority,
      assignmentScore: score,
      reasons,
      estimatedResponseMinutes: estMinutes,
      acknowledgementDeadline: sla.acknowledgementDeadline,
      idempotencyKey: key,
      isDuplicate: false,
    };

    // Cache idempotency key
    this.processedKeys.add(key);
    this.dispatchCache.set(key, result);

    logger.info(`[DispatchOrchestrator] Dispatched incident '${incidentId}' -> Dispatch '${dispatchId}' (Status: ${entity.status})`);

    return result;
  }
}

export const dispatchOrchestrator = new DispatchOrchestrator();
