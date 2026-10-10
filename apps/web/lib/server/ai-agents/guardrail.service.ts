// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Agent Safety & Guardrail Engine
// Evaluates Confidence Thresholds, Data Freshness & Human Approval
// ──────────────────────────────────────────────────────────────

import { ReasoningResultDto } from '../domain/ai-agent.domain';

export type SafetyEvaluationResult =
  | 'SAFE'
  | 'LOW_CONFIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'STALE_INFORMATION'
  | 'INSUFFICIENT_DATA';

export class GuardrailService {
  private readonly confidenceThreshold = 70; // 70% minimum confidence

  evaluateReasoning(reasoning: ReasoningResultDto): { status: SafetyEvaluationResult; flags: string[] } {
    const flags: string[] = [];

    if (reasoning.confidenceScore < this.confidenceThreshold) {
      flags.push('LOW_CONFIDENCE: Confidence score below 70% threshold');
      return { status: 'LOW_CONFIDENCE', flags };
    }

    if (reasoning.evidenceCitations.length === 0) {
      flags.push('INSUFFICIENT_DATA: No verified knowledge citations found');
      return { status: 'INSUFFICIENT_DATA', flags };
    }

    // Force mandatory human approval on all operational recommendations
    if (!reasoning.requiresHumanApproval) {
      reasoning.requiresHumanApproval = true;
      flags.push('GUARDRAIL_ENFORCED: Consequential action requires explicit human authorization');
    }

    return { status: 'SAFE', flags };
  }
}

export const guardrailService = new GuardrailService();
