// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Incident Status & Lifecycle State Machine
// Pure Domain Module (No External Framework Dependencies)
// ──────────────────────────────────────────────────────────────

export enum IncidentStatus {
  CITIZEN_REPORT = 'CITIZEN_REPORT',
  AI_PROCESSING = 'AI_PROCESSING',
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED',
}

export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// ── Allowed Lifecycle Transitions ─────────────────────────────
const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.CITIZEN_REPORT]: [
    IncidentStatus.AI_PROCESSING,
    IncidentStatus.CREATED,
    IncidentStatus.ACTIVE,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.AI_PROCESSING]: [
    IncidentStatus.CREATED,
    IncidentStatus.VERIFIED,
    IncidentStatus.ACTIVE,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.CREATED]: [
    IncidentStatus.VERIFIED,
    IncidentStatus.ASSIGNED,
    IncidentStatus.ACTIVE,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.ACTIVE]: [
    IncidentStatus.VERIFIED,
    IncidentStatus.ASSIGNED,
    IncidentStatus.INVESTIGATING,
    IncidentStatus.RESOLVED,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.VERIFIED]: [
    IncidentStatus.ASSIGNED,
    IncidentStatus.INVESTIGATING,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.ASSIGNED]: [
    IncidentStatus.INVESTIGATING,
    IncidentStatus.RESOLVED,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.INVESTIGATING]: [
    IncidentStatus.RESOLVED,
    IncidentStatus.ASSIGNED,
    IncidentStatus.ARCHIVED,
  ],
  [IncidentStatus.RESOLVED]: [
    IncidentStatus.ARCHIVED,
    IncidentStatus.INVESTIGATING, // Re-opened if inspection fails
    IncidentStatus.ACTIVE,
  ],
  [IncidentStatus.ARCHIVED]: [
    IncidentStatus.ACTIVE, // Restored state
  ],
};

/**
 * Validates whether a lifecycle transition from current to next status is permitted.
 */
export function canTransition(current: IncidentStatus, next: IncidentStatus): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}
