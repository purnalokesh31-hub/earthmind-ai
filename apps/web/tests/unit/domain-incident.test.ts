import { describe, it, expect } from 'vitest';
import {
  IncidentFactory,
  IncidentStatus,
  IncidentSeverity,
  InvalidIncidentStatusTransitionError,
  IncidentAlreadyArchivedError,
  IncidentValidationError,
} from '../../lib/domain/incident';

describe('Phase 6.4 — Enterprise Incident Domain Subsystem Verification', () => {
  it('should instantiate a valid Citizen Report incident aggregate', () => {
    const incident = IncidentFactory.createCitizenReport({
      title: 'Oil Spill Detected Near Harbor',
      description: 'Large chemical sheen spreading across coastal grid 4B',
      category: 'HAZMAT',
      locationName: 'Harbor Pier 9',
      lat: 12.9716,
      lng: 77.5946,
    });

    expect(incident.id).toContain('inc_');
    expect(incident.incidentNumber).toContain('EM-');
    expect(incident.title).toBe('Oil Spill Detected Near Harbor');
    expect(incident.status).toBe(IncidentStatus.CITIZEN_REPORT);
    expect(incident.severity).toBe(IncidentSeverity.MEDIUM);
    expect(incident.riskScore).toBe(50);
    expect(incident.timeline).toHaveLength(1);

    const events = incident.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('IncidentCreated');
  });

  it('should execute full 8-stage lifecycle transitions smoothly', () => {
    const incident = IncidentFactory.createCitizenReport({
      title: 'Industrial Toxic Leak',
      description: 'Chemical plume spreading near municipal reservoir',
      category: 'POLLUTION',
      locationName: 'Sector 7 Industrial Zone',
    });

    // 1. Citizen Report -> AI Processing
    incident.transitionTo(IncidentStatus.AI_PROCESSING, 'SYSTEM_AI', 'AI Vision Inference Active');
    expect(incident.status).toBe(IncidentStatus.AI_PROCESSING);

    // 2. AI Processing -> Created
    incident.transitionTo(IncidentStatus.CREATED, 'SYSTEM');
    expect(incident.status).toBe(IncidentStatus.CREATED);

    // 3. Created -> Verified
    incident.transitionTo(IncidentStatus.VERIFIED, 'usr-commander-01', 'Verified via GIS');
    expect(incident.status).toBe(IncidentStatus.VERIFIED);

    // 4. Verified -> Assigned (via assignOfficer)
    incident.assignOfficer('usr-field-01', 'usr-commander-01', 'dept-rapid', 'Dispatching unit');
    expect(incident.status).toBe(IncidentStatus.ASSIGNED);
    expect(incident.assignment?.officerId).toBe('usr-field-01');

    // 5. Assigned -> Investigating
    incident.transitionTo(IncidentStatus.INVESTIGATING, 'usr-field-01', 'Arrived on scene');
    expect(incident.status).toBe(IncidentStatus.INVESTIGATING);

    // 6. Investigating -> Resolved
    incident.resolve('usr-field-01', 'Hazard contained and neutralized');
    expect(incident.status).toBe(IncidentStatus.RESOLVED);

    // 7. Resolved -> Archived
    incident.archive('usr-commander-01', 'Case closed');
    expect(incident.status).toBe(IncidentStatus.ARCHIVED);
    expect(incident.timeline.length).toBeGreaterThanOrEqual(7);
  });

  it('should reject invalid status transitions with InvalidIncidentStatusTransitionError', () => {
    const incident = IncidentFactory.createCitizenReport({
      title: 'Illegal Waste Dumping',
      description: 'Unidentified barrels dumped in forest area',
      category: 'ILLEGAL_DUMPING',
      locationName: 'Pine Forest Trail',
    });

    // Cannot jump directly from CITIZEN_REPORT to RESOLVED
    expect(() => incident.transitionTo(IncidentStatus.RESOLVED)).toThrow(
      InvalidIncidentStatusTransitionError
    );
  });

  it('should calculate weighted risk score and record domain event', () => {
    const incident = IncidentFactory.createCitizenReport({
      title: 'Pipeline Leak',
      description: 'High pressure gas pipeline pressure drop',
      category: 'INFRASTRUCTURE',
      locationName: 'Substation B',
    });

    // DamageScore = 80, Confidence = 90 -> (80 * 0.7) + (90 * 0.3) = 56 + 27 = 83
    const risk = incident.updateRiskScore(80, 90);
    expect(risk).toBe(83);
    expect(incident.riskScore).toBe(83);
  });

  it('should prevent modifications to archived incidents with IncidentAlreadyArchivedError', () => {
    const incident = IncidentFactory.createVerifiedIncident({
      title: 'Deforestation Fire',
      description: 'Active bushfire spreading across national park',
      category: 'WILDFIRE',
      locationName: 'National Park Ridge',
    });

    incident.archive('usr-admin', 'Archived');
    expect(() => incident.assignOfficer('usr-officer')).toThrow(IncidentAlreadyArchivedError);
  });

  it('should validate creation props with IncidentValidationError', () => {
    expect(() =>
      IncidentFactory.createCitizenReport({
        title: 'AB', // Short title (<3 chars)
        description: 'Short',
        category: '',
        locationName: '',
      })
    ).toThrow(IncidentValidationError);
  });
});
