// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// Master City Governance Evaluation Pipeline Service
// ──────────────────────────────────────────────────────────────

import {
  GovernancePolicyEvaluationDto,
  GovernanceDecisionType,
  GovernanceProvenanceType,
} from '../domain/digital-twin/city-governance.domain';
import { cityGovernanceRiskPolicyService } from './city-governance-risk-policy.service';
import { cityGovernanceConfidenceService } from './city-governance-confidence.service';
import { cityGovernanceAuthorizationService } from './city-governance-authorization.service';
import { cityGovernancePolicyService } from './city-governance-policy.service';
import { cityGovernanceEscalationService } from './city-governance-escalation.service';
import { memoryCityGovernanceRepository } from '../repositories/city-governance.repository';
import { logger } from '../logger';

export interface GovernanceEvaluationInput {
  targetId: string;
  cityId: string;
  riskScore: number;
  confidenceScorePercent: number;
  availableEvidenceCount?: number;
  requiredEvidenceCount?: number;
  impactedDomains?: string[];
  populationImpactCount?: number;
  financialImpactUsd?: number;
  requiresHumanApproval?: boolean;
  metadata?: Record<string, unknown>;
  provenance?: GovernanceProvenanceType;
}

export class CityGovernanceEvaluationService {
  private repo = memoryCityGovernanceRepository;
  private riskEngine = cityGovernanceRiskPolicyService;
  private confidenceEngine = cityGovernanceConfidenceService;
  private authEngine = cityGovernanceAuthorizationService;
  private policyEngine = cityGovernancePolicyService;
  private escalationEngine = cityGovernanceEscalationService;

  public evaluateGovernancePipeline(input: GovernanceEvaluationInput): GovernancePolicyEvaluationDto {
    const evaluationId = `eval-gov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const provenance: GovernanceProvenanceType = input.provenance || 'GOVERNANCE';
    const now = new Date().toISOString();

    // 1. Risk Classification
    const riskResult = this.riskEngine.classifyRisk(input.riskScore, undefined, provenance);

    // 2. Confidence Evaluation
    const evidenceCount = input.availableEvidenceCount ?? 3;
    const requiredEvidence = input.requiredEvidenceCount ?? 3;
    const confidenceResult = this.confidenceEngine.evaluateConfidence(
      input.confidenceScorePercent,
      evidenceCount,
      requiredEvidence,
      undefined,
      provenance
    );

    // 3. Human Authorization Requirement Mapping
    const impactedDomains = input.impactedDomains || ['CLIMATE', 'UTILITY'];
    const authResult = this.authEngine.determineRequiredAuthorization(
      riskResult.riskTier,
      impactedDomains.length,
      input.financialImpactUsd || 0,
      input.populationImpactCount || 0,
      provenance
    );

    // 4. Policy Violation & Rule Evaluation
    const targetPayload: Record<string, unknown> = {
      requiresHumanApproval: input.requiresHumanApproval ?? true,
      riskScore: input.riskScore,
      confidenceScorePercent: input.confidenceScorePercent,
      cityId: input.cityId,
      ...(input.metadata || {}),
    };
    const violations = this.policyEngine.evaluatePolicyViolations(targetPayload, provenance);

    // Safety Invariant Enforcement: If input attempts to set requiresHumanApproval = false, record explicit critical violation
    if (input.requiresHumanApproval === false) {
      violations.push({
        violationId: `viol-safety-${Date.now()}`,
        policyId: 'pol-gov-human-auth',
        policyName: 'Mandatory Human Authorization Safety Policy',
        severity: 'CRITICAL',
        category: 'HUMAN_AUTHORIZATION',
        message: 'Autonomous physical/consequential execution is forbidden.',
        reason: 'Attempted to bypass mandatory human approval requirement (requiresHumanApproval=false).',
        evidence: { field: 'requiresHumanApproval', actualValue: false, targetValue: true },
        recommendedResolution: 'Restore requiresHumanApproval: true and submit for operator review.',
        blocking: true,
        requiresHumanApproval: true,
        provenance,
      });
    }

    // 5. Advisory Escalation Calculation
    const escalationResult = this.escalationEngine.evaluateEscalation(
      riskResult.riskTier,
      confidenceResult.confidenceLevel,
      violations,
      impactedDomains.length,
      provenance
    );

    // 6. Master Governance Decision Determination
    let decision: GovernanceDecisionType = 'ALLOW_FOR_HUMAN_REVIEW';
    let explanation = '';

    const hasBlockingViolation = violations.some((v) => v.blocking);

    if (hasBlockingViolation) {
      decision = 'BLOCK';
      explanation = `Governance evaluation BLOCKED target '${input.targetId}' due to ${violations.length} policy violation(s). Human remediation required.`;
    } else if (confidenceResult.confidenceLevel === 'INSUFFICIENT_CONFIDENCE') {
      decision = 'REQUEST_MORE_EVIDENCE';
      explanation = `Governance evaluation requested more evidence for target '${input.targetId}' due to insufficient confidence score (${input.confidenceScorePercent}%).`;
    } else if (escalationResult.escalationLevel === 'EMERGENCY_COMMANDER' || escalationResult.escalationLevel === 'CITY_COMMANDER') {
      decision = 'ESCALATE_FOR_REVIEW';
      explanation = `Governance evaluation ESCALATED target '${input.targetId}' to ${escalationResult.escalationLevel} due to ${riskResult.riskTier} risk tier.`;
    } else {
      decision = 'ALLOW_FOR_HUMAN_REVIEW';
      explanation = `Governance evaluation ALLOWED target '${input.targetId}' for human review under ${authResult.requiredAuthorizationLevel} oversight.`;
    }

    const evaluation: GovernancePolicyEvaluationDto = {
      evaluationId,
      targetId: input.targetId,
      cityId: input.cityId,
      governanceDecision: decision,
      riskTier: riskResult.riskTier,
      riskScore: input.riskScore,
      confidenceLevel: confidenceResult.confidenceLevel,
      confidenceScore: input.confidenceScorePercent,
      violations,
      escalationLevel: escalationResult.escalationLevel,
      requiredAuthorizationLevel: authResult.requiredAuthorizationLevel,
      explanation,
      missingEvidence: confidenceResult.missingEvidence,
      evaluatedAt: now,
      requiresHumanApproval: true,
      provenance,
    };

    // Store in repository
    this.repo.recordEvaluation(evaluation);

    logger.info(`[CityGovernanceEvaluationService] Master Governance Decision for '${input.targetId}': ${decision} (${riskResult.riskTier}, Auth: ${authResult.requiredAuthorizationLevel})`);
    return evaluation;
  }
}

export const cityGovernanceEvaluationService = new CityGovernanceEvaluationService();
