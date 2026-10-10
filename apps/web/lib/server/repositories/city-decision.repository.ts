// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — City Decision Repository
// Supports Phase 7.9.4 & Phase 7.10 In-Memory Repositories
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionEntity,
  CityDecisionApprovalDto,
  CityDecisionAuditDto,
  CityDecisionHistoryDto,
} from '../domain/digital-twin/city-decision-fusion.domain';
import { logger } from '../logger';

export class MemoryCityDecisionRepository {
  private decisions: Map<string, any> = new Map();
  private auditEvents: Map<string, any[]> = new Map();
  private historyList: any[] = [];

  // ── Phase 7.9.4 Baseline Methods ──
  saveDecision(context: any): any {
    const id = context.id || context.pipelineExecutionId || `pipe-exec-${Date.now()}`;
    context.id = id;
    context.pipelineExecutionId = id;
    this.decisions.set(id, context);
    this.historyList.push(context);
    return context;
  }

  getDecision(id: string): any {
    return this.decisions.get(id) || null;
  }

  getDecisionById(id: string): any {
    return this.decisions.get(id) || null;
  }

  listDecisions(cityId?: string): any[] {
    if (!cityId) return this.historyList;
    return this.historyList.filter((d) => !d.cityId || d.cityId === cityId);
  }

  getHistory(): any[] {
    return this.historyList;
  }

  approveDecision(
    id: string,
    decisionStatus: string,
    operatorName?: string,
    operatorRole?: string,
    justification?: string,
    userId?: string
  ): any {
    const raw = String(decisionStatus).toUpperCase().trim();
    let validatedStatus: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW';
    if (raw === 'APPROVED') {
      validatedStatus = 'APPROVED';
    } else if (raw === 'REJECTED') {
      validatedStatus = 'REJECTED';
    } else if (raw === 'REQUEST_REVIEW' || raw === 'REQUESTED_REVIEW') {
      validatedStatus = 'REQUESTED_REVIEW';
    } else {
      throw new Error(`INVALID_DECISION_STATUS: '${decisionStatus}' is not a recognized decision state.`);
    }

    const existing = this.decisions.get(id) || { id, pipelineExecutionId: id, approvals: [] };
    existing.approvalStatus = validatedStatus;
    existing.status = validatedStatus;
    existing.operatorName = operatorName || 'Operator Alpha';
    existing.justification = justification || `Action '${validatedStatus}' recorded via Command Center`;
    this.decisions.set(id, existing);
    return existing;
  }

  // ── Phase 7.10 Methods ──
  async create(entity: CityDecisionEntity): Promise<CityDecisionEntity> {
    this.decisions.set(entity.id, entity);
    this.historyList.push(entity);
    logger.info(`[MemoryCityDecisionRepository] Saved decision entity '${entity.id}' for city '${entity.cityId}'`);
    return entity;
  }

  async getById(id: string): Promise<any | null> {
    return this.decisions.get(id) || null;
  }

  async listByCity(cityId: string): Promise<any[]> {
    return Array.from(this.decisions.values()).filter((d) => d.cityId === cityId);
  }

  async listAll(): Promise<any[]> {
    return Array.from(this.decisions.values());
  }

  async saveApproval(id: string, approval: any): Promise<any | null> {
    const raw = String(approval.decisionStatus || approval.status || '').toUpperCase().trim();
    let validatedStatus: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW' | 'EVALUATING';
    if (raw === 'APPROVED') {
      validatedStatus = 'APPROVED';
    } else if (raw === 'REJECTED') {
      validatedStatus = 'REJECTED';
    } else if (raw === 'REQUEST_REVIEW' || raw === 'REQUESTED_REVIEW') {
      validatedStatus = 'REQUESTED_REVIEW';
    } else if (raw === 'EVALUATING' || raw === 'PENDING') {
      validatedStatus = 'EVALUATING';
    } else {
      throw new Error(`INVALID_DECISION_STATUS: '${raw}' cannot be converted to a decision status.`);
    }

    const entity = this.decisions.get(id) || { id, approvals: [] };
    if (!entity.approvals) entity.approvals = [];
    entity.approvals.push(approval);
    entity.approvalStatus = validatedStatus;
    entity.status = validatedStatus;
    entity.updatedAt = new Date();

    this.decisions.set(id, entity);
    logger.info(`[MemoryCityDecisionRepository] Recorded approval for decision '${id}': ${validatedStatus}`);
    return entity;
  }

  async saveAuditEvent(event: CityDecisionAuditDto): Promise<void> {
    const logs = this.auditEvents.get(event.decisionId) || [];
    logs.push(event);
    this.auditEvents.set(event.decisionId, logs);
  }

  async getAuditHistory(decisionId: string): Promise<any> {
    const entity = await this.getById(decisionId);
    const logs = this.auditEvents.get(decisionId) || [];
    return {
      decisionId,
      status: entity?.status || 'EVALUATING',
      operatorName: entity?.approvals?.[0]?.operatorName || 'Operator Alpha',
      decisionStatus: entity?.approvals?.[0]?.decisionStatus || 'APPROVED',
      evaluatedAt: new Date().toISOString(),
      auditEvents: logs,
      totalEventCount: logs.length,
    };
  }
}

export const memoryCityDecisionRepository = new MemoryCityDecisionRepository();
export const cityDecisionRepository = memoryCityDecisionRepository;
