import { useMemo, useCallback } from 'react';
import { useAppStore } from '../stores/app-store';
import type { Category, Severity, IncidentStatus } from '../types';

export interface UseIncidentsOptions {
  category?: Category | 'all';
  severity?: Severity | 'all';
  status?: IncidentStatus | 'all';
  searchQuery?: string;
}

export function useIncidents(options: UseIncidentsOptions = {}) {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    addIncident,
    updateIncident,
    pinnedIncidentIds,
    togglePinIncident,
    addToast,
  } = useAppStore();

  const {
    category = 'all',
    severity = 'all',
    status = 'all',
    searchQuery = '',
  } = options;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((c) => {
      const matchCat = category === 'all' || c.category === category;
      const matchSev = severity === 'all' || c.severity === severity;
      const matchStatus = status === 'all' || c.status === status;
      const locName = c.location?.name || (c as any).location_name || '';
      const matchSearch =
        !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSev && matchStatus && matchSearch;
    });
  }, [incidents, category, severity, status, searchQuery]);

  const pinnedIncidents = useMemo(() => {
    return filteredIncidents.filter((c) => pinnedIncidentIds.includes(c.id));
  }, [filteredIncidents, pinnedIncidentIds]);

  const unpinnedIncidents = useMemo(() => {
    return filteredIncidents.filter((c) => !pinnedIncidentIds.includes(c.id));
  }, [filteredIncidents, pinnedIncidentIds]);

  const handleTogglePin = useCallback(
    (id: string) => {
      togglePinIncident(id);
      const isPinned = pinnedIncidentIds.includes(id);
      addToast({
        title: isPinned ? 'Case Unpinned' : 'Case Pinned',
        message: `Incident ${id} has been ${isPinned ? 'removed from' : 'pinned to'} your priority board.`,
        type: 'info',
      });
    },
    [togglePinIncident, pinnedIncidentIds, addToast]
  );

  return {
    incidents: filteredIncidents,
    pinnedIncidents,
    unpinnedIncidents,
    selectedIncident,
    setSelectedIncident,
    addIncident,
    updateIncident,
    togglePin: handleTogglePin,
    totalCount: filteredIncidents.length,
  };
}
