// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance Confidence Evaluation Service
// ──────────────────────────────────────────────────────────────

import {
  GovernanceConfidenceLevel,
  GovernanceProvenanceType,
  GovernancePolicyThresholdDto,
} from '../domain/digital-twin/city-governance.domain';
import { logger } from '../logger';

export interface ConfidenceEvaluationResult {
  confidenceLevel: GovernanceConfidenceLevel;
  scorePercent: number;
  thresholdUsed: string;
  explanation: string;
  recommendedGovernanceAction: 'NORMAL_ADVISORY' | 'ADDITIONAL_EVIDENCE_RECOMMENDED' | 'MANDATORY_OPERATOR_REVIEW' | 'BLOCK_RECOMMENDATION';
  missingEvidence: string[];
  provenance: GovernanceProvenanceType;
  requiresHumanApproval: true;
}

export class CityGovernanceConfidenceService {
  private defaultThresholds: GovernancePolicyThresholdDto = {
    lowRiskMax: 20,
    guardedRiskMax: 40,
    elevatedRiskMax: 60,
    highRiskMax: 80,
    criticalRiskMin: 81,
    highConfidenceMin: 85,
    mediumConfidenceMin: 65,
    lowConfidenceMin: 40,
  };

  public evaluateConfidence(
    scorePercent: number,
    availableEvidenceCount: number,
    requiredEvidenceCount: number = 3,
    customThresholds?: Partial<GovernancePolicyThresholdDto>,
    provenance: GovernanceProvenanceType = 'GOVERNANCE'
  ): ConfidenceEvaluationResult {
    const t = { ...this.defaultThresholds, ...customThresholds };
    let confidenceLevel: GovernanceConfidenceLevel = 'INSUFFICIENT_CONFIDENCE';
    let action: ConfidenceEvaluationResult['recommendedGovernanceAction'] = 'BLOCK_RECOMMENDATION';
    let thresholdUsed = '';
    let explanation = '';
    const missingEvidence: string[] = [];

    if (availableEvidenceCount < requiredEvidenceCount) {
      missingEvidence.push(`Required ${requiredEvidenceCount} evidence telemetry streams, only ${availableEvidenceCount} available.`);
    }

    if (scorePercent >= t.highConfidenceMin && availableEvidenceCount >= requiredEvidenceCount) {
      confidenceLevel = 'HIGH_CONFIDENCE';
      action = 'NORMAL_ADVISORY';
      thresholdUsed = `score >= ${t.highConfidenceMin}% & evidence >= ${requiredEvidenceCount}`;
      explanation = `High intelligence confidence (${scorePercent}%) supported by ${availableEvidenceCount} evidence streams. Proceeding with standard advisory workflow.`;
    } else if (scorePercent >= t.mediumConfidenceMin) {
      confidenceLevel = 'MEDIUM_CONFIDENCE';
      action = 'ADDITIONAL_EVIDENCE_RECOMMENDED';
      thresholdUsed = `${t.mediumConfidenceMin}% <= score < ${t.highConfidenceMin}%`;
      explanation = `Medium intelligence confidence (${scorePercent}%). Supplementary sensor telemetry or citizen verification recommended.`;
    } else if (scorePercent >= t.lowConfidenceMin) {
      confidenceLevel = 'LOW_CONFIDENCE';
      action = 'MANDATORY_OPERATOR_REVIEW';
      thresholdUsed = `${t.lowConfidenceMin}% <= score < ${t.mediumConfidenceMin}%`;
      explanation = `Low intelligence confidence (${scorePercent}%). Mandatory human operator review required prior to progression.`;
    } else {
      confidenceLevel = 'INSUFFICIENT_CONFIDENCE';
      action = 'BLOCK_RECOMMENDATION';
      thresholdUsed = `score < ${t.lowConfidenceMin}%`;
      explanation = `Insufficient intelligence confidence (${scorePercent}%). Recommendation is blocked from automatic pipeline progression until verified telemetry is ingested.`;
    }

    logger.info(`[CityGovernanceConfidenceService] Evaluated confidence ${scorePercent}% -> ${confidenceLevel} (${action})`);

    return {
      confidenceLevel,
      scorePercent,
      thresholdUsed,
      explanation,
      recommendedGovernanceAction: action,
      missingEvidence,
      provenance,
      requiresHumanApproval: true,
    };
  }
}

export const cityGovernanceConfidenceService = new CityGovernanceConfidenceService();
