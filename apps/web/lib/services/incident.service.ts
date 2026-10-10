// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Service (Orchestration Layer)
// ──────────────────────────────────────────────────────────────
// This service is the single entry point for all incident
// operations. UI components call this service; the service
// mutates the Zustand store and dispatches side‑effects
// (notifications, audit logs, AI analysis).
//
// Current implementation: Mock / In‑Memory
// Future implementation: REST / GraphQL — swap the body of
// each method; signatures stay identical.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type {
  Incident,
  IncidentStatus,
  Severity,
  Category,
  Comment,
  FieldAssignment,
  RiskAssessment,
  EarthImpactMetrics,
  EvidenceFile,
  TimelineEvent,
  AuditLogEntry,
} from '../../types';

// ── SLA Configuration ──
const SLA_DURATIONS: Record<Severity, number> = {
  critical: 2 * 60 * 60 * 1000,   // 2 hours
  high:     4 * 60 * 60 * 1000,   // 4 hours
  medium:   8 * 60 * 60 * 1000,   // 8 hours
  low:      24 * 60 * 60 * 1000,  // 24 hours
};

// ── Helpers ──
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const now = () => new Date().toISOString();
const store = () => useAppStore.getState();

// ── Mock delay to simulate network latency ──
const mockDelay = (ms = 120): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────────────────────
// 1. Incident CRUD
// ──────────────────────────────────────────────────────────────

export async function createIncident(data: {
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  location: Incident['location'];
  reportedBy: string;
  imageUrl?: string;
}): Promise<Incident> {
  await mockDelay();

  const incident: Incident = {
    id: uid('EM'),
    title: data.title,
    description: data.description,
    category: data.category,
    severity: data.severity,
    status: 'reported',
    location: data.location,
    reportedBy: data.reportedBy,
    reportedAt: now(),
    updatedAt: now(),
    imageUrl: data.imageUrl,
    timeline: [
      {
        id: uid('tl'),
        timestamp: now(),
        event: 'Incident reported',
        icon: '📝',
        actor: data.reportedBy,
      },
    ],
    comments: [],
  };

  store().addIncident(incident);

  // Audit
  logAuditEvent({
    incidentId: incident.id,
    action: 'incident_created',
    actor: data.reportedBy,
    details: `Incident "${data.title}" created with severity ${data.severity}`,
  });

  // Notification
  store().addNotification({
    id: uid('notif'),
    eventType: 'incident_created',
    priorityGroup: data.severity === 'critical' ? 'P1_CRITICAL' : data.severity === 'high' ? 'P2_HIGH' : 'P3_MEDIUM',
    title: 'New Incident Created',
    message: `${data.title} — ${data.severity.toUpperCase()}`,
    timestamp: now(),
    status: 'unread',
    incidentId: incident.id,
    type: data.severity === 'critical' ? 'critical' : 'info',
  });

  return incident;
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  await mockDelay(50);
  return store().incidents.find((i) => i.id === id);
}

export async function listIncidents(filters?: {
  category?: Category;
  severity?: Severity;
  status?: IncidentStatus;
}): Promise<Incident[]> {
  await mockDelay(80);
  let list = store().incidents;
  if (filters?.category) list = list.filter((i) => i.category === filters.category);
  if (filters?.severity) list = list.filter((i) => i.severity === filters.severity);
  if (filters?.status) list = list.filter((i) => i.status === filters.status);
  return list;
}

export async function updateIncident(
  id: string,
  updates: Partial<Incident>,
): Promise<void> {
  await mockDelay();
  store().updateIncident(id, updates);

  logAuditEvent({
    incidentId: id,
    action: 'incident_updated',
    actor: store().currentUser?.name || 'system',
    details: `Fields updated: ${Object.keys(updates).join(', ')}`,
  });
}

// ──────────────────────────────────────────────────────────────
// 2. Incident Lifecycle / Stage Transitions
// ──────────────────────────────────────────────────────────────

export async function transitionStage(
  id: string,
  newStatus: IncidentStatus,
): Promise<void> {
  await mockDelay();
  const prev = store().incidents.find((i) => i.id === id);
  if (!prev) return;

  store().transitionIncidentStage(id, newStatus);

  // Add timeline event
  const timelineEvent: TimelineEvent = {
    id: uid('tl'),
    timestamp: now(),
    event: `Status changed from ${prev.status} to ${newStatus}`,
    icon: statusIcon(newStatus),
    actor: store().currentUser?.name || 'system',
  };
  store().updateIncident(id, {
    timeline: [...prev.timeline, timelineEvent],
  });

  logAuditEvent({
    incidentId: id,
    action: 'stage_transition',
    actor: store().currentUser?.name || 'system',
    details: `${prev.status} → ${newStatus}`,
  });
}

