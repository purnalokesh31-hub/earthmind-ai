// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Analytics Service
// ──────────────────────────────────────────────────────────────
// Computes derived analytics and KPIs from the incident store.
// Current: Real‑time computation from Zustand state.
// Future: Pre‑aggregated data from backend analytics pipeline.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type {
  Incident,
  Severity,
  Category,
  IncidentStatus,
  KPI,
} from '../../types';

const store = () => useAppStore.getState();
const mockDelay = (ms = 80): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────────────────────
// 1. Core KPIs
// ──────────────────────────────────────────────────────────────

export async function getDashboardKPIs(): Promise<KPI[]> {
  await mockDelay();
  const incidents = store().incidents;
  const total = incidents.length;
  const active = incidents.filter((i) => !['resolved', 'archived'].includes(i.status)).length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  const critical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'archived').length;

  return [
    { label: 'Total Incidents', value: total.toString(), trend: '+12%', up: true, icon: '📊' },
    { label: 'Active Cases', value: active.toString(), trend: active > 5 ? '+8%' : '-3%', up: active > 5, icon: '⚡' },
    { label: 'Resolved', value: resolved.toString(), trend: '+15%', up: true, icon: '✅' },
    { label: 'Critical Active', value: critical.toString(), trend: critical > 2 ? '+5%' : '-10%', up: critical <= 2, icon: '🔴' },
  ];
}

// ──────────────────────────────────────────────────────────────
// 2. Distribution Analytics
// ──────────────────────────────────────────────────────────────

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export async function getIncidentsBySeverity(): Promise<DistributionItem[]> {
  await mockDelay();
  const incidents = store().incidents;
  const total = incidents.length || 1;
  const colors: Record<Severity, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

  return (['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => {
    const count = incidents.filter((i) => i.severity === s).length;
    return { label: s.charAt(0).toUpperCase() + s.slice(1), count, percentage: Math.round((count / total) * 100), color: colors[s] };
  });
}

export async function getIncidentsByCategory(): Promise<DistributionItem[]> {
  await mockDelay();
  const incidents = store().incidents;
  const total = incidents.length || 1;
  const colors: Record<Category, string> = {
    infrastructure: '#3b82f6', agriculture: '#22c55e', water: '#06b6d4', energy: '#eab308',
    climate: '#8b5cf6', environment: '#10b981', wildlife: '#f97316', disaster: '#ef4444', urban: '#6366f1',
  };

  const categories = Array.from(new Set(incidents.map((i) => i.category))) as Category[];
  return categories.map((c) => {
    const count = incidents.filter((i) => i.category === c).length;
    return { label: c.charAt(0).toUpperCase() + c.slice(1), count, percentage: Math.round((count / total) * 100), color: colors[c] || '#6b7280' };
  });
}

export async function getIncidentsByStatus(): Promise<DistributionItem[]> {
  await mockDelay();
  const incidents = store().incidents;
  const total = incidents.length || 1;

  const statusLabels: Record<IncidentStatus, string> = {
    reported: 'Reported', evidence_collection: 'Evidence Collection', ai_processing: 'AI Processing',
    created: 'Created', verified: 'Verified', assigned: 'Assigned',
    investigating: 'Investigating', resolved: 'Resolved', archived: 'Archived',
  };

  const statuses = Array.from(new Set(incidents.map((i) => i.status))) as IncidentStatus[];
  return statuses.map((s) => {
    const count = incidents.filter((i) => i.status === s).length;
    return { label: statusLabels[s], count, percentage: Math.round((count / total) * 100), color: '#6b7280' };
  });
}

// ──────────────────────────────────────────────────────────────
// 3. Trend Analytics
// ──────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  count: number;
}

export async function getIncidentTrend(days = 30): Promise<TrendPoint[]> {
  await mockDelay();
  // Mock: generate a realistic trend line
  const points: TrendPoint[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    points.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8) + 2,
    });
  }
  return points;
}

export async function getResolutionTrend(days = 30): Promise<TrendPoint[]> {
  await mockDelay();
  const points: TrendPoint[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    points.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 6) + 1,
    });
  }
  return points;
}

// ──────────────────────────────────────────────────────────────
// 4. Performance Metrics
// ──────────────────────────────────────────────────────────────

export interface PerformanceMetrics {
  avgResolutionTimeHours: number;
  slaCompliancePercent: number;
  firstResponseTimeMinutes: number;
  citizenSatisfactionScore: number;
  aiAccuracyPercent: number;
  activeFieldUnits: number;
}

export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  await mockDelay();
  return {
    avgResolutionTimeHours: 4.2 + Math.random() * 2,
    slaCompliancePercent: 87 + Math.floor(Math.random() * 10),
    firstResponseTimeMinutes: 12 + Math.floor(Math.random() * 8),
    citizenSatisfactionScore: 4.2 + Math.random() * 0.6,
    aiAccuracyPercent: 89 + Math.floor(Math.random() * 8),
    activeFieldUnits: 5 + Math.floor(Math.random() * 4),
  };
}

// ──────────────────────────────────────────────────────────────
// 5. Earth Health / Planetary Index
// ──────────────────────────────────────────────────────────────

export interface PlanetaryHealthIndex {
  overallScore: number;
  waterScore: number;
  airScore: number;
  soilScore: number;
  biodiversityScore: number;
  energyScore: number;
  urbanScore: number;
  trendDirection: 'improving' | 'stable' | 'declining';
}

export async function getPlanetaryHealthIndex(): Promise<PlanetaryHealthIndex> {
  await mockDelay();
  const incidents = store().incidents;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const base = 78 - criticalCount * 3;

  return {
    overallScore: Math.max(40, Math.min(100, base + Math.floor(Math.random() * 5))),
    waterScore: 72 + Math.floor(Math.random() * 15),
    airScore: 68 + Math.floor(Math.random() * 20),
    soilScore: 75 + Math.floor(Math.random() * 12),
    biodiversityScore: 65 + Math.floor(Math.random() * 18),
    energyScore: 80 + Math.floor(Math.random() * 10),
    urbanScore: 70 + Math.floor(Math.random() * 15),
    trendDirection: criticalCount > 2 ? 'declining' : criticalCount > 0 ? 'stable' : 'improving',
  };
}

// ──────────────────────────────────────────────────────────────
// 6. Department Performance
// ──────────────────────────────────────────────────────────────

export interface DepartmentPerformance {
  departmentName: string;
  totalAssigned: number;
  resolved: number;
  avgResponseHours: number;
  slaCompliance: number;
}

export async function getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
  await mockDelay();
  return [
    { departmentName: 'Public Works Department', totalAssigned: 24, resolved: 19, avgResponseHours: 3.2, slaCompliance: 92 },
    { departmentName: 'Water Supply Board', totalAssigned: 18, resolved: 15, avgResponseHours: 4.5, slaCompliance: 88 },
    { departmentName: 'Fire & Emergency Services', totalAssigned: 12, resolved: 11, avgResponseHours: 1.8, slaCompliance: 96 },
    { departmentName: 'Agriculture Department', totalAssigned: 15, resolved: 10, avgResponseHours: 6.2, slaCompliance: 78 },
    { departmentName: 'Forest Department', totalAssigned: 8, resolved: 6, avgResponseHours: 5.8, slaCompliance: 82 },
    { departmentName: 'Municipal Corporation', totalAssigned: 20, resolved: 16, avgResponseHours: 3.8, slaCompliance: 90 },
  ];
}
