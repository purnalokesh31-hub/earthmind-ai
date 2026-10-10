import { describe, it, expect } from 'vitest';
import {
  CreateIncidentSchema,
  UpdateIncidentSchema,
  AssignOfficerSchema,
  UpdateIncidentStatusSchema,
  MergeIncidentSchema,
  ArchiveIncidentSchema,
  RestoreIncidentSchema,
} from '../../lib/server/validation/incident.schema';
import { validate } from '../../lib/server/validation/validate';

describe('Phase 6.4 — Enterprise Incident Validation System', () => {
  it('should validate valid CreateIncident payload and reject invalid payload with field errors', () => {
    const validData = {
      title: 'Chemical Leak in Sector 4',
      description: 'Dangerous ammonia vapor release detected by automated sensors',
      category: 'HAZMAT',
      locationName: 'North Chemical Terminal',
      severity: 'CRITICAL',
    };

    const validResult = validate(CreateIncidentSchema, validData);
    expect(validResult.success).toBe(true);

    const invalidData = {
      title: 'Ab', // Too short (< 3 chars)
      description: 'Short', // Too short (< 10 chars)
      category: '', // Empty
    };

    const invalidResult = validate(CreateIncidentSchema, invalidData);
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.response.status).toBe(400);
    }
  });

  it('should validate UpdateIncident payload and require at least one field', () => {
    const validUpdate = { title: 'Updated Title' };
    expect(validate(UpdateIncidentSchema, validUpdate).success).toBe(true);

    const emptyUpdate = {};
    expect(validate(UpdateIncidentSchema, emptyUpdate).success).toBe(false);
  });

  it('should validate AssignOfficer payload', () => {
    const validAssign = { officerId: 'usr-officer-99', note: 'Immediate dispatch' };
    expect(validate(AssignOfficerSchema, validAssign).success).toBe(true);

    const invalidAssign = { officerId: '' };
    expect(validate(AssignOfficerSchema, invalidAssign).success).toBe(false);
  });

  it('should validate UpdateIncidentStatus payload', () => {
    const validStatus = { status: 'INVESTIGATING', note: 'On scene' };
    expect(validate(UpdateIncidentStatusSchema, validStatus).success).toBe(true);

    const invalidStatus = { status: 'a' }; // too short
    expect(validate(UpdateIncidentStatusSchema, invalidStatus).success).toBe(false);
  });

  it('should validate MergeIncident payload', () => {
    const validMerge = { duplicateIncidentId: 'inc-dup-101' };
    expect(validate(MergeIncidentSchema, validMerge).success).toBe(true);

    const invalidMerge = { duplicateIncidentId: '' };
    expect(validate(MergeIncidentSchema, invalidMerge).success).toBe(false);
  });

  it('should validate ArchiveIncident and RestoreIncident optional payloads', () => {
    expect(validate(ArchiveIncidentSchema, { reason: 'Duplicate duplicate' }).success).toBe(true);
    expect(validate(ArchiveIncidentSchema, {}).success).toBe(true);
    expect(validate(RestoreIncidentSchema, { note: 'Restored by admin' }).success).toBe(true);
  });
});
