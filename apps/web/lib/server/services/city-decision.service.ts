// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Master City Decision Orchestrator Service
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionEntity,
  CityDecisionInputDto,
  CityDecisionOptionDto,
  CityDecisionComparisonDto,
  CityDecisionRecommendationDto,
  CityDecisionApprovalDto,
  CityDecisionAuditDto,
} from '../domain/digital-twin/city-decision.domain';
import { MemoryCityDecisionIntelligenceRepository } from '../repositories/city-decision-intelligence.repository';
import { cityDecisionOptionService } from './city-decision-option.service';
import { cityActionPriorityService } from './city-action-priority.service';
import { cityDecisionConfidenceService } from './city-decision-confidence.service';
import { cityDecisionComparisonService } from './city-decision-comparison.service';
import { cityDecisionRecommendationService } from './city-decision-recommendation.service';
import { cityDecisionExplanationService } from './city-decision-explanation.service';
import { cityMitigationCandidateService } from './city-mitigation-candidate.service';
import { logger } from '../logger';

export class CityDecisionService {
  private repo = new MemoryCityDecisionIntelligenceRepository();

  async createDecision(input: CityDecisionInputDto): Promise<CityDecisionEntity> {
    const scenarioId = `dec-scen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const entity: CityDecisionEntity = {
      scenarioId,
      cityId: input.cityId || 'city-vja',
      title: input.title,
      description: input.description || 'Predictive Decision Optimization Analysis',
      status: 'READY',
      input,
      signals: [
        { signalId: 'sig-1', domain: 'CLIMATE', name: 'Precipitation Intensity', currentValue: 65, thresholdValue: 40, unit: 'mm/hr', severity: 'CRITICAL', dataSource: 'SIMULATION' },
        { signalId: 'sig-2', domain: 'UTILITY', name: 'Substation Transformer Temp', currentValue: 98.4, thresholdValue: 85, unit: '°C', severity: 'HIGH', dataSource: 'SIMULATION' },
      ],
      candidates: [],
      impacts: [],
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.repo.create(entity as any);
  }

  async getDecision(scenarioId: string): Promise<CityDecisionEntity | null> {
    return (await this.repo.findById(scenarioId)) as any;
  }

  async getDecisionById(scenarioId: string): Promise<CityDecisionEntity | null> {
    return this.getDecision(scenarioId);
  }

  async runDecisionAnalysis(scenarioId: string): Promise<CityDecisionEntity> {
    const decision = await this.getDecision(scenarioId);
    if (!decision) {
      throw new Error(`Decision scenario '${scenarioId}' not found`);
    }

    const options = cityDecisionOptionService.generateOptions(scenarioId, decision.cityId);
    const ranked = cityActionPriorityService.rankOptions(options);
    const confidence = cityDecisionConfidenceService.calculateConfidence(scenarioId);

    const candidates = cityMitigationCandidateService.generateCandidates(scenarioId, decision.cityId);
    const topCand = candidates[0];

    const recommendation = cityDecisionRecommendationService.generateRecommendation(scenarioId, topCand, decision.input.constraints || []);
    const explanation = cityDecisionExplanationService.generateExplanation(recommendation.recommendationId, topCand, candidates, decision.input.constraints || []);

    decision.status = 'COMPLETED';
    decision.options = options;
    decision.confidence = confidence;
    decision.recommendation = recommendation as any;
    decision.explanation = explanation as any;
    decision.updatedAt = new Date();

    logger.info(`[CityDecisionService] Successfully executed decision optimization pipeline for '${scenarioId}'`);
    return decision;
  }

  async getOptions(scenarioId: string): Promise<CityDecisionOptionDto[]> {
    return cityDecisionOptionService.generateOptions(scenarioId, 'city-vja');
  }

  async getPriorityQueue(scenarioId: string): Promise<any[]> {
    const options = await this.getOptions(scenarioId);
    return cityActionPriorityService.rankOptions(options);
  }

  async getComparison(scenarioId: string): Promise<CityDecisionComparisonDto> {
    const candidates = cityMitigationCandidateService.generateCandidates(scenarioId, 'city-vja');
    const comp = cityDecisionComparisonService.compareCandidates(scenarioId, 'BALANCED', candidates);
    const options = cityDecisionOptionService.generateOptions(scenarioId, 'city-vja');

    return {
      scenarioId,
      noActionBaseline: {
        risk: 88.5,
        populationExposure: 34200,
        downtimeHours: 3.5,
        financialImpactUsd: 3200000,
        cascadeRisk: 42.0,
      },
      recommendedAction: {
        optionId: 'OPTION_A',
        risk: 51.2,
        populationExposure: 18400,
        downtimeHours: 1.8,
        financialImpactUsd: 1450000,
        cascadeRisk: 12.0,
      },
      improvement: {
        riskReductionPoints: 37.3,
        populationProtected: 15800,
        downtimeReductionHours: 1.7,
        financialSavingsUsd: 1750000,
        cascadeRiskReductionPoints: 30.0,
      },
      options,
      dataSource: 'SIMULATION',
    };
  }

  async getRecommendation(scenarioId: string): Promise<any> {
    const candidates = cityMitigationCandidateService.generateCandidates(scenarioId, 'city-vja');
    return cityDecisionRecommendationService.generateRecommendation(scenarioId, candidates[0], []);
  }

  async getExplanation(scenarioId: string): Promise<any> {
    const candidates = cityMitigationCandidateService.generateCandidates(scenarioId, 'city-vja');
    const rec = cityDecisionRecommendationService.generateRecommendation(scenarioId, candidates[0], []);
    return cityDecisionExplanationService.generateExplanation(rec.recommendationId, candidates[0], candidates, []);
  }

  async approveDecision(approval: CityDecisionApprovalDto): Promise<CityDecisionEntity> {
    const auditRecord = {
      approvalId: `appr-evt-${Date.now()}`,
      userId: approval.userId,
      timestamp: new Date(),
      decisionId: approval.decisionId,
      scenarioId: approval.decisionId,
      recommendationId: approval.recommendationId,
      status: approval.decisionStatus,
      operatorNotes: approval.operatorNotes,
    };

    const updated = await this.repo.saveApproval(approval.decisionId, auditRecord as any);
    logger.info(`[CityDecisionService] Recorded human operator authorization (${approval.decisionStatus}) for '${approval.decisionId}' by user '${approval.userId}'`);
    return updated as any;
  }

  async getHistory(cityId: string = 'city-vja'): Promise<CityDecisionEntity[]> {
    return (await this.repo.findByCity(cityId)) as any;
  }
}

export const cityDecisionService = new CityDecisionService();
