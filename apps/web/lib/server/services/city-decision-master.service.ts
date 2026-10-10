// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Master City Decision Fusion & Optimization Service
// Advisory Decision Support Engine
// Autonomous Execution Forbidden
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionEntity,
  CityDecisionInputDto,
  CityDecisionApprovalDto,
  CityDecisionStatus,
} from '../domain/digital-twin/city-decision-fusion.domain';
import { cityDecisionFusionService } from './city-decision-fusion.service';
import { cityDecisionCandidateService } from './city-decision-candidate.service';
import { cityDecisionConstraintService } from './city-decision-constraint.service';
import { cityDecisionResourceService } from './city-decision-resource.service';
import { cityDecisionImpactService } from './city-decision-impact.service';
import { cityDecisionOptimizationService } from './city-decision-optimization.service';
import { cityDecisionComparisonService } from './city-decision-comparison.service';
import { cityDecisionRecommendationService } from './city-decision-recommendation.service';
import { memoryCityDecisionRepository } from '../repositories/city-decision.repository';
import { logger } from '../logger';

export class CityDecisionService {
  async runDecisionPipeline(input: CityDecisionInputDto): Promise<CityDecisionEntity> {
    const id = `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cityId = input.cityId || 'city-vja';
    const mode = input.objectiveMode || 'BALANCED';

    // Step 1: Signal Fusion
    const signals = cityDecisionFusionService.fuseSignals(cityId);

    // Step 2: Candidate Generation
    const candidates = cityDecisionCandidateService.generateCandidates(signals);

    // Step 3: Constraint & Resource Evaluation
    const constraintsMap: any[] = [];
    const resources = cityDecisionResourceService.evaluateResources();

    const scoresMap = new Map();
    const impactsMap = new Map();

    const weights = cityDecisionOptimizationService.getObjectiveWeights(mode);

    candidates.forEach((c) => {
      const cEval = cityDecisionConstraintService.evaluateConstraints(c);
      constraintsMap.push(...cEval.constraints);
      c.feasibilityStatus = cEval.feasibilityStatus;

      const score = cityDecisionOptimizationService.scoreCandidate(c, weights);
      scoresMap.set(c.candidateId, score);

      const impact = cityDecisionImpactService.calculateImpact(c);
      impactsMap.set(c.candidateId, impact);
    });

    // Step 4: Comparison Matrix & Ranking
    const comparisons = cityDecisionComparisonService.buildComparisonMatrix(candidates, scoresMap);

    // Step 5: Explainable Recommendation Selection
    const recommendation = cityDecisionRecommendationService.generateRecommendation(comparisons, candidates, signals);

    const entity: CityDecisionEntity = {
      id,
      cityId,
      status: 'RECOMMENDED',
      signals,
      candidates,
      constraints: constraintsMap,
      resources,
      impacts: impactsMap,
      scores: scoresMap,
      comparisons,
      recommendation,
      approvals: [],
      auditLogs: [],
      requiresHumanApproval: true,
      dataSource: 'SIMULATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await memoryCityDecisionRepository.create(entity);
    await memoryCityDecisionRepository.saveAuditEvent({
      eventId: `evt-${Date.now()}`,
      decisionId: id,
      eventType: 'DECISION_CREATED',
      timestamp: new Date().toISOString(),
      metadata: { cityId, objectiveMode: mode, candidateCount: candidates.length },
    });

    logger.info(`[CityDecisionService] Successfully executed decision pipeline '${id}' for city '${cityId}'`);
    return entity;
  }

  async getDecisionById(id: string): Promise<CityDecisionEntity | null> {
    return await memoryCityDecisionRepository.getById(id);
  }

  async listDecisions(cityId: string = 'city-vja'): Promise<CityDecisionEntity[]> {
    return await memoryCityDecisionRepository.listByCity(cityId);
  }

  async approveDecision(
    id: string,
    operatorUserId: string,
    operatorName: string,
    decisionStatus: 'APPROVED' | 'REJECTED' | 'DEFERRED',
    notes: string
  ): Promise<CityDecisionEntity | null> {
    const approval: CityDecisionApprovalDto = {
      approvalId: `app-${Date.now()}`,
      decisionId: id,
      recommendationId: `rec-${id}`,
      operatorUserId,
      operatorName,
      operatorRole: 'Senior City Operations Commander',
      decisionStatus,
      notes,
      timestamp: new Date().toISOString(),
      requiresHumanApproval: true,
    };

    const updated = await memoryCityDecisionRepository.saveApproval(id, approval);
    if (updated) {
      const eventType = decisionStatus === 'APPROVED' ? 'APPROVED' : decisionStatus === 'REJECTED' ? 'REJECTED' : 'DEFERRED';
      await memoryCityDecisionRepository.saveAuditEvent({
        eventId: `evt-${Date.now()}`,
        decisionId: id,
        eventType,
        timestamp: new Date().toISOString(),
        userId: operatorUserId,
        metadata: { operatorName, notes },
      });
    }
    return updated;
  }
}

export const cityDecisionMasterService = new CityDecisionService();
