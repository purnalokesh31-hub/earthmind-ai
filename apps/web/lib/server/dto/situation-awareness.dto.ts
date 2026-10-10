// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.11 Situation Awareness & Decision Support DTOs
// ──────────────────────────────────────────────────────────────

export interface SituationSnapshotDto {
  timestamp: string;
  geographicScope: {
    level: string;
    id: string;
    name: string;
  };
  activeIncidentCount: number;
  criticalIncidentCount: number;
  activeWarningsCount: number;
  activePredictionsCount: number;
  slaBreachesCount: number;
  activeDispatchesCount: number;
  availableRespondersCount: number;
  regionalRiskScore: number;
  topOperationalPriorities: Array<{
    id: string;
    title: string;
    severity: string;
    priorityScore: number;
  }>;
}

export interface PriorityRecommendationDto {
  id: string;
  incidentId: string;
  title: string;
  priorityScore: number; // 0 - 100
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAttentionOrder: number;
  contributingFactors: string[];
  explanation: string;
}

export interface DecisionSupportRecommendationDto {
  recommendationId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  supportingFactors: string[];
  affectedTargetId: string;
  confidence: number; // %
  requiresHumanApproval: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SNOOZED';
  actionType: 'PRIORITIZE' | 'ESCALATE' | 'ALLOCATE_RESOURCE' | 'INSPECT_ZONE';
  createdAt: string;
}

export interface OperationalHealthSummaryDto {
  slaCompliancePercentage: number;
  averageResponseTimeMinutes: number;
  averageDispatchTimeMinutes: number;
  activeEscalationsCount: number;
  unacknowledgedIncidentsCount: number;
  overdueIncidentsCount: number;
  responderWorkloadIndex: number;
  departmentWorkloads: Array<{
    departmentName: string;
    activeCount: number;
    capacityPercentage: number;
  }>;
}

export interface OperationalTimelineItemDto {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  title: string;
  details: string;
  targetId?: string;
  severity?: string;
}
