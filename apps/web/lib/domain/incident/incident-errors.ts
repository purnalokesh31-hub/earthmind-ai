// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Domain Custom Errors
// Pure Domain Module (Decoupled from HTTP & Infrastructure)
// ──────────────────────────────────────────────────────────────

import { IncidentStatus } from './incident-status';

export class IncidentDomainError extends Error {
  constructor(message: string, public readonly errorCode = 'INCIDENT_DOMAIN_ERROR') {
    super(message);
    this.name = 'IncidentDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidIncidentStatusTransitionError extends IncidentDomainError {
  constructor(currentStatus: IncidentStatus, targetStatus: IncidentStatus) {
    super(
      `Cannot transition incident status from '${currentStatus}' to '${targetStatus}'`,
      'INVALID_STATUS_TRANSITION'
    );
    this.name = 'InvalidIncidentStatusTransitionError';
  }
}

export class IncidentValidationError extends IncidentDomainError {
  constructor(message: string, public readonly validationErrors: string[] = []) {
    super(message, 'INCIDENT_VALIDATION_ERROR');
    this.name = 'IncidentValidationError';
  }
}

export class IncidentAssignmentError extends IncidentDomainError {
  constructor(message: string) {
    super(message, 'INCIDENT_ASSIGNMENT_ERROR');
    this.name = 'IncidentAssignmentError';
  }
}

export class IncidentAlreadyArchivedError extends IncidentDomainError {
  constructor(incidentId: string) {
    super(`Incident '${incidentId}' is archived and cannot be modified`, 'INCIDENT_ALREADY_ARCHIVED');
    this.name = 'IncidentAlreadyArchivedError';
  }
}
