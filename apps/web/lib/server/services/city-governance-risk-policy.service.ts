// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance Risk Threshold & Classification Service
// ──────────────────────────────────────────────────────────────

import {
  GovernanceRiskTier,
  GovernanceAuthorizationLevel,
  GovernanceProvenanceType,
  GovernancePolicyThresholdDto,
} from '../domain/digital-twin/city-governance.domain';
import { logger } from '../logger';

export interface RiskClassificationResult {
  riskTier: GovernanceRiskTier;
  score: number;
  thresholdUsed: string;
  explanation: string;
  defaultAuthorizationLevel: GovernanceAuthorizationLevel;
  provenance: GovernanceProvenanceType;
  requiresHumanApproval: true;
}

export class CityGovernanceRiskPolicyService {
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

  public classifyRisk(
    score: number,
    customThresholds?: Partial<GovernancePolicyThresholdDto>,
    provenance: GovernanceProvenanceType = 'GOVERNANCE'
  ): RiskClassificationResult {
    const t = { ...this.defaultThresholds, ...customThresholds };
    let riskTier: GovernanceRiskTier = 'LOW';
    let defaultAuthLevel: GovernanceAuthorizationLevel = 'OPERATOR';
    let thresholdUsed = '';
    let explanation = '';

    if (score >= t.criticalRiskMin) {
      riskTier = 'CRITICAL';
      defaultAuthLevel = 'EMERGENCY_COMMANDER';
      thresholdUsed = `score >= ${t.criticalRiskMin}`;
      explanation = `Risk score ${score} exceeds critical threshold (${t.criticalRiskMin}). Urgent multi-domain emergency commander review required.`;
    } else if (score > t.elevatedRiskMax) {
      riskTier = 'HIGH';
      defaultAuthLevel = 'CITY_COMMANDER';
      thresholdUsed = `${t.elevatedRiskMax} < score <= ${t.highRiskMax}`;
      explanation = `Risk score ${score} falls within high risk band (${t.elevatedRiskMax + 1}–${t.highRiskMax}). City commander authorization required.`;
    } else if (score > t.guardedRiskMax) {
      riskTier = 'ELEVATED';
      defaultAuthLevel = 'DOMAIN_MANAGER';
      thresholdUsed = `${t.guardedRiskMax} < score <= ${t.elevatedRiskMax}`;
      explanation = `Risk score ${score} indicates elevated risk (${t.guardedRiskMax + 1}–${t.elevatedRiskMax}). Domain manager oversight required.`;
    } else if (score > t.lowRiskMax) {
      riskTier = 'GUARDED';
      defaultAuthLevel = 'SENIOR_OPERATOR';
      thresholdUsed = `${t.lowRiskMax} < score <= ${t.guardedRiskMax}`;
      explanation = `Risk score ${score} indicates guarded risk (${t.lowRiskMax + 1}–${t.guardedRiskMax}). Senior operator review required.`;
    } else {
      riskTier = 'LOW';
      defaultAuthLevel = 'OPERATOR';
      thresholdUsed = `score <= ${t.lowRiskMax}`;
      explanation = `Risk score ${score} is within low risk threshold (<= ${t.lowRiskMax}). Routine operator review required.`;
    }

    logger.info(`[CityGovernanceRiskPolicyService] Classified score ${score} -> ${riskTier} (${defaultAuthLevel})`);

    return {
      riskTier,
      score,
      thresholdUsed,
      explanation,
      defaultAuthorizationLevel: defaultAuthLevel,
      provenance,
      requiresHumanApproval: true,
    };
  }
}

export const cityGovernanceRiskPolicyService = new CityGovernanceRiskPolicyService();
