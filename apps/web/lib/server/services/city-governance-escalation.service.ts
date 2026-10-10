// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance Escalation Engine Service
// ──────────────────────────────────────────────────────────────

import {
  GovernanceEscalationLevel,
  GovernanceRiskTier,
  GovernanceConfidenceLevel,
  GovernancePolicyViolationDto,
  GovernanceProvenanceType,
} from '../domain/digital-twin/city-governance.domain';
import { logger } from '../logger';

export interface EscalationEvaluationResult {
  escalationLevel: GovernanceEscalationLevel;
  triggers: string[];
  explanation: string;
  recommendedReviewerRole: string;
  provenance: GovernanceProvenanceType;
  requiresHumanApproval: true;
}

export class CityGovernanceEscalationService {
  public evaluateEscalation(
    riskTier: GovernanceRiskTier,
    confidenceLevel: GovernanceConfidenceLevel,
    violations: GovernancePolicyViolationDto[],
    impactedDomainCount: number,
    provenance: GovernanceProvenanceType = 'GOVERNANCE'
  ): EscalationEvaluationResult {
    let escalationLevel: GovernanceEscalationLevel = 'NONE';
    const triggers: string[] = [];
    let reviewerRole = 'COMMAND_CENTER_OPERATOR';

    const hasCriticalViolation = violations.some((v) => v.severity === 'CRITICAL' && v.blocking);
    const hasMultipleViolations = violations.length >= 2;

    if (riskTier === 'CRITICAL' || hasCriticalViolation) {
      escalationLevel = 'EMERGENCY_COMMANDER';
      reviewerRole = 'EMERGENCY_COMMANDER';
      if (riskTier === 'CRITICAL') triggers.push('CRITICAL risk tier score (>= 81)');
      if (hasCriticalViolation) triggers.push('Blocking CRITICAL policy violation detected');
    } else if (riskTier === 'HIGH' || confidenceLevel === 'LOW_CONFIDENCE' || hasMultipleViolations || impactedDomainCount >= 3) {
      escalationLevel = 'CITY_COMMANDER';
      reviewerRole = 'CITY_COMMANDER';
      if (riskTier === 'HIGH') triggers.push('HIGH risk classification');
      if (confidenceLevel === 'LOW_CONFIDENCE') triggers.push('LOW intelligence confidence');
      if (hasMultipleViolations) triggers.push(`Multiple policy violations (${violations.length})`);
      if (impactedDomainCount >= 3) triggers.push(`Wide multi-domain cascade across ${impactedDomainCount} domains`);
    } else if (riskTier === 'ELEVATED' || confidenceLevel === 'MEDIUM_CONFIDENCE' || violations.length === 1) {
      escalationLevel = 'DOMAIN_MANAGER';
      reviewerRole = 'DOMAIN_MANAGER';
      if (riskTier === 'ELEVATED') triggers.push('ELEVATED risk tier');
      if (confidenceLevel === 'MEDIUM_CONFIDENCE') triggers.push('MEDIUM confidence level requiring validation');
      if (violations.length === 1) triggers.push('Single non-blocking policy warning');
    } else if (riskTier === 'GUARDED') {
      escalationLevel = 'OPERATOR';
      reviewerRole = 'SENIOR_OPERATOR';
      triggers.push('GUARDED risk status');
    } else {
      escalationLevel = 'NONE';
      reviewerRole = 'COMMAND_CENTER_OPERATOR';
      triggers.push('Standard low risk operational baseline');
    }

    const explanation = `Escalation level set to '${escalationLevel}' due to: ${triggers.join('; ')}.`;

    logger.info(`[CityGovernanceEscalationService] Evaluated escalation -> ${escalationLevel} (${triggers.length} triggers)`);

    return {
      escalationLevel,
      triggers,
      explanation,
      recommendedReviewerRole: reviewerRole,
      provenance,
      requiresHumanApproval: true,
    };
  }
}

export const cityGovernanceEscalationService = new CityGovernanceEscalationService();
