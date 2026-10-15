// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Database Enums for SQLite Compatibility
// Provides runtime constants and TypeScript types for SQLite Prisma setup
// ──────────────────────────────────────────────────────────────

export const RoleType = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  COMMANDER: 'COMMANDER',
  SUPERVISOR: 'SUPERVISOR',
  FIELD_OFFICER: 'FIELD_OFFICER',
  ANALYST: 'ANALYST',
  AUDITOR: 'AUDITOR',
  VIEWER: 'VIEWER',
  CITIZEN: 'CITIZEN',
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];

export const IncidentStatus = {
  REPORTED: 'REPORTED',
  IN_TRIAGE: 'IN_TRIAGE',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  DISPATCHED: 'DISPATCHED',
  ACTIVE: 'ACTIVE',
  CONTAINED: 'CONTAINED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const EvidenceFileType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  SENSOR_LOG: 'SENSOR_LOG',
} as const;
export type EvidenceFileType = (typeof EvidenceFileType)[keyof typeof EvidenceFileType];

export const EvidenceStatus = {
  PENDING_ANALYSIS: 'PENDING_ANALYSIS',
  ANALYZED: 'ANALYZED',
  REJECTED: 'REJECTED',
} as const;
export type EvidenceStatus = (typeof EvidenceStatus)[keyof typeof EvidenceStatus];

export const TelemetryType = {
  WATER_LEVEL: 'WATER_LEVEL',
  AIR_QUALITY: 'AIR_QUALITY',
  SOIL_MOISTURE: 'SOIL_MOISTURE',
  TRAFFIC_FLOW: 'TRAFFIC_FLOW',
  GRID_LOAD: 'GRID_LOAD',
  WEATHER: 'WEATHER',
} as const;
export type TelemetryType = (typeof TelemetryType)[keyof typeof TelemetryType];
