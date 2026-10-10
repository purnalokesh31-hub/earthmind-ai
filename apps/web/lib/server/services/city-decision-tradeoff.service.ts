// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Mega Prompt 5/6
// Multi-Candidate Intervention Trade-Off Analysis Service
// ──────────────────────────────────────────────────────────────

import { CityDecisionOptionDto } from '../domain/digital-twin/city-decision.domain';
import { logger } from '../logger';

export interface TradeOffItemDto {
  dimension: string;
  candidateValue: string;
  alternativeValue: string;
  tradeOffSummary: string;
  favorable: boolean;
}

export interface CandidateTradeOffAnalysisDto {
  candidateId: string;
  candidateName: string;
  costUsd: number;
  riskReductionPts: number;
  populationProtected: number;
  deploymentTimeMinutes: number;
  downtimeHours: number;
  resilienceGainPercent: number;
  tradeOffs: TradeOffItemDto[];
  overallTradeOffRating: 'HIGHLY_FAVORABLE' | 'MODERATELY_FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE';
}

export interface StrategyScorecardDto {
  candidateId: string;
  candidateName: string;
  strategyProfile: 'LIFE_SAFETY_FIRST' | 'SERVICE_CONTINUITY' | 'COST_EFFICIENCY' | 'RAPID_RESPONSE' | 'BALANCED';
  scores: {
    riskReductionScore: number; // 0-100
    populationProtectionScore: number; // 0-100
    serviceRecoveryScore: number; // 0-100
    costEfficiencyScore: number; // 0-100
    resourceEfficiencyScore: number; // 0-100
    deploymentSpeedScore: number; // 0-100
    confidenceScore: number; // 0-100
    cascadePreventionScore: number; // 0-100
    overallScore: number; // 0-100
  };
  priorityTier: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NORMAL' | 'LOW';
  weightDistribution: Record<string, number>;
}

export class CityDecisionTradeOffService {
  analyzeTradeOffs(candidate: CityDecisionOptionDto, alternatives: CityDecisionOptionDto[]): CandidateTradeOffAnalysisDto {
    const tradeOffs: TradeOffItemDto[] = [];
    const baselineAlt = alternatives[0] || candidate;

    // Cost vs Risk Reduction
    const costDiff = candidate.estimatedCost - baselineAlt.estimatedCost;
    const riskDiff = candidate.estimatedRiskReduction - baselineAlt.estimatedRiskReduction;
    tradeOffs.push({
      dimension: 'Cost vs Risk Reduction',
      candidateValue: `$${candidate.estimatedCost.toLocaleString()} (-${candidate.estimatedRiskReduction} pts risk)`,
      alternativeValue: `$${baselineAlt.estimatedCost.toLocaleString()} (-${baselineAlt.estimatedRiskReduction} pts risk)`,
      tradeOffSummary: costDiff > 0
        ? `Requires +$${costDiff.toLocaleString()} additional investment to achieve +${riskDiff.toFixed(1)} pts higher risk reduction.`
        : `Saves $${Math.abs(costDiff).toLocaleString()} capital expenditure with ${Math.abs(riskDiff).toFixed(1)} pts lower risk reduction.`,
      favorable: candidate.estimatedRiskReduction >= baselineAlt.estimatedRiskReduction,
    });

    // Resource Usage vs Population Protection
    const popDiff = candidate.estimatedPopulationBenefit - baselineAlt.estimatedPopulationBenefit;
    tradeOffs.push({
      dimension: 'Resource Usage vs Population Protection',
      candidateValue: `${candidate.estimatedPopulationBenefit.toLocaleString()} citizens protected`,
      alternativeValue: `${baselineAlt.estimatedPopulationBenefit.toLocaleString()} citizens protected`,
      tradeOffSummary: popDiff >= 0
        ? `Protects +${popDiff.toLocaleString()} more residents across critical municipal zones.`
        : `Protects ${Math.abs(popDiff).toLocaleString()} fewer residents in secondary sectors.`,
      favorable: popDiff >= 0,
    });

    // Deployment Speed vs Service Restoration
    const timeDiffMinutes = (candidate.implementationTime - baselineAlt.implementationTime) * 60;
    tradeOffs.push({
      dimension: 'Deployment Speed vs Service Restoration',
      candidateValue: `${candidate.implementationTime}h implementation time`,
      alternativeValue: `${baselineAlt.implementationTime}h implementation time`,
      tradeOffSummary: timeDiffMinutes <= 0
        ? `Deploys ${Math.abs(timeDiffMinutes).toFixed(0)} minutes faster than alternative strategies.`
        : `Requires +${timeDiffMinutes.toFixed(0)} minutes longer deployment window.`,
      favorable: candidate.implementationTime <= baselineAlt.implementationTime,
    });

    // Downtime vs Financial Impact
    tradeOffs.push({
      dimension: 'Downtime vs Financial Impact',
      candidateValue: `${candidate.estimatedDowntime}h grid downtime`,
      alternativeValue: `${baselineAlt.estimatedDowntime}h grid downtime`,
      tradeOffSummary: `Minimizes localized infrastructure outage to ${candidate.estimatedDowntime} hours.`,
      favorable: candidate.estimatedDowntime <= baselineAlt.estimatedDowntime,
    });

    const favorableCount = tradeOffs.filter((t) => t.favorable).length;
    let overallTradeOffRating: CandidateTradeOffAnalysisDto['overallTradeOffRating'] = 'NEUTRAL';
    if (favorableCount >= 3) overallTradeOffRating = 'HIGHLY_FAVORABLE';
    else if (favorableCount >= 2) overallTradeOffRating = 'MODERATELY_FAVORABLE';
    else if (favorableCount === 1) overallTradeOffRating = 'NEUTRAL';
    else overallTradeOffRating = 'UNFAVORABLE';

    logger.info(`[CityDecisionTradeOffService] Completed trade-off evaluation for '${candidate.optionId}': Rating=${overallTradeOffRating}`);

    return {
      candidateId: candidate.optionId,
      candidateName: candidate.name,
      costUsd: candidate.estimatedCost,
      riskReductionPts: candidate.estimatedRiskReduction,
      populationProtected: candidate.estimatedPopulationBenefit,
      deploymentTimeMinutes: Math.round(candidate.implementationTime * 60),
      downtimeHours: candidate.estimatedDowntime,
      resilienceGainPercent: Math.round(candidate.confidence * 0.9),
      tradeOffs,
      overallTradeOffRating,
    };
  }

