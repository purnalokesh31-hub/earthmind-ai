// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Response DTOs
// Clean Architecture Serialization Layer for Operational Intelligence
// ──────────────────────────────────────────────────────────────

export interface CommandCenterKpiDto {
  activeIncidents: number;
  criticalIncidents: number;
  pendingDispatches: number;
  activeOfficers: number;
  slaBreaches: number;
  escalatedIncidents: number;
  resolvedToday: number;
  activeMultiAgencyOps: number;
  timestamp: string;
}

export interface CommandCenterIncidentItemDto {
  id: string;
  incidentCode: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  status: string;
  assignedOfficerName: string | null;
  assignedOfficerId: string | null;
  departmentName: string;
  departmentId: string | null;
  slaStatus: 'NORMAL' | 'WARNING' | 'BREACHED';
  acknowledgementDeadline: string | null;
  responseDeadline: string | null;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  dispatchId: string | null;
  escalationLevel: number;
  updatedAt: string;
}

export interface CommandCenterWorkspaceDetailDto {
  incident: CommandCenterIncidentItemDto;
  description: string;
  aiSummary: string | null;
  visionAnalysesCount: number;
  riskAssessment: {
    overallRiskScore: number;
    publicSafetyRisk: number;
    environmentalRisk: number;
    financialRisk: number;
    operationalRisk: number;
    recommendation: string;
  } | null;
  evidenceItems: Array<{
    id: string;
    fileName: string;
    fileType: string;
    storageUrl: string;
    status: string;
  }>;
  dispatch: {
    id: string;
    status: string;
    priority: string;
    dispatchReason: string;
    assignedOfficerId: string | null;
    departmentId: string | null;
    assignedAt: string;
    acknowledgedAt: string | null;
    dispatchedAt: string | null;
    enRouteAt: string | null;
    onSceneAt: string | null;
    estimatedResponseTimeMinutes: number | null;
    actualResponseTimeMinutes: number | null;
    completedAt: string | null;
    escalationLevel: number;
  } | null;
  sla: {
    priority: string;
    acknowledgementDeadline: string;
    responseDeadline: string;
    resolutionTarget: string;
    isAcknowledgementBreached: boolean;
    isResponseBreached: boolean;
  };
  escalation: {
    level: number;
    levelName: string;
    targetRole: string;
    historyCount: number;
  };
  timelineEvents: Array<{
    id: string;
    action: string;
    actorId: string | null;
    note: string | null;
    createdAt: string;
  }>;
  multiAgency: {
    primaryDepartmentName: string;
    participatingAgenciesCount: number;
    isCoordinated: boolean;
  };
}
