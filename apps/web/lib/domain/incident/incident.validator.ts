// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Domain Validator
// Pure Domain Data Validation Rules
// ──────────────────────────────────────────────────────────────

import { IncidentSeverity } from './incident-status';
import { IncidentValidationError } from './incident-errors';

export interface CreateIncidentProps {
  title: string;
  description: string;
  category: string;
  severity?: IncidentSeverity;
  locationName: string;
  lat?: number | null;
  lng?: number | null;
  departmentId?: string | null;
  reportedByUserId?: string | null;
}

export class IncidentValidator {
  static validateCreateProps(props: CreateIncidentProps): void {
    const errors: string[] = [];

    if (!props.title || props.title.trim().length < 3 || props.title.trim().length > 150) {
      errors.push('Title must be between 3 and 150 characters');
    }

    if (!props.description || props.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!props.category || props.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!props.locationName || props.locationName.trim().length === 0) {
      errors.push('Location name is required');
    }

    if (props.lat !== undefined && props.lat !== null) {
      if (props.lat < -90 || props.lat > 90) {
        errors.push('Latitude must be between -90 and 90 degrees');
      }
    }

    if (props.lng !== undefined && props.lng !== null) {
      if (props.lng < -180 || props.lng > 180) {
        errors.push('Longitude must be between -180 and 180 degrees');
      }
    }

    if (errors.length > 0) {
      throw new IncidentValidationError('Incident domain validation failed', errors);
    }
  }

  static validateRiskScore(riskScore: number): void {
    if (riskScore < 0 || riskScore > 100) {
      throw new IncidentValidationError('Risk score must be between 0 and 100');
    }
  }
}