  generateScorecard(
    candidate: CityDecisionOptionDto,
    profile: 'LIFE_SAFETY_FIRST' | 'SERVICE_CONTINUITY' | 'COST_EFFICIENCY' | 'RAPID_RESPONSE' | 'BALANCED' = 'BALANCED'
  ): StrategyScorecardDto {
    const profileWeights: Record<string, Record<string, number>> = {
      LIFE_SAFETY_FIRST: { risk: 0.30, pop: 0.35, recovery: 0.10, cost: 0.05, res: 0.05, speed: 0.05, conf: 0.05, cascade: 0.05 },
      SERVICE_CONTINUITY: { risk: 0.15, pop: 0.15, recovery: 0.35, cost: 0.05, res: 0.10, speed: 0.10, conf: 0.05, cascade: 0.05 },
      COST_EFFICIENCY: { risk: 0.10, pop: 0.10, recovery: 0.10, cost: 0.40, res: 0.15, speed: 0.05, conf: 0.05, cascade: 0.05 },
      RAPID_RESPONSE: { risk: 0.15, pop: 0.15, recovery: 0.10, cost: 0.05, res: 0.05, speed: 0.40, conf: 0.05, cascade: 0.05 },
      BALANCED: { risk: 0.20, pop: 0.20, recovery: 0.15, cost: 0.10, res: 0.10, speed: 0.10, conf: 0.08, cascade: 0.07 },
    };

    const w = profileWeights[profile] || profileWeights.BALANCED;

    const riskReductionScore = Math.min(100, Math.round(candidate.estimatedRiskReduction * 2.5));
    const populationProtectionScore = Math.min(100, Math.round((candidate.estimatedPopulationBenefit / 35000) * 100));
    const serviceRecoveryScore = Math.min(100, Math.round(100 - candidate.estimatedDowntime * 10));
    const costEfficiencyScore = Math.min(100, Math.round(100 - (candidate.estimatedCost / 300000) * 100));
    const resourceEfficiencyScore = Math.min(100, Math.round(85));
    const deploymentSpeedScore = Math.min(100, Math.round(100 - candidate.implementationTime * 15));
    const confidenceScore = Math.round(candidate.confidence);
    const cascadePreventionScore = Math.min(100, Math.round(candidate.priorityScore * 0.95));

    const overallScore = Math.round(
      (riskReductionScore * w.risk +
        populationProtectionScore * w.pop +
        serviceRecoveryScore * w.recovery +
        costEfficiencyScore * w.cost +
        resourceEfficiencyScore * w.res +
        deploymentSpeedScore * w.speed +
        confidenceScore * w.conf +
        cascadePreventionScore * w.cascade) * 10
    ) / 10;

    let priorityTier: StrategyScorecardDto['priorityTier'] = 'HIGH';
    if (overallScore >= 90) priorityTier = 'CRITICAL';
    else if (overallScore >= 80) priorityTier = 'HIGH';
    else if (overallScore >= 70) priorityTier = 'ELEVATED';
    else if (overallScore >= 50) priorityTier = 'NORMAL';
    else priorityTier = 'LOW';

    return {
      candidateId: candidate.optionId,
      candidateName: candidate.name,
      strategyProfile: profile,
      scores: {
        riskReductionScore,
        populationProtectionScore,
        serviceRecoveryScore,
        costEfficiencyScore,
        resourceEfficiencyScore,
        deploymentSpeedScore,
        confidenceScore,
        cascadePreventionScore,
        overallScore,
      },
      priorityTier,
      weightDistribution: w,
    };
  }
}

export const cityDecisionTradeOffService = new CityDecisionTradeOffService();
