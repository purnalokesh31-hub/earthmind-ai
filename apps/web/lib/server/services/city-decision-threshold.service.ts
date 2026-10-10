// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Mega Prompt 5/6
// Citywide Decision Threshold & Escalation Engine
// Review Urgency Modeling Only — Zero Operational Dispatch
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type DecisionThresholdType =
  | 'CRITICAL_RISK'
  | 'HIGH_POPULATION_EXPOSURE'
  | 'HIGH_CASCADE_RISK'
  | 'LOW_CONFIDENCE'
  | 'RESOURCE_SHORTAGE'
  | 'TIME_TO_IMPACT'
  | 'SERVICE_DISRUPTION';

export type AdvisoryEscalationState = 'MONITOR' | 'REVIEW' | 'PRIORITIZE' | 'ESCALATE' | 'CRITICAL_REVIEW';

export interface DecisionThresholdEvaluationItemDto {
  thresholdType: DecisionThresholdType;
  name: string;
  configuredThresholdValue: number;
  actualValue: number;
  unit: string;
  thresholdTriggered: boolean;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface DecisionThresholdReportDto {
  scenarioId: string;
  advisoryEscalationState: AdvisoryEscalationState;
  urgencyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  triggeredThresholdsCount: number;
  evaluations: DecisionThresholdEvaluationItemDto[];
  requiresHumanApproval: true;
  generatedAt: string;
}

export class CityDecisionThresholdService {
  evaluateThresholds(
    scenarioId: string,
    metrics: {
      riskScore: number;
      populationExposed: number;
      cascadeProbability: number;
      confidence: number;
      resourceShortageCount: number;
      timeToImpactHours: number;
      serviceDisruptionIndex: number;
    }
  ): DecisionThresholdReportDto {
    const evaluations: DecisionThresholdEvaluationItemDto[] = [
      {
        thresholdType: 'CRITICAL_RISK',
        name: 'Citywide Composite Risk Level',
        configuredThresholdValue: 80.0,
        actualValue: metrics.riskScore,
        unit: 'points',
        thresholdTriggered: metrics.riskScore >= 80.0,
        severity: metrics.riskScore >= 85 ? 'CRITICAL' : 'HIGH',
      },
      {
        thresholdType: 'HIGH_POPULATION_EXPOSURE',
        name: 'Population Density in Hazard Zone',
        configuredThresholdValue: 20000,
        actualValue: metrics.populationExposed,
        unit: 'citizens',
        thresholdTriggered: metrics.populationExposed >= 20000,
        severity: metrics.populationExposed >= 30000 ? 'CRITICAL' : 'HIGH',
      },
      {
        thresholdType: 'HIGH_CASCADE_RISK',
        name: 'Cross-Domain Infrastructure Cascade Risk',
        configuredThresholdValue: 0.75,
        actualValue: metrics.cascadeProbability,
        unit: 'probability',
        thresholdTriggered: metrics.cascadeProbability >= 0.75,
        severity: 'HIGH',
      },
      {
        thresholdType: 'LOW_CONFIDENCE',
        name: 'Prediction & Model Confidence Floor',
        configuredThresholdValue: 70.0,
        actualValue: metrics.confidence,
        unit: 'percent',
        thresholdTriggered: metrics.confidence < 70.0,
        severity: 'MODERATE',
      },
      {
        thresholdType: 'RESOURCE_SHORTAGE',
        name: 'Municipal Resource Crew Deficit',
        configuredThresholdValue: 1,
        actualValue: metrics.resourceShortageCount,
        unit: 'crews',
        thresholdTriggered: metrics.resourceShortageCount >= 1,
        severity: metrics.resourceShortageCount >= 3 ? 'CRITICAL' : 'MODERATE',
      },
      {
        thresholdType: 'TIME_TO_IMPACT',
        name: 'Forecast Time to Severe Impact',
        configuredThresholdValue: 4.0,
        actualValue: metrics.timeToImpactHours,
        unit: 'hours',
        thresholdTriggered: metrics.timeToImpactHours <= 4.0,
        severity: metrics.timeToImpactHours <= 2.0 ? 'CRITICAL' : 'HIGH',
      },
      {
        thresholdType: 'SERVICE_DISRUPTION',
        name: 'Cross-Domain Service Disruption Score',
        configuredThresholdValue: 65.0,
        actualValue: metrics.serviceDisruptionIndex,
        unit: 'index',
        thresholdTriggered: metrics.serviceDisruptionIndex >= 65.0,
        severity: 'HIGH',
      },
    ];

    const triggeredCount = evaluations.filter((e) => e.thresholdTriggered).length;
    const criticalTriggered = evaluations.some((e) => e.thresholdTriggered && e.severity === 'CRITICAL');

    let advisoryEscalationState: AdvisoryEscalationState = 'MONITOR';
    let urgencyLevel: DecisionThresholdReportDto['urgencyLevel'] = 'LOW';

    if (criticalTriggered && triggeredCount >= 3) {
      advisoryEscalationState = 'CRITICAL_REVIEW';
      urgencyLevel = 'EXTREME';
    } else if (triggeredCount >= 4) {
      advisoryEscalationState = 'ESCALATE';
      urgencyLevel = 'HIGH';
    } else if (triggeredCount >= 2) {
      advisoryEscalationState = 'PRIORITIZE';
      urgencyLevel = 'MODERATE';
    } else if (triggeredCount >= 1) {
      advisoryEscalationState = 'REVIEW';
      urgencyLevel = 'MODERATE';
    } else {
      advisoryEscalationState = 'MONITOR';
      urgencyLevel = 'LOW';
    }

    logger.info(`[CityDecisionThresholdService] Evaluated thresholds for '${scenarioId}': EscalationState=${advisoryEscalationState}, Triggered=${triggeredCount}`);

    return {
      scenarioId,
      advisoryEscalationState,
      urgencyLevel,
      triggeredThresholdsCount: triggeredCount,
      evaluations,
      requiresHumanApproval: true,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const cityDecisionThresholdService = new CityDecisionThresholdService();
