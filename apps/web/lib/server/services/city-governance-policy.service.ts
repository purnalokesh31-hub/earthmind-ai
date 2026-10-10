// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance Policy Violation & Rule Evaluation Engine Service
// ──────────────────────────────────────────────────────────────

import {
  GovernancePolicyEntity,
  GovernancePolicyViolationDto,
  GovernanceProvenanceType,
} from '../domain/digital-twin/city-governance.domain';
import { memoryCityGovernanceRepository } from '../repositories/city-governance.repository';
import { logger } from '../logger';

export class CityGovernancePolicyService {
  private repo = memoryCityGovernanceRepository;

  public evaluatePolicyViolations(
    targetData: Record<string, unknown>,
    provenance: GovernanceProvenanceType = 'GOVERNANCE'
  ): GovernancePolicyViolationDto[] {
    const violations: GovernancePolicyViolationDto[] = [];
    const activePolicies = this.repo.listPolicies('ACTIVE');

    for (const policy of activePolicies) {
      for (const rule of policy.rules) {
        let isRuleViolated = false;
        let violationMessage = '';
        let violationReason = '';

        for (const condition of rule.conditions) {
          const actualValue = targetData[condition.field];

          switch (condition.operator) {
            case 'EQ':
              if (actualValue === condition.targetValue) {
                isRuleViolated = true;
                violationMessage = condition.explanation;
                violationReason = `Field '${condition.field}' equaled target value '${condition.targetValue}'.`;
              }
              break;

            case 'NEQ':
              if (actualValue !== condition.targetValue) {
                isRuleViolated = true;
                violationMessage = condition.explanation;
                violationReason = `Field '${condition.field}' (${actualValue}) did not match expected '${condition.targetValue}'.`;
              }
              break;

            case 'GTE':
              if (typeof actualValue === 'number' && typeof condition.targetValue === 'number' && actualValue >= condition.targetValue) {
                isRuleViolated = true;
                violationMessage = condition.explanation;
                violationReason = `Field '${condition.field}' value ${actualValue} >= limit ${condition.targetValue}.`;
              }
              break;

            case 'LTE':
              if (typeof actualValue === 'number' && typeof condition.targetValue === 'number' && actualValue <= condition.targetValue) {
                isRuleViolated = true;
                violationMessage = condition.explanation;
                violationReason = `Field '${condition.field}' value ${actualValue} <= limit ${condition.targetValue}.`;
              }
              break;

            case 'CONTAINS':
              if (typeof actualValue === 'string' && typeof condition.targetValue === 'string' && actualValue.includes(condition.targetValue)) {
                isRuleViolated = true;
                violationMessage = condition.explanation;
                violationReason = `Field '${condition.field}' contains restricted pattern '${condition.targetValue}'.`;
              }
              break;

            default:
              break;
          }

          if (isRuleViolated) {
            const violationId = `viol-${policy.policyId}-${rule.ruleId}-${Date.now()}`;
            const blocking = rule.action.actionType === 'BLOCK';

            violations.push({
              violationId,
              policyId: policy.policyId,
              policyName: policy.name,
              severity: blocking ? 'CRITICAL' : 'WARNING',
              category: policy.category,
              message: rule.action.message || violationMessage,
              reason: violationReason,
              evidence: { field: condition.field, actualValue, targetValue: condition.targetValue },
              recommendedResolution: 'Submit required operator notes & escalate for human review.',
              blocking,
              requiresHumanApproval: true,
              provenance,
            });
          }
        }
      }
    }

    logger.info(`[CityGovernancePolicyService] Evaluated ${activePolicies.length} policies: detected ${violations.length} violations.`);
    return violations;
  }
}

export const cityGovernancePolicyService = new CityGovernancePolicyService();
