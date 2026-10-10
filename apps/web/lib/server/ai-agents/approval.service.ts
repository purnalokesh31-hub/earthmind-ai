// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Human-in-the-Loop Approval Control Service
// ──────────────────────────────────────────────────────────────

import { RecommendationDto, ApprovalRequestDto } from '../domain/ai-agent.domain';

export class ApprovalService {
  private approvals: Map<string, ApprovalRequestDto> = new Map();

  async approveRecommendation(
    recommendation: RecommendationDto,
    userId: string,
    userRole: string,
    reasonNote?: string
  ): Promise<RecommendationDto> {
    if (recommendation.approvalStatus === 'APPROVED' || recommendation.approvalStatus === 'REJECTED') {
      throw new Error(`RECOMMENDATION_ALREADY_DECIDED: Recommendation '${recommendation.recommendationId}' is already ${recommendation.approvalStatus}.`);
    }

    recommendation.approvalStatus = 'APPROVED';

    const req: ApprovalRequestDto = {
      recommendationId: recommendation.recommendationId,
      userId,
      userRole,
      decision: 'APPROVE',
      reasonNote: reasonNote || 'Authorized by Duty Commander',
      timestamp: new Date().toISOString(),
    };

    this.approvals.set(recommendation.recommendationId, req);
    return recommendation;
  }

  async rejectRecommendation(
    recommendation: RecommendationDto,
    userId: string,
    userRole: string,
    reasonNote?: string
  ): Promise<RecommendationDto> {
    if (recommendation.approvalStatus === 'APPROVED' || recommendation.approvalStatus === 'REJECTED') {
      throw new Error(`RECOMMENDATION_ALREADY_DECIDED: Recommendation '${recommendation.recommendationId}' is already ${recommendation.approvalStatus}.`);
    }

    recommendation.approvalStatus = 'REJECTED';

    const req: ApprovalRequestDto = {
      recommendationId: recommendation.recommendationId,
      userId,
      userRole,
      decision: 'REJECT',
      reasonNote: reasonNote || 'Rejected by Duty Commander',
      timestamp: new Date().toISOString(),
    };

    this.approvals.set(recommendation.recommendationId, req);
    return recommendation;
  }

  getApprovalRecord(recommendationId: string): ApprovalRequestDto | undefined {
    return this.approvals.get(recommendationId);
  }
}

export const approvalService = new ApprovalService();
