// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Aggregate Root & Sub-Aggregates
// Pure Domain Model (Decoupled from Prisma Client & Next.js Framework)
// ──────────────────────────────────────────────────────────────

import { IncidentStatus, IncidentSeverity, canTransition } from './incident-status';
import {
  InvalidIncidentStatusTransitionError,
  IncidentAlreadyArchivedError,
} from './incident-errors';
import { IncidentValidator } from './incident.validator';
import {
  IncidentDomainEvent,
  IncidentCreatedEvent,
  IncidentStatusChangedEvent,
  IncidentAssignedEvent,
  IncidentRiskCalculatedEvent,
  IncidentResolvedEvent,
  IncidentArchivedEvent,
} from './incident-events';

export interface IncidentTimelineEntry {
  id: string;
  timestamp: Date;
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changedByUserId?: string;
  note?: string;
}

export interface IncidentAssignment {
  officerId: string;
  assignedAt: Date;
  assignedByUserId?: string;
  departmentId?: string;
  note?: string;
}

export interface IncidentProps {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  category: string;
  riskScore: number;
  locationName: string;
  lat?: number | null;
  lng?: number | null;
  departmentId?: string | null;
  reportedByUserId?: string | null;
  evidenceIds?: string[];
  assignment?: IncidentAssignment | null;
  timeline?: IncidentTimelineEntry[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class Incident {
  private props: IncidentProps;
  private domainEvents: IncidentDomainEvent[] = [];

  constructor(props: IncidentProps) {
    this.props = {
      ...props,
      evidenceIds: props.evidenceIds || [],
      timeline: props.timeline || [],
      metadata: props.metadata || {},
    };
  }

  // ── Getters ──────────────────────────────────────────────────
  get id(): string { return this.props.id; }
  get incidentNumber(): string { return this.props.incidentNumber; }
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get status(): IncidentStatus { return this.props.status; }
  get severity(): IncidentSeverity { return this.props.severity; }
  get category(): string { return this.props.category; }
  get riskScore(): number { return this.props.riskScore; }
  get locationName(): string { return this.props.locationName; }
  get lat(): number | null | undefined { return this.props.lat; }
  get lng(): number | null | undefined { return this.props.lng; }
  get departmentId(): string | null | undefined { return this.props.departmentId; }
  get reportedByUserId(): string | null | undefined { return this.props.reportedByUserId; }
  get evidenceIds(): string[] { return [...(this.props.evidenceIds || [])]; }
  get assignment(): IncidentAssignment | null | undefined { return this.props.assignment; }
  get timeline(): IncidentTimelineEntry[] { return [...(this.props.timeline || [])]; }
  get metadata(): Record<string, any> { return { ...this.props.metadata }; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ── Domain Methods ───────────────────────────────────────────

  /**
   * Transitions the incident lifecycle status.
   */
  transitionTo(nextStatus: IncidentStatus, changedByUserId?: string, note?: string): void {
    if (this.props.status === IncidentStatus.ARCHIVED) {
      throw new IncidentAlreadyArchivedError(this.id);
    }

    if (!canTransition(this.props.status, nextStatus)) {
      throw new InvalidIncidentStatusTransitionError(this.props.status, nextStatus);
    }

    const previousStatus = this.props.status;
    this.props.status = nextStatus;
    this.props.updatedAt = new Date();

    // Record Timeline Entry Aggregate
    const timelineEntry: IncidentTimelineEntry = {
      id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      previousStatus,
      newStatus: nextStatus,
      changedByUserId,
      note,
    };
    this.props.timeline?.push(timelineEntry);

    // Record Domain Event
    const event: IncidentStatusChangedEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'IncidentStatusChanged',
      incidentId: this.id,
      previousStatus,
      newStatus: nextStatus,
      changedByUserId,
      note,
      occurredAt: new Date(),
    };
    this.domainEvents.push(event);
  }

  /**
   * Assigns an operational officer to the incident.
   */
  assignOfficer(officerId: string, assignedByUserId?: string, departmentId?: string, note?: string): void {
    if (this.props.status === IncidentStatus.ARCHIVED) {
      throw new IncidentAlreadyArchivedError(this.id);
    }

    const assignment: IncidentAssignment = {
      officerId,
      assignedAt: new Date(),
      assignedByUserId,
      departmentId: departmentId || this.props.departmentId || undefined,
      note,
    };

    this.props.assignment = assignment;
    this.props.updatedAt = new Date();

    // Auto-transition status to ASSIGNED if currently CREATED or VERIFIED
    if (
      this.props.status === IncidentStatus.CREATED ||
      this.props.status === IncidentStatus.VERIFIED
    ) {
      this.transitionTo(IncidentStatus.ASSIGNED, assignedByUserId, note || `Assigned to officer ${officerId}`);
    }

    const event: IncidentAssignedEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'IncidentAssigned',
      incidentId: this.id,
      officerId,
      departmentId: assignment.departmentId,
      assignedByUserId,
      note,
      occurredAt: new Date(),
    };
    this.domainEvents.push(event);
  }

  /**
   * Updates risk score using AI damage score & confidence weighted calculation.
   */
  updateRiskScore(damageScore: number, aiConfidence: number): number {
    const previousRiskScore = this.props.riskScore;
    // Formula: Risk = (DamageScore * 0.7) + (AiConfidence * 0.3)
    const newRiskScore = Math.min(100, Math.max(0, Math.round(damageScore * 0.7 + aiConfidence * 0.3)));
    IncidentValidator.validateRiskScore(newRiskScore);

    this.props.riskScore = newRiskScore;
    this.props.updatedAt = new Date();

    const event: IncidentRiskCalculatedEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'IncidentRiskCalculated',
      incidentId: this.id,
      previousRiskScore,
      newRiskScore,
      damageScore,
      aiConfidence,
      occurredAt: new Date(),
    };
    this.domainEvents.push(event);

    return newRiskScore;
  }

  /**
   * Attaches an evidence asset ID to the incident aggregate.
   */
  addEvidence(evidenceId: string): void {
    if (!this.props.evidenceIds?.includes(evidenceId)) {
      this.props.evidenceIds?.push(evidenceId);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Resolves the incident.
   */
  resolve(resolvedByUserId?: string, note?: string): void {
    this.transitionTo(IncidentStatus.RESOLVED, resolvedByUserId, note || 'Incident resolved');

    const event: IncidentResolvedEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'IncidentResolved',
      incidentId: this.id,
      resolvedByUserId,
      note,
      occurredAt: new Date(),
    };
    this.domainEvents.push(event);
  }

  /**
   * Archives the incident (Terminal Lifecycle State).
   */
  archive(archivedByUserId?: string, note?: string): void {
    this.transitionTo(IncidentStatus.ARCHIVED, archivedByUserId, note || 'Incident archived');

    const event: IncidentArchivedEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'IncidentArchived',
      incidentId: this.id,
      archivedByUserId,
      note,
      occurredAt: new Date(),
    };
    this.domainEvents.push(event);
  }

  // ── Event Sourcing & Domain Events Dispatch ──────────────────
  getUncommittedEvents(): IncidentDomainEvent[] {
    return [...this.domainEvents];
  }

  clearEvents(): void {
    this.domainEvents = [];
  }

  toSnapshot(): IncidentProps {
    return JSON.parse(JSON.stringify(this.props));
  }
}
