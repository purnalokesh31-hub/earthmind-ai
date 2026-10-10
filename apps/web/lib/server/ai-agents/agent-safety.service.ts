// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Agent Safety & Guardrail Engine
// ──────────────────────────────────────────────────────────────

import { ReasoningResultDto } from '../domain/ai-agent.domain';

export class AgentSafetyService {
  validateSafety(reasoning: ReasoningResultDto): { isValid: boolean; safetyFlags: string[] } {
    const safetyFlags: string[] = [];

    if (reasoning.confidenceScore < 70) {
      safetyFlags.push('NEEDS_HUMAN_REVIEW (Confidence below 70% threshold)');
    }

    if (reasoning.conflictingInformation && reasoning.conflictingInformation.length > 0) {
      safetyFlags.push('DATA_CONFLICT_DETECTED');
    }

    // Mandatory Human Approval Enforcement for Consequential Actions
    if (!reasoning.requiresHumanApproval) {
      reasoning.requiresHumanApproval = true;
      safetyFlags.push('FORCED_HUMAN_APPROVAL_GUARDRAIL');
    }

    return {
      isValid: safetyFlags.length === 0,
      safetyFlags,
    };
  }
}

export const agentSafetyService = new AgentSafetyService();
