// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 In-Memory Resilience Orchestration Repository
// ──────────────────────────────────────────────────────────────

import {
  ResilienceOrchestrationEntity,
  ResilienceStateDto,
  ResilienceApprovalDto,
  ResilienceOutcomeDto,
  OrchestrationLifecycleStatus,
} from '../domain/digital-twin/resilience-orchestration.domain';
import { logger } from '../logger';

export class MemoryResilienceOrchestrationRepository {
  private orchestrations: Map<string, ResilienceOrchestrationEntity> = new Map();
  private stateHistory: Map<string, ResilienceStateDto[]> = new Map();
  private approvalHistory: Map<string, ResilienceApprovalDto[]> = new Map();
  private outcomeHistory: Map<string, ResilienceOutcomeDto[]> = new Map();

  async create(entity: ResilienceOrchestrationEntity): Promise<ResilienceOrchestrationEntity> {
    this.orchestrations.set(entity.id, entity);

    const states = this.stateHistory.get(entity.id) || [];
    states.push(entity.resilienceState);
    this.stateHistory.set(entity.id, states);

    logger.info(`[MemoryResilienceOrchestrationRepository] Created orchestration entity '${entity.id}' for city '${entity.cityId}'`);
    return entity;
  }

  async getById(id: string): Promise<ResilienceOrchestrationEntity | null> {
    return this.orchestrations.get(id) || null;
  }

  async findById(id: string): Promise<ResilienceOrchestrationEntity | null> {
    return this.getById(id);
  }

  async listByCity(cityId: string): Promise<ResilienceOrchestrationEntity[]> {
    return Array.from(this.orchestrations.values()).filter((o) => o.cityId === cityId);
  }

  async listAll(): Promise<ResilienceOrchestrationEntity[]> {
    return Array.from(this.orchestrations.values());
  }

  async updateStatus(id: string, newStatus: OrchestrationLifecycleStatus): Promise<ResilienceOrchestrationEntity | null> {
    const entity = this.orchestrations.get(id);
    if (!entity) return null;

    entity.status = newStatus;
    entity.updatedAt = new Date();
    this.orchestrations.set(id, entity);
    logger.info(`[MemoryResilienceOrchestrationRepository] Updated status of '${id}' to '${newStatus}'`);
    return entity;
  }

  async saveApproval(id: string, approval: ResilienceApprovalDto): Promise<ResilienceOrchestrationEntity | null> {
    const entity = this.orchestrations.get(id);
    if (!entity) return null;

    entity.approvals.push(approval);
    entity.status = approval.decisionStatus === 'APPROVED' ? 'APPROVED' : 'CANCELLED';
    entity.updatedAt = new Date();

    const history = this.approvalHistory.get(id) || [];
    history.push(approval);
    this.approvalHistory.set(id, history);

    this.orchestrations.set(id, entity);
    return entity;
  }

  async saveOutcome(id: string, outcome: ResilienceOutcomeDto): Promise<ResilienceOrchestrationEntity | null> {
    const entity = this.orchestrations.get(id);
    if (!entity) return null;

    entity.outcomes.push(outcome);
    entity.status = outcome.executionStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
    entity.updatedAt = new Date();

    const history = this.outcomeHistory.get(id) || [];
    history.push(outcome);
    this.outcomeHistory.set(id, history);

    this.orchestrations.set(id, entity);
    return entity;
  }

  async archive(id: string): Promise<boolean> {
    const entity = this.orchestrations.get(id);
    if (!entity) return false;

    entity.status = 'ARCHIVED';
    entity.updatedAt = new Date();
    this.orchestrations.set(id, entity);
    return true;
  }

  async getStateHistory(id: string): Promise<ResilienceStateDto[]> {
    return this.stateHistory.get(id) || [];
  }

  async getApprovalHistory(id: string): Promise<ResilienceApprovalDto[]> {
    return this.approvalHistory.get(id) || [];
  }

  async getOutcomeHistory(id: string): Promise<ResilienceOutcomeDto[]> {
    return this.outcomeHistory.get(id) || [];
  }
}

export const resilienceOrchestrationRepository = new MemoryResilienceOrchestrationRepository();
