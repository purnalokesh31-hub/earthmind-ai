// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Pure Command Center Filter Engine
// ──────────────────────────────────────────────────────────────

import type { Category, Severity, IncidentStatus, Incident } from '../../types';

export interface FilterState {
  search: string;
  severity: 'all' | Severity;
  status: 'all' | IncidentStatus;
  category: 'all' | Category;
  department: string;
  officer: string;
  dateRange: 'all' | 'today' | '7days' | '30days';
  location: string;
  sortBy: 'newest' | 'oldest' | 'severity' | 'sla';
}

export const initialFilters: FilterState = {
  search: '',
  severity: 'all',
  status: 'all',
  category: 'all',
  department: 'all',
  officer: 'all',
  dateRange: 'all',
  location: 'all',
  sortBy: 'newest',
};

export function applyEnterpriseFilters(incidents: Incident[], filters: FilterState): Incident[] {
  const result = incidents.filter((inc) => {
    // Keyword search
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      const matchTitle = inc.title?.toLowerCase().includes(query);
      const matchId = inc.id?.toLowerCase().includes(query);
      const matchDesc = inc.description?.toLowerCase().includes(query);
      const matchLoc = typeof inc.location === 'object' && inc.location?.name
        ? inc.location.name.toLowerCase().includes(query)
        : typeof inc.location === 'string'
        ? (inc.location as string).toLowerCase().includes(query)
        : false;
      const matchOfficer = inc.reportedBy?.toLowerCase().includes(query);
      if (!matchTitle && !matchId && !matchDesc && !matchLoc && !matchOfficer) {
        return false;
      }
    }

    // Severity filter
    if (filters.severity !== 'all' && inc.severity !== filters.severity) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && inc.status !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && inc.category !== filters.category) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all' && inc.reportedAt) {
      const reportDate = new Date(inc.reportedAt).getTime();
      const now = Date.now();
      if (filters.dateRange === 'today') {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        if (reportDate < oneDayAgo) return false;
      } else if (filters.dateRange === '7days') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (reportDate < sevenDaysAgo) return false;
      } else if (filters.dateRange === '30days') {
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (reportDate < thirtyDaysAgo) return false;
      }
    }

    // Officer filter
    if (filters.officer !== 'all' && inc.reportedBy !== filters.officer) {
      return false;
    }

    return true;
  });

  // Sorting
  return result.sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime();
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.reportedAt || 0).getTime() - new Date(b.reportedAt || 0).getTime();
    }
    if (filters.sortBy === 'severity') {
      const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return (rank[b.severity] || 0) - (rank[a.severity] || 0);
    }
    return 0;
  });
}
