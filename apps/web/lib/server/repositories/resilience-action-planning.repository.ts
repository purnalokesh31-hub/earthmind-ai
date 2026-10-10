// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 In-Memory Resilience Action Planning Repository
// ──────────────────────────────────────────────────────────────

import {
  ResilienceActionPlanEntity,
  ResilienceActionCandidateDto,
  ResilienceActionDependencyDto,
  ResilienceActionConflictDto,
  ResilienceActionSequenceDto,
  ResilienceActionPlanComparisonDto,
  ResilienceActionRecommendationDto,
  ResilienceActionAuditDto,
} from '../domain/digital-twin/resilience-action-planning.domain';
import { logger } from '../logger';

export class MemoryResilienceActionPlanningRepository {
  private plans: Map<string, ResilienceActionPlanEntity> = new Map();
  private auditEvents: Map<string, ResilienceActionAuditDto[]> = new Map();

  async createPlan(entity: ResilienceActionPlanEntity): Promise<ResilienceActionPlanEntity> {
    this.plans.set(entity.id, entity);
    logger.info(`[MemoryResilienceActionPlanningRepository] Created action plan '${entity.id}' for orchestration '${entity.orchestrationId}'`);
    return entity;
  }

  async getPlanById(id: string): Promise<ResilienceActionPlanEntity | null> {
    return this.plans.get(id) || null;
  }

  async listPlansByOrchestration(orchestrationId: string): Promise<ResilienceActionPlanEntity[]> {
    return Array.from(this.plans.values()).filter((p) => p.orchestrationId === orchestrationId);
  }

  async listAllPlans(): Promise<ResilienceActionPlanEntity[]> {
    return Array.from(this.plans.values());
  }

  async saveAuditEvent(event: ResilienceActionAuditDto): Promise<void> {
    const history = this.auditEvents.get(event.orchestrationId) || [];
    history.push(event);
    this.auditEvents.set(event.orchestrationId, history);
  }

  async getAuditEvents(orchestrationId: string): Promise<ResilienceActionAuditDto[]> {
    return this.auditEvents.get(orchestrationId) || [];
  }
}

export const resilienceActionPlanningRepository = new MemoryResilienceActionPlanningRepository();
