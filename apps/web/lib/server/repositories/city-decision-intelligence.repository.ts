// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Repository: City Decision Intelligence Repository
// In-memory deterministic storage for Phase 7.9.4 citywide decision intelligence & mitigation optimization
// Safety Guarantee: Read-only decision support persistence; never executes physical municipal operations
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionScenarioEntity,
  MitigationCandidateDto,
  DecisionRecommendationDto,
  DecisionApprovalAuditDto,
} from '../domain/digital-twin/city-decision-intelligence.domain';
import { logger } from '../logger';

export class MemoryCityDecisionIntelligenceRepository {
  private scenarios = new Map<string, CityDecisionScenarioEntity>();

  async create(entity: CityDecisionScenarioEntity): Promise<CityDecisionScenarioEntity> {
    if (!entity.scenarioId) {
      throw new Error('scenarioId is required to save a decision scenario');
    }
    const record: CityDecisionScenarioEntity = {
      ...entity,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.scenarios.set(record.scenarioId, record);
    logger.info(`[MemoryCityDecisionIntelligenceRepository] Created decision scenario '${record.scenarioId}' for city '${record.cityId}'`);
    return { ...record };
  }

  async getById(id: string): Promise<CityDecisionScenarioEntity | null> {
    const record = this.scenarios.get(id);
    if (!record) return null;
    return { ...record };
  }

  async findById(id: string): Promise<CityDecisionScenarioEntity | null> {
    return this.getById(id);
  }

  async saveDecision(entity: any): Promise<any> {
    return this.create(entity as CityDecisionScenarioEntity);
  }

  async findByCity(cityId: string): Promise<CityDecisionScenarioEntity[]> {
    return this.list(cityId);
  }

  async list(cityId?: string): Promise<CityDecisionScenarioEntity[]> {
    const all = Array.from(this.scenarios.values());
    if (!cityId) return all.map((item) => ({ ...item }));
    return all.filter((item) => item.cityId === cityId).map((item) => ({ ...item }));
  }

  async update(id: string, updates: Partial<CityDecisionScenarioEntity>): Promise<CityDecisionScenarioEntity> {
    const existing = this.scenarios.get(id);
    if (!existing) {
      throw new Error(`Decision scenario with ID '${id}' not found`);
    }

    const updated: CityDecisionScenarioEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.scenarios.set(id, updated);
    logger.info(`[MemoryCityDecisionIntelligenceRepository] Updated decision scenario '${id}' to status '${updated.status}'`);
    return { ...updated };
  }

  async saveCandidates(scenarioId: string, candidates: MitigationCandidateDto[]): Promise<CityDecisionScenarioEntity> {
    const existing = this.scenarios.get(scenarioId);
    if (!existing) {
      throw new Error(`Decision scenario with ID '${scenarioId}' not found`);
    }

    const safeCandidates = candidates.map((c) => ({
      ...c,
      dataSource: 'SIMULATION' as const,
      requiresHumanApproval: true as const,
    }));

    const updated: CityDecisionScenarioEntity = {
      ...existing,
      candidates: safeCandidates,
      updatedAt: new Date(),
    };

    this.scenarios.set(scenarioId, updated);
    return { ...updated };
  }

  async saveRecommendation(scenarioId: string, recommendation: DecisionRecommendationDto): Promise<CityDecisionScenarioEntity> {
    const existing = this.scenarios.get(scenarioId);
    if (!existing) {
      throw new Error(`Decision scenario with ID '${scenarioId}' not found`);
    }

    const safeRec: DecisionRecommendationDto = {
      ...recommendation,
      requiresHumanApproval: true as const,
    };

    const updated: CityDecisionScenarioEntity = {
      ...existing,
      status: 'COMPLETED',
      recommendation: safeRec,
      updatedAt: new Date(),
    };

    this.scenarios.set(scenarioId, updated);
    logger.info(`[MemoryCityDecisionIntelligenceRepository] Saved recommendation '${recommendation.recommendationId}' for scenario '${scenarioId}'`);
    return { ...updated };
  }

  async saveApproval(scenarioId: string, approval: DecisionApprovalAuditDto): Promise<CityDecisionScenarioEntity> {
    const existing = this.scenarios.get(scenarioId);
    if (!existing) {
      throw new Error(`Decision scenario with ID '${scenarioId}' not found`);
    }

    const raw = String(approval.status || '').toUpperCase().trim();
    let newStatus: 'APPROVED' | 'REJECTED' | 'ARCHIVED';
    if (raw === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (raw === 'REJECTED') {
      newStatus = 'REJECTED';
    } else if (raw === 'REQUEST_REVIEW' || raw === 'REQUESTED_REVIEW') {
      newStatus = 'ARCHIVED';
    } else {
      throw new Error(`INVALID_DECISION_STATUS: '${approval.status}' is not a recognized decision status.`);
    }

    const updated: CityDecisionScenarioEntity = {
      ...existing,
      status: newStatus,
      approvalAudit: { ...approval, status: newStatus as any },
      updatedAt: new Date(),
    };

    this.scenarios.set(scenarioId, updated);
    logger.info(`[MemoryCityDecisionIntelligenceRepository] Recorded operator approval decision '${approval.status}' for scenario '${scenarioId}' by user '${approval.userId}'`);
    return { ...updated };
  }

  async getHistory(cityId?: string): Promise<CityDecisionScenarioEntity[]> {
    const all = await this.list(cityId);
    return all.filter((item) => ['COMPLETED', 'APPROVED', 'REJECTED', 'ARCHIVED'].includes(item.status));
  }

  clear(): void {
    this.scenarios.clear();
  }
}

export const cityDecisionIntelligenceRepository = new MemoryCityDecisionIntelligenceRepository();
