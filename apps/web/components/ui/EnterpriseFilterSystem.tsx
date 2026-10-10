'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SearchInput } from './Input';
import {
  Filter,
  Search,
  SlidersHorizontal,
  Bookmark,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Sparkles,
  MapPin,
  UserCheck,
  Building2,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Category, Severity, IncidentStatus, Incident } from '../../types';
import { FilterState, initialFilters, applyEnterpriseFilters } from '../../lib/utils/filter-engine';

export type { FilterState };
export { initialFilters, applyEnterpriseFilters };

export const EnterpriseFilterSystem: React.FC<{
  onFilterChange?: (filteredIncidents: Incident[]) => void;
  initialCategory?: Category | 'all';
}> = ({ onFilterChange, initialCategory }) => {
  const { incidents, savedFilters, addSavedFilter, removeSavedFilter, addToast } = useAppStore();

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilters,
    category: initialCategory || 'all',
  }));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Benz Circle',
    'Road Subsidence',
    'Water Leakage',
    'Ward 12',
  ]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...initialFilters, category: initialCategory || 'all' });
    addToast({ title: 'Filters Reset', message: 'Cleared all search and filter criteria.', type: 'info' });
  };

  // Quick Filter Chips Presets
  const applyChipPreset = (presetName: string) => {
    if (presetName === '#CRITICAL') {
      setFilters((prev) => ({ ...prev, severity: 'critical' }));
    } else if (presetName === '#UNASSIGNED') {
      setFilters((prev) => ({ ...prev, officer: 'Unassigned', status: 'reported' }));
    } else if (presetName === '#HIGH_RISK') {
      setFilters((prev) => ({ ...prev, severity: 'high', dateRange: '7days' }));
    } else if (presetName === '#TODAY') {
      setFilters((prev) => ({ ...prev, dateRange: 'today' }));
    } else if (presetName === '#MY_CASES') {
      setFilters((prev) => ({ ...prev, officer: 'Officer Lokesh' }));
    }
    addToast({ title: 'Quick Filter Applied', message: `Preset ${presetName} active.`, type: 'info' });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    addSavedFilter({
      name: newPresetName,
      category: filters.category === 'all' ? undefined : filters.category,
      severity: filters.severity === 'all' ? undefined : filters.severity,
      status: filters.status === 'all' ? undefined : filters.status,
    });
    setNewPresetName('');
    setShowSaveModal(false);
    addToast({ title: 'Preset Saved', message: `Saved filter preset "${newPresetName}".`, type: 'success' });
  };

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return applyEnterpriseFilters(incidents, filters);
  }, [incidents, filters]);

  // Cleanly propagate filtered results without render side-effects
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredIncidents);
    }
  }, [filteredIncidents, onFilterChange]);

  return (
    <Card className="flex flex-col gap-3 p-4 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP SEARCH & QUICK PRESET BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* Search Bar Input */}
        <div className="flex-1 min-w-[280px]">
          <SearchInput
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search operations by keyword, ID, location, or tag..."
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn('text-xs border-white/10 text-slate-300', showAdvanced && 'border-cyan-500 text-cyan-400 bg-cyan-950/40')}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs border-white/10 text-slate-300 hover:border-amber-500/40"
            leftIcon={<Bookmark className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setShowSaveModal(true)}
          >
            Save Preset
          </Button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── QUICK FILTER CHIPS & SAVED PRESETS ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] font-mono z-10">
        
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> QUICK CHIPS:
          </span>

          {['#CRITICAL', '#UNASSIGNED', '#HIGH_RISK', '#TODAY', '#MY_CASES'].map((chip) => (
            <button
              key={chip}
              onClick={() => applyChipPreset(chip)}
              className="px-2 py-0.5 rounded bg-[#050B14] border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 font-bold transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Saved Presets Dropdown Pills */}
        {savedFilters.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-slate-500 font-bold mr-1">PRESETS:</span>
            {savedFilters.map((sf) => (
              <div key={sf.id} className="flex items-center bg-cyan-950/40 border border-cyan-500/30 rounded px-2 py-0.5 text-cyan-300 font-bold">
                <button
                  onClick={() => {
                    if (sf.severity) updateFilter('severity', sf.severity);
                    if (sf.status) updateFilter('status', sf.status);
                    if (sf.category) updateFilter('category', sf.category);
                    addToast({ title: 'Preset Applied', message: `Applied saved filter "${sf.name}".`, type: 'info' });
                  }}
                  className="hover:underline"
                >
                  💾 {sf.name}
                </button>
                <button onClick={() => removeSavedFilter(sf.id)} className="ml-1.5 text-slate-500 hover:text-rose-400">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── EXPANDABLE ADVANCED FILTERS PANEL ── */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 z-10 text-[10px] font-mono"
          >
            {/* 1. Severity Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-rose-400" /> Severity Level
              </label>
              <select
                value={filters.severity}
                onChange={(e) => updateFilter('severity', e.target.value as any)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">🚨 Critical</option>
                <option value="high">⚠️ High</option>
                <option value="medium">⚡ Medium</option>
                <option value="low">ℹ️ Low</option>
              </select>
            </div>

            {/* 2. Status Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Workflow Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value as any)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="analyzing">Analyzing</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* 3. Category / Domain Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-400" /> Domain Module
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value as any)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All 9 Domains</option>
                <option value="infrastructure">🏗️ Infrastructure</option>
                <option value="agriculture">🌿 Agriculture</option>
                <option value="environment">🌍 Environment</option>
                <option value="disaster">🌊 Disaster</option>
                <option value="water">💧 Water</option>
                <option value="energy">⚡ Energy</option>
                <option value="urban">🏢 Urban</option>
                <option value="climate">🌎 Climate</option>
                <option value="wildlife">🦜 Wildlife</option>
              </select>
            </div>

            {/* 4. Officer Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" /> Assigned Officer
              </label>
              <select
                value={filters.officer}
                onChange={(e) => updateFilter('officer', e.target.value)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All Officers</option>
                <option value="Officer Lokesh">Officer Lokesh</option>
                <option value="Officer Rakesh">Officer Rakesh</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            {/* 5. Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value as any)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            {/* 6. Location Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Location Sector
              </label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="all">All Locations</option>
                <option value="Benz Circle">Benz Circle Ward 12</option>
                <option value="Ward 14">Ward 14 Bypass</option>
                <option value="Zone A">Zone A Central Command</option>
                <option value="Zone B">Zone B Industrial</option>
              </select>
            </div>

            {/* 7. Sort Direction */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-teal-400" /> Sort Direction
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                className="bg-[#050B14] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="newest">Newest Reported First</option>
                <option value="oldest">Oldest Reported First</option>
                <option value="severity">Highest Severity First</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAVE PRESET MODAL PROMPT ── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1220] border border-cyan-500/40 p-5 rounded-2xl max-w-sm w-full flex flex-col gap-3 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" /> Save Filter Preset
            </h3>
            <p className="text-[11px] text-slate-400">Save current filter settings as a 1-tap shortcut preset.</p>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="E.g., My Critical Road Cases"
              className="bg-[#050B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowSaveModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                Save Preset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5 z-10">
        <span>Displaying {filteredIncidents.length} matching operations across workspace</span>
        <span className="text-cyan-400 font-bold">INSTANT NON-REFRESH FILTERING</span>
      </div>
    </Card>
  );
};
