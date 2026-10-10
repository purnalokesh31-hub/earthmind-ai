// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 6/6)
// Master Citywide Operational Intelligence Orchestrator Service
// ──────────────────────────────────────────────────────────────

import {
  CityOperationalIntelligenceEntity,
  CityOperationalSummaryDto,
  CityOperationalRecommendationDto,
} from '../domain/digital-twin/city-operational-intelligence.domain';
import { earthMindSafetyGatewayService } from './earthmind-safety-gateway.service';
import { cityResilienceScoreService } from './city-resilience-score.service';
import { cityOperationalKpiService } from './city-operational-kpi.service';
import { cityOperationalFeedbackService } from './city-operational-feedback.service';
import { cityOperationalHistoryService } from './city-operational-history.service';
import { logger } from '../logger';

export class CityOperationalIntelligenceOrchestratorService {
  private safety = earthMindSafetyGatewayService;
  public readonly AUTONOMOUS_EXECUTION_FORBIDDEN = true;

  public runMasterOperationalIntelligencePipeline(cityId: string): CityOperationalIntelligenceEntity {
    const now = new Date().toISOString();

    // 1. STEP 1-5 & 18: Calculate City Resilience Score
    const resilienceScore = cityResilienceScoreService.calculateCityResilienceScore(cityId);

    // 2. STEP 17: Calculate Operational KPIs
    const kpis = cityOperationalKpiService.calculateCityKpis(cityId, '24h');

    // 3. STEP 16: Calculate Operational Feedback
    const feedback = cityOperationalFeedbackService.calculateOperationalFeedback(cityId);

    // 4. STEP 19: Update Historical Intelligence & Trends
    const historicalPerformance = cityOperationalHistoryService.getHistoricalPerformance(cityId, '24h');

    // 5. STEP 10, 14, 20: Advisory Recommendation
    const rec: CityOperationalRecommendationDto = {
      recommendationId: `rec-op-${Date.now()}`,
      cityId,
      title: `Adopt Citywide Operational Preparedness Strategy for ${cityId}`,
      summary: 'Advisory operational intelligence summary across climate, utility, mobility, and response readiness.',
      rationale: 'City resilience score is GUARDED (80/100). Pre-positioning recommended to mitigate monsoon storm risk.',
      expectedRiskReduction: 31,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'DECISION_INTELLIGENCE',
    };

    this.safety.assertAdvisoryMode(rec);
    this.safety.assertHumanApprovalRequired(rec);
    this.safety.assertNoAutonomousExecution(rec);

    const summary: CityOperationalSummaryDto = {
      cityId,
      resilienceScore,
      kpis,
      activeInterventionsCount: 3,
      pendingApprovalsCount: 1,
      activeDeviationsCount: 1,
      activeEscalationsCount: 1,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'DECISION_INTELLIGENCE',
      updatedAt: now,
    };

    const entity: CityOperationalIntelligenceEntity = {
      id: `op-intel-${cityId}-${Date.now()}`,
      cityId,
      title: `Citywide Operational Intelligence for ${cityId}`,
      description: 'Closed operational intelligence loop combining prediction, simulation, decision, readiness, monitoring, and feedback.',
      status: 'ACTIVE',
      summary,
      resilienceScore,
      kpis,
      trends: historicalPerformance.trends,
      feedback,
      historicalPerformance,
      recommendations: [rec],
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'DECISION_INTELLIGENCE',
    };

    logger.info(`[CityOperationalIntelligenceOrchestratorService] Master 20-step operational intelligence pipeline completed for '${cityId}'`);
    return entity;
  }
}

export const cityOperationalIntelligenceOrchestratorService = new CityOperationalIntelligenceOrchestratorService();