export async function archiveIncident(id: string): Promise<void> {
  await transitionStage(id, 'archived');
}

export async function restoreIncident(id: string): Promise<void> {
  await transitionStage(id, 'reported');
}

export async function resolveIncident(id: string): Promise<void> {
  await mockDelay();
  store().updateIncident(id, { status: 'resolved', resolvedAt: now() });

  logAuditEvent({
    incidentId: id,
    action: 'incident_resolved',
    actor: store().currentUser?.name || 'system',
    details: 'Incident marked as resolved',
  });

  store().addNotification({
    id: uid('notif'),
    eventType: 'resolution_completed',
    priorityGroup: 'P4_INFO',
    title: 'Incident Resolved',
    message: `Incident ${id} has been resolved`,
    timestamp: now(),
    status: 'unread',
    incidentId: id,
    type: 'success',
  });
}

export async function mergeIncidents(
  primaryId: string,
  secondaryId: string,
): Promise<void> {
  await mockDelay();
  const primary = store().incidents.find((i) => i.id === primaryId);
  const secondary = store().incidents.find((i) => i.id === secondaryId);
  if (!primary || !secondary) return;

  const mergedTimeline = [...primary.timeline, ...secondary.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const mergedComments = [...(primary.comments ?? []), ...(secondary.comments ?? [])];

  store().updateIncident(primaryId, {
    timeline: mergedTimeline,
    comments: mergedComments,
    description: `${primary.description}\n\n[Merged from ${secondaryId}] ${secondary.description}`,
  });

  // Remove secondary
  store().setIncidents(store().incidents.filter((i) => i.id !== secondaryId));

  logAuditEvent({
    incidentId: primaryId,
    action: 'incidents_merged',
    actor: store().currentUser?.name || 'system',
    details: `Merged ${secondaryId} into ${primaryId}`,
  });
}

// ──────────────────────────────────────────────────────────────
// 3. Assignment Management
// ──────────────────────────────────────────────────────────────

export async function assignOfficer(data: {
  incidentId: string;
  officerId: string;
  officerName: string;
  departmentId: string;
  departmentName: string;
  unitId: string;
  unitName: string;
  role: FieldAssignment['role'];
  estimatedArrival: Date;
  vehicleId?: string;
  remarks?: string;
}): Promise<FieldAssignment> {
  await mockDelay();

  const assignment: FieldAssignment = {
    assignmentId: uid('asgn'),
    incidentId: data.incidentId,
    officerId: data.officerId,
    officerName: data.officerName,
    departmentId: data.departmentId,
    departmentName: data.departmentName,
    unitId: data.unitId,
    unitName: data.unitName,
    vehicleId: data.vehicleId,
    role: data.role,
    assignmentStatus: 'Pending',
    assignedAt: new Date(),
    estimatedArrival: data.estimatedArrival,
    remarks: data.remarks,
  };

  // Update incident
  store().updateIncident(data.incidentId, {
    assignedTo: data.officerName,
    department: data.departmentName,
    status: 'assigned',
  });

  logAuditEvent({
    incidentId: data.incidentId,
    action: 'officer_assigned',
    actor: store().currentUser?.name || 'system',
    details: `${data.officerName} (${data.departmentName}) assigned as ${data.role}`,
  });

  store().addNotification({
    id: uid('notif'),
    eventType: 'officer_assigned',
    priorityGroup: 'P3_MEDIUM',
    title: 'Officer Assigned',
    message: `${data.officerName} assigned to incident ${data.incidentId}`,
    timestamp: now(),
    status: 'unread',
    incidentId: data.incidentId,
    type: 'info',
  });

  return assignment;
}

export async function assignDepartment(
  incidentId: string,
  departmentId: string,
  departmentName: string,
): Promise<void> {
  await mockDelay();
  store().updateIncident(incidentId, { department: departmentName });

  logAuditEvent({
    incidentId,
    action: 'department_assigned',
    actor: store().currentUser?.name || 'system',
    details: `Department ${departmentName} assigned`,
  });
}

// ──────────────────────────────────────────────────────────────
// 4. Evidence Management
// ──────────────────────────────────────────────────────────────

export async function attachEvidence(
  incidentId: string,
  file: { filename: string; url: string; type: string; uploader: string },
): Promise<EvidenceFile> {
  await mockDelay();

  const evidence: EvidenceFile = {
    id: uid('ev'),
    incidentId,
    filename: file.filename,
    url: file.url,
    uploadedAt: now(),
    uploader: file.uploader,
    type: file.type,
  };

  logAuditEvent({
    incidentId,
    action: 'evidence_attached',
    actor: file.uploader,
    details: `File "${file.filename}" (${file.type}) uploaded`,
  });

  store().addNotification({
    id: uid('notif'),
    eventType: 'evidence_uploaded',
    priorityGroup: 'P4_INFO',
    title: 'Evidence Uploaded',
    message: `${file.filename} attached to ${incidentId}`,
    timestamp: now(),
    status: 'unread',
    incidentId,
    type: 'info',
  });

  return evidence;
}

// ──────────────────────────────────────────────────────────────
// 5. Comment Management
// ──────────────────────────────────────────────────────────────

export async function addComment(
  incidentId: string,
  author: string,
  text: string,
): Promise<Comment> {
  await mockDelay();

  const comment: Comment = {
    id: uid('cmt'),
    author,
    text,
    timestamp: now(),
  };

  const incident = store().incidents.find((i) => i.id === incidentId);
  if (incident) {
    store().updateIncident(incidentId, {
      comments: [...(incident.comments ?? []), comment],
    });
  }

  logAuditEvent({
    incidentId,
    action: 'comment_added',
    actor: author,
    details: `Comment: "${text.substring(0, 60)}${text.length > 60 ? '…' : ''}"`,
  });

  return comment;
}

// ──────────────────────────────────────────────────────────────
// 6. SLA Management
// ──────────────────────────────────────────────────────────────

export interface SLAStatus {
  severity: Severity;
  deadline: Date;
  remainingMs: number;
  status: 'good' | 'warning' | 'breached';
  percentRemaining: number;
}

export function computeSLA(incident: Incident): SLAStatus {
  const duration = SLA_DURATIONS[incident.severity];
  const createdAt = new Date(incident.reportedAt).getTime();
  const deadline = new Date(createdAt + duration);
  const remaining = deadline.getTime() - Date.now();
  const percentRemaining = Math.max(0, Math.min(100, (remaining / duration) * 100));

  let status: SLAStatus['status'] = 'good';
  if (remaining <= 0) status = 'breached';
  else if (percentRemaining <= 25) status = 'warning';

  return {
    severity: incident.severity,
    deadline,
    remainingMs: Math.max(0, remaining),
    status,
    percentRemaining,
  };
}

export function formatSLARemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ──────────────────────────────────────────────────────────────
// 7. Risk Assessment (Mock AI)
// ──────────────────────────────────────────────────────────────

export async function assessRisk(incident: Incident): Promise<RiskAssessment> {
  await mockDelay(300); // simulate AI processing

  const severityMap: Record<Severity, number> = { critical: 92, high: 74, medium: 48, low: 22 };
  const base = severityMap[incident.severity];

  const departments: Record<Category, string[]> = {
    infrastructure: ['Public Works Department', 'Municipal Engineering'],
    agriculture: ['Agriculture Department', 'Extension Services'],
    water: ['Water Supply Board', 'Public Health Engineering'],
    energy: ['Electricity Board', 'Energy Commission'],
    climate: ['Meteorological Department', 'Disaster Management'],
    environment: ['Forest Department', 'Pollution Control Board'],
    wildlife: ['Forest Department', 'Wildlife Protection'],
    disaster: ['NDMA', 'Fire Department', 'Emergency Services'],
    urban: ['Municipal Corporation', 'Urban Development'],
  };

  return {
    overallRiskScore: Math.min(100, base + Math.floor(Math.random() * 10)),
    aiConfidence: 78 + Math.floor(Math.random() * 20),
    severity: incident.severity === 'critical' ? 'Critical' : incident.severity === 'high' ? 'High' : incident.severity === 'medium' ? 'Medium' : 'Low',
    environmentalImpact: Math.floor(Math.random() * 40) + (incident.category === 'environment' ? 50 : 10),
    infrastructureImpact: Math.floor(Math.random() * 40) + (incident.category === 'infrastructure' ? 50 : 10),
    publicSafetyImpact: Math.floor(Math.random() * 30) + (incident.severity === 'critical' ? 60 : 20),
    economicImpact: Math.floor(Math.random() * 40) + 20,
    urgencyLevel: incident.severity === 'critical' ? 95 : incident.severity === 'high' ? 75 : incident.severity === 'medium' ? 50 : 25,
    priority: incident.severity === 'critical' ? 'Critical' : incident.severity === 'high' ? 'High' : incident.severity === 'medium' ? 'Medium' : 'Low',
    estimatedLoss: Math.floor(Math.random() * 500000) + 50000,
    mitigationSuggestion: generateMitigationSuggestion(incident.category),
    recommendedDepartments: departments[incident.category] || ['General Administration'],
  };
}

// ──────────────────────────────────────────────────────────────
// 8. Earth Impact Calculation (Mock)
// ──────────────────────────────────────────────────────────────

export async function calculateEarthImpact(incident: Incident): Promise<EarthImpactMetrics> {
  await mockDelay(250);

  const multiplier = incident.severity === 'critical' ? 4 : incident.severity === 'high' ? 3 : incident.severity === 'medium' ? 2 : 1;

  return {
    planetaryHealthDelta: -(multiplier * (0.5 + Math.random() * 1.5)),
    environmentalScore: 100 - multiplier * (5 + Math.floor(Math.random() * 10)),
    waterImpact: incident.category === 'water' ? multiplier * 15 : multiplier * 2,
    energyImpact: incident.category === 'energy' ? multiplier * 18 : multiplier * 3,
    agricultureImpact: incident.category === 'agriculture' ? multiplier * 20 : multiplier * 2,
    biodiversityImpact: incident.category === 'wildlife' || incident.category === 'environment' ? multiplier * 12 : multiplier * 1,
    climateImpact: incident.category === 'climate' ? multiplier * 16 : multiplier * 3,
    infrastructureImpact: incident.category === 'infrastructure' ? multiplier * 22 : multiplier * 4,
    populationAffected: Math.floor(Math.random() * 5000 * multiplier) + 100,
    estimatedRecoveryTime: multiplier >= 3 ? `${multiplier * 2} weeks` : `${multiplier * 3} days`,
  };
}

// ──────────────────────────────────────────────────────────────
// 9. Audit Logging (delegates to store, persisted)
// ──────────────────────────────────────────────────────────────

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const full: AuditLogEntry = {
    id: uid('audit'),
    timestamp: now(),
    ...entry,
  };
  // Push directly to the store array (persisted via Zustand middleware)
  (useAppStore.setState as any)((s: any) => ({ auditLogs: [full, ...(s.auditLogs ?? [])] }));
}

