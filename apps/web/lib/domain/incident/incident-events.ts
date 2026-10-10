// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Domain Events
// Event-Driven Architecture Contracts for Domain Aggregate State Changes
// ──────────────────────────────────────────────────────────────

import { IncidentStatus, IncidentSeverity } from './incident-status';

export interface IncidentDomainEvent {
  eventId: string;
  eventType: string;
  incidentId: string;
  occurredAt: Date;
  metadata?: Record<string, any>;
}

export interface IncidentCreatedEvent extends IncidentDomainEvent {
  eventType: 'IncidentCreated';
  incidentNumber: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  riskScore: number;
  reportedByUserId?: string;
}

export interface IncidentStatusChangedEvent extends IncidentDomainEvent {
  eventType: 'IncidentStatusChanged';
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changedByUserId?: string;
  note?: string;
}

export interface IncidentAssignedEvent extends IncidentDomainEvent {
  eventType: 'IncidentAssigned';
  officerId: string;
  departmentId?: string;
  assignedByUserId?: string;
  note?: string;
}

export interface IncidentRiskCalculatedEvent extends IncidentDomainEvent {
  eventType: 'IncidentRiskCalculated';
  previousRiskScore: number;
  newRiskScore: number;
  damageScore: number;
  aiConfidence: number;
}

export interface IncidentResolvedEvent extends IncidentDomainEvent {
  eventType: 'IncidentResolved';
  resolvedByUserId?: string;
  note?: string;
}

export interface IncidentArchivedEvent extends IncidentDomainEvent {
  eventType: 'IncidentArchived';
  archivedByUserId?: string;
  note?: string;
}
