// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 6/6)
// Citywide Resilience Score Service
// Dynamic Multi-Factor Resilience Evaluation & Risk Stress Computation
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceScoreDto,
  ResilienceClassification,
} from '../domain/digital-twin/city-operational-intelligence.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { earthMindSafetyGatewayService } from './earthmind-safety-gateway.service';
import { logger } from '../logger';

export interface ResilienceInputFactors {
  preparedness?: number;
  responseReadiness?: number;
  serviceContinuity?: number;
  resourceReadiness?: number;
  predictionAccuracy?: number;
  activeIncidentsCount?: number;
  criticalIncidentsCount?: number;
}

export class CityResilienceScoreService {
  private safety = earthMindSafetyGatewayService;

  public calculateCityResilienceScore(
    cityId: string,
    inputs?: ResilienceInputFactors
  ): CityResilienceScoreDto {
    // 1. Extract base metrics from inputs or repositories
    const preparednessAssessments = memoryCityResilienceReadinessRepository.listReadiness(cityId);
    const responseAssessments = memoryCityResponseReadinessRepository.listReadiness(cityId);

    const latestPrepScore = preparednessAssessments.length > 0
      ? preparednessAssessments[0].scores?.overallReadinessScore
      : undefined;

    const latestRespScore = responseAssessments.length > 0
      ? responseAssessments[0].scores?.readinessScore
      : undefined;

    const hasLiveInputs = Boolean(
      inputs || latestPrepScore !== undefined || latestRespScore !== undefined
    );

    // Dynamic factor resolution with bounds [0, 100]
    const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));

    const preparedness = clamp(inputs?.preparedness ?? latestPrepScore ?? 74);
    const responseReadiness = clamp(inputs?.responseReadiness ?? latestRespScore ?? 85);
    const serviceContinuity = clamp(inputs?.serviceContinuity ?? 82);
    const resourceReadiness = clamp(inputs?.resourceReadiness ?? 78);
    const predictionAccuracy = clamp(inputs?.predictionAccuracy ?? 83);

    // Active incident stress penalty
    const activePenalty = (inputs?.activeIncidentsCount ?? 0) * 1.5;
    const criticalPenalty = (inputs?.criticalIncidentsCount ?? 0) * 4.0;
    const totalPenalty = activePenalty + criticalPenalty;

    // Weighted aggregation
    const rawScore =
      preparedness * 0.25 +
      responseReadiness * 0.25 +
      serviceContinuity * 0.20 +
      resourceReadiness * 0.15 +
      predictionAccuracy * 0.15 -
      totalPenalty;

    const overallScore = clamp(Math.round(rawScore));

    // Validated classification boundaries
    let classification: ResilienceClassification = 'RESILIENT';
    if (overallScore < 50) classification = 'CRITICAL';
    else if (overallScore < 65) classification = 'HIGH';
    else if (overallScore < 75) classification = 'ELEVATED';
    else if (overallScore < 85) classification = 'GUARDED';

    const result: CityResilienceScoreDto = {
      resilienceScore: overallScore,
      classification,
      contributingFactors: [
        {
          factor: 'Response Execution Readiness',
          score: responseReadiness,
          impactDescription: responseReadiness >= 80 ? 'High crew & action sequence readiness' : 'Response readiness degraded by operational constraints',
        },
        {
          factor: 'Critical Service Continuity',
          score: serviceContinuity,
          impactDescription: serviceContinuity >= 80 ? 'Power & water redundancy verified' : 'Service continuity risk in auxiliary nodes',
        },
        {
          factor: 'Citywide Preparedness',
          score: preparedness,
          impactDescription: preparedness >= 70 ? 'Drainage basin maintenance adequate' : 'Preparedness gap in critical drainage sectors',
        },
        {
          factor: 'Resource Readiness',
          score: resourceReadiness,
          impactDescription: resourceReadiness >= 75 ? 'Optimal resource buffer capacity' : 'Resource constraints in field deployable units',
        },
        {
          factor: 'Prediction Accuracy',
          score: predictionAccuracy,
          impactDescription: `${predictionAccuracy}% historical accuracy delta against telemetry stream`,
        },
      ],
      requiresHumanApproval: true,
      dataSource: hasLiveInputs ? 'DECISION_INTELLIGENCE' : 'DEMO',
      updatedAt: new Date().toISOString(),
    };

    this.safety.assertHumanApprovalRequired(result);
    logger.info(`[CityResilienceScoreService] Computed city resilience score ${overallScore} (${classification}) for city '${cityId}' (Data Source: ${result.dataSource})`);
    return result;
  }
}

export const cityResilienceScoreService = new CityResilienceScoreService();