export async function getAuditLog(incidentId?: string): Promise<AuditLogEntry[]> {
  await mockDelay(50);
  const logs: AuditLogEntry[] = (store() as any).auditLogs ?? [];
  if (incidentId) return logs.filter((l) => l.incidentId === incidentId);
  return logs;
}

// ──────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────

function statusIcon(status: IncidentStatus): string {
  const icons: Record<IncidentStatus, string> = {
    reported: '📝',
    evidence_collection: '📸',
    ai_processing: '🤖',
    created: '🆕',
    verified: '✅',
    assigned: '👤',
    investigating: '🔍',
    resolved: '✔️',
    archived: '📦',
  };
  return icons[status] || '🔄';
}

function generateMitigationSuggestion(category: Category): string {
  const suggestions: Record<Category, string> = {
    infrastructure: 'Deploy emergency repair crew. Barricade affected area. Divert traffic through alternate routes.',
    agriculture: 'Dispatch agricultural extension team. Collect soil samples. Assess crop damage extent.',
    water: 'Shut off contaminated supply lines. Deploy mobile water purification units. Issue public advisory.',
    energy: 'Isolate affected grid section. Deploy emergency generators. Notify downstream consumers.',
    climate: 'Activate emergency weather response protocol. Issue early warnings. Pre‑position relief supplies.',
    environment: 'Halt illegal activity. Deploy forest rangers. Document evidence for prosecution.',
    wildlife: 'Cordon affected habitat. Deploy wildlife rescue team. Contact veterinary services.',
    disaster: 'Activate NDMA protocol. Evacuate affected zones. Deploy search and rescue teams.',
    urban: 'Deploy municipal rapid‑response team. Notify affected residents. Coordinate with utilities.',
  };
  return suggestions[category] || 'Investigate and deploy appropriate response team.';
}
