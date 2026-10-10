// ──────────────────────────────────────────────────────────────
// EarthMind PIOS v1.0 — Shared Constants
// ──────────────────────────────────────────────────────────────

export const APP_NAME = 'EarthMind PIOS';
export const APP_VERSION = 'v1.0.0';

export const STORAGE_KEYS = {
  AUTH_STORE: 'earthmind-auth-storage-v4',
  THEME: 'earthmind-theme',
  INCIDENTS_CACHE: 'earthmind-incidents-cache',
} as const;

export const API_ENDPOINTS = {
  INCIDENTS: '/api/incidents',
  ANALYTICS: '/api/analytics',
  REPORTS: '/api/reports',
  AI_COPILOT: '/api/copilot',
} as const;

export const DEFAULT_MAP_CENTER = {
  lat: 16.5062,
  lng: 80.6480,
  zoom: 12,
  name: 'Vijayawada Metropolitan Region',
} as const;

export const INCIDENT_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const INCIDENT_STATUSES = ['reported', 'analyzing', 'assigned', 'in_progress', 'resolved'] as const;

export const DOMAIN_CATEGORIES = [
  'infrastructure',
  'agriculture',
  'environment',
  'disaster',
  'water',
  'energy',
  'urban',
  'climate',
  'wildlife',
] as const;
