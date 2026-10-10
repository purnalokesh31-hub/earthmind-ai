// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Coordination Domain Types
// ──────────────────────────────────────────────────────────────

export type AgencyStatus = 'INVITED' | 'JOINED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';

export interface AgencyParticipationProps {
  id: string;
  dispatchId: string;
  incidentId: string;
  departmentId: string;
  departmentName: string;
  isPrimary: boolean;
  responsibility: string;
  status: AgencyStatus;
  acknowledgedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface MultiAgencyCoordinationProps {
  coordinationId: string;
  incidentId: string;
  primaryDepartmentId: string;
  participatingAgencies: AgencyParticipationProps[];
  sharedContext: Record<string, unknown>;
  isSynchronized: boolean;
  createdAt: Date;
}
