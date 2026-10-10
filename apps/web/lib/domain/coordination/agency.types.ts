// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-Agency Coordination Types
// ──────────────────────────────────────────────────────────────

export type AgencyCategory =
  | 'PUBLIC_WORKS'
  | 'DISASTER_MANAGEMENT'
  | 'WATER_SUPPLY'
  | 'POWER_UTILITIES'
  | 'SANITATION'
  | 'FIRE_EMERGENCY'
  | 'POLICE_SECURITY'
  | 'ENVIRONMENTAL_PROTECTION';

export interface DepartmentAgency {
  id: string;
  code: string;
  name: string;
  category: AgencyCategory;
}
