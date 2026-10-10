// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.11 Decision Support & Human Control Service
// Advisory Recommendations & Mandatory Human Authorization
// ──────────────────────────────────────────────────────────────

import { DecisionSupportRecommendationDto } from '../dto/situation-awareness.dto';

export class DecisionSupportService {
  private recommendations: DecisionSupportRecommendationDto[] = [
    {
      recommendationId: 'ds-rec-101',
      priority: 'CRITICAL',
      title: 'Pre-position 2 Heavy Pumps from Guntur to Vijayawada Ward 12',
      reason: 'Vijayawada Ward 12 flood risk forecast is 82/100 (HIGH). Guntur has 8 surplus response teams available within 35-min transit corridor.',
      supportingFactors: [
        'Predictive Flood Risk Score: 82/100',
        'Vijayawada Public Works Workload Index: 92/100 (Overloaded)',
        'Guntur Surplus Response Teams: 8 Teams',
      ],
      affectedTargetId: 'inc-101',
      confidence: 94,
      requiresHumanApproval: true,
      status: 'PENDING',
      actionType: 'ALLOCATE_RESOURCE',
      createdAt: new Date().toISOString(),
    },
    {
      recommendationId: 'ds-rec-102',
      priority: 'HIGH',
      title: 'Escalate Incident EM-INC-2026-001 to Level 2 (District Commander)',
      reason: 'SLA acknowledgement window within 10 minutes of breach with high traffic impact.',
      supportingFactors: [
        'SLA Acknowledgement Window: 10m remaining',
        'P1 Critical Severity',
      ],
      affectedTargetId: 'inc-101',
      confidence: 91,
      requiresHumanApproval: true,
      status: 'PENDING',
      actionType: 'ESCALATE',
      createdAt: new Date().toISOString(),
    },
  ];

  async listPendingRecommendations(): Promise<DecisionSupportRecommendationDto[]> {
    return this.recommendations.filter((r) => r.status === 'PENDING');
  }

  async approveRecommendation(recommendationId: string, approvedBy: string): Promise<DecisionSupportRecommendationDto> {
    const rec = this.recommendations.find((r) => r.recommendationId === recommendationId);
    if (!rec) throw new Error(`Recommendation ${recommendationId} not found`);
    if (rec.status === 'APPROVED' || rec.status === 'REJECTED') {
      throw new Error(`RECOMMENDATION_ALREADY_DECIDED: Recommendation '${recommendationId}' is already ${rec.status}.`);
    }

    rec.status = 'APPROVED';
    return rec;
  }

  async rejectRecommendation(recommendationId: string, rejectedBy: string, reason?: string): Promise<DecisionSupportRecommendationDto> {
    const rec = this.recommendations.find((r) => r.recommendationId === recommendationId);
    if (!rec) throw new Error(`Recommendation ${recommendationId} not found`);
    if (rec.status === 'APPROVED' || rec.status === 'REJECTED') {
      throw new Error(`RECOMMENDATION_ALREADY_DECIDED: Recommendation '${recommendationId}' is already ${rec.status}.`);
    }

    rec.status = 'REJECTED';
    return rec;
  }
}

export const decisionSupportService = new DecisionSupportService();
