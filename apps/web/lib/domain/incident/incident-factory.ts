// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Domain Factory
// Factory Pattern for Instantiating Validated Incident Aggregate Roots
// ──────────────────────────────────────────────────────────────

import { Incident, IncidentProps } from './incident.entity';
import { IncidentStatus, IncidentSeverity } from './incident-status';
import { IncidentValidator, CreateIncidentProps } from './incident.validator';
import { IncidentCreatedEvent } from './incident-events';

export class IncidentFactory {
  private static generateId(): string {
    return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private static generateIncidentNumber(): string {
    const seq = Math.floor(100 + Math.random() * 900);
    return `EM-${new Date().getFullYear()}-${seq}`;
  }

  /**
   * Instantiates a new Incident in CITIZEN_REPORT initial lifecycle state.
   */
  static createCitizenReport(props: CreateIncidentProps): Incident {
    IncidentValidator.validateCreateProps(props);

    const now = new Date();
    const id = this.generateId();
    const incidentNumber = this.generateIncidentNumber();

    const incidentProps: IncidentProps = {
      id,
      incidentNumber,
      title: props.title,
      description: props.description,
      status: IncidentStatus.CITIZEN_REPORT,
      severity: props.severity || IncidentSeverity.MEDIUM,
      category: props.category,
      riskScore: 50,
      locationName: props.locationName,
      lat: props.lat,
      lng: props.lng,
      departmentId: props.departmentId,
      reportedByUserId: props.reportedByUserId,
      evidenceIds: [],
      timeline: [
        {
          id: `tl_${Date.now()}_init`,
          timestamp: now,
          previousStatus: IncidentStatus.CITIZEN_REPORT,
          newStatus: IncidentStatus.CITIZEN_REPORT,
          changedByUserId: props.reportedByUserId || undefined,
          note: 'Citizen report submitted',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const incident = new Incident(incidentProps);

    // Record Created Domain Event
    const event: IncidentCreatedEvent = {
      eventId: `evt_${Date.now()}_created`,
      eventType: 'IncidentCreated',
      incidentId: id,
      incidentNumber,
      title: props.title,
      status: IncidentStatus.CITIZEN_REPORT,
      severity: incidentProps.severity,
      riskScore: 50,
      reportedByUserId: props.reportedByUserId || undefined,
      occurredAt: now,
    };
    (incident as any).domainEvents.push(event);

    return incident;
  }

  /**
   * Instantiates an AI-Processed Incident with calculated risk score.
   */
  static createAiProcessedIncident(
    props: CreateIncidentProps,
    damageScore = 80,
    confidence = 90
  ): Incident {
    const incident = this.createCitizenReport(props);
    incident.transitionTo(IncidentStatus.AI_PROCESSING, 'SYSTEM_AI', 'AI Vision Inference Complete');
    incident.updateRiskScore(damageScore, confidence);
    return incident;
  }

  /**
   * Instantiates a Standard Verified Incident ready for dispatch.
   */
  static createVerifiedIncident(props: CreateIncidentProps): Incident {
    const incident = this.createCitizenReport(props);
    incident.transitionTo(IncidentStatus.CREATED, props.reportedByUserId || undefined);
    incident.transitionTo(IncidentStatus.VERIFIED, 'SYSTEM_VERIFIER', 'Incident verified by rules engine');
    return incident;
  }

  /**
   * Reconstitutes an existing Incident Aggregate Root from database snapshot.
   */
  static reconstitute(snapshot: IncidentProps): Incident {
    return new Incident(snapshot);
  }
}
