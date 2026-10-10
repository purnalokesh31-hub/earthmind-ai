// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Strongly Typed Domain Event Schemas
// ──────────────────────────────────────────────────────────────

export type DomainEventName =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_UPDATED'
  | 'OFFICER_ASSIGNED'
  | 'DEPARTMENT_ASSIGNED'
  | 'PRIORITY_ESCALATED'
  | 'STATUS_CHANGED'
  | 'INCIDENT_VERIFIED'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_ARCHIVED'
  | 'INCIDENT_RESTORED'
  | 'INCIDENT_MERGED'
  | 'RISK_RECALCULATED'
  | 'EVIDENCE_UPLOADED'
  | 'VISION_COMPLETED'
  | 'NOTIFICATION_SENT'
  | 'AUDIT_RECORDED';

export interface BaseDomainEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: DomainEventName;
  timestamp: string;
  traceId?: string;
  payload: T;
}

// ── 1. IncidentCreated Event ──────────────────────────────────
export interface IncidentCreatedPayload {
  incidentId: string;
  incidentCode: string;
  title: string;
  severity: string;
  category: string;
  department: string;
  departmentId?: string;
  riskScore: number;
  locationName: string;
  lat?: number;
  lng?: number;
  createdByUserId: string;
  evidenceId?: string;
}

export type IncidentCreatedEvent = BaseDomainEvent<IncidentCreatedPayload>;

// ── 2. OfficerAssigned Event ──────────────────────────────────
export interface OfficerAssignedPayload {
  incidentId: string;
  officerId: string;
  assignedByUserId: string;
  previousStatus?: string;
  newStatus: string;
  note?: string;
}

// ── 3. DepartmentAssigned Event ───────────────────────────────
export interface DepartmentAssignedPayload {
  incidentId: string;
  departmentId: string;
  departmentName: string;
  assignedByUserId: string;
}

// ── 4. PriorityEscalated Event ────────────────────────────────
export interface PriorityEscalatedPayload {
  incidentId: string;
  previousSeverity: string;
  newSeverity: string;
  previousRiskScore: number;
  newRiskScore: number;
  escalatedByUserId: string;
  reason?: string;
}

// ── 5. StatusChanged Event ────────────────────────────────────
export interface StatusChangedPayload {
  incidentId: string;
  previousStatus: string;
  newStatus: string;
  changedByUserId: string;
  note?: string;
}

// ── 6. IncidentResolved Event ─────────────────────────────────
export interface IncidentResolvedPayload {
  incidentId: string;
  resolvedByUserId: string;
  durationMinutes?: number;
  note?: string;
}

// ── 7. IncidentArchived Event ─────────────────────────────────
export interface IncidentArchivedPayload {
  incidentId: string;
  archivedByUserId: string;
  reason?: string;
}

// ── 8. IncidentRestored Event ─────────────────────────────────
export interface IncidentRestoredPayload {
  incidentId: string;
  restoredByUserId: string;
}

// ── 9. IncidentMerged Event ───────────────────────────────────
export interface IncidentMergedPayload {
  primaryIncidentId: string;
  duplicateIncidentId: string;
  mergedByUserId: string;
}

// ── 10. RiskRecalculated Event ────────────────────────────────
export interface RiskRecalculatedPayload {
  incidentId: string;
  previousRiskScore: number;
  newRiskScore: number;
  damageScore: number;
  aiConfidence: number;
}

// ── 11. EvidenceUploaded Event ────────────────────────────────
export interface EvidenceUploadedPayload {
  evidenceId: string;
  fileName: string;
  fileType: 'image' | 'video' | 'document' | 'sensor';
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  uploadedByUserId: string;
}

export type EvidenceUploadedEvent = BaseDomainEvent<EvidenceUploadedPayload>;

// ── 12. VisionCompleted Event ─────────────────────────────────
export interface VisionCompletedPayload {
  evidenceId: string;
  modelTask: string;
  confidence: number;
  damageScore: number;
  riskScore: number;
  detectedObjectCount: number;
  aiSummary: string;
}

export type VisionCompletedEvent = BaseDomainEvent<VisionCompletedPayload>;

// ── 13. NotificationSent Event ───────────────────────────────
export interface NotificationSentPayload {
  notificationId: string;
  type: string;
  title: string;
  recipientId?: string;
  severity: string;
}

export type NotificationSentEvent = BaseDomainEvent<NotificationSentPayload>;

// ── 14. AuditRecorded Event ───────────────────────────────────
export interface AuditRecordedPayload {
  auditId: string;
  action: string;
  category: string;
  actorId: string;
  description: string;
}

export type AuditRecordedEvent = BaseDomainEvent<AuditRecordedPayload>;
