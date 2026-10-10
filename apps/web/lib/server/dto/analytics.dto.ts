// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Analytics Data Transfer Objects
// ──────────────────────────────────────────────────────────────

export interface IncidentCountersDto {
  total: number;
  active: number;
  critical: number;
  dispatched: number;
  resolved: number;
  archived: number;
}

export interface DepartmentWorkloadDto {
  departmentId: string;
  departmentName: string;
  activeCount: number;
  criticalCount: number;
}

export interface SlaMetricsDto {
  meanTimeToDetectMinutes: number;
  meanTimeToResolveHours: number;
  slaCompliancePercentage: number;
}

export interface RiskMetricsDto {
  averageRiskScore: number;
  highRiskSectorCount: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface EarthHealthMetricsDto {
  carbonImpactTonnes: number;
  waterSavedLiters: number;
  biodiversityRiskIndex: number;
  sustainabilityScore: number;
}

export interface MissionControlSummaryDto {
  activeAlertCount: number;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  liveStreamsActive: number;
  incidentCounters: IncidentCountersDto;
  departmentWorkload: DepartmentWorkloadDto[];
  sla: SlaMetricsDto;
  risk: RiskMetricsDto;
  earthHealth: EarthHealthMetricsDto;
  updatedAt: string;
}
