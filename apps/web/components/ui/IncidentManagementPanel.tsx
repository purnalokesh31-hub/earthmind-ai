'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge, StatusBadge } from './Badge';
import { formatDate } from '../../lib/utils';
import {
  Activity,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCheck,
  MapPin,
  FileText,
  CheckCircle2,
  MoreVertical,
  ShieldAlert,
  ArrowUpDown,
  Layers,
  Clock,
  Building2,
  Sparkles,
  FastForward,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, Severity, IncidentStatus, Category } from '../../types';

export interface IncidentManagementPanelProps {
  domain?: Category;
}

export const IncidentManagementPanel: React.FC<IncidentManagementPanelProps> = ({ domain }) => {
  const {
    incidents,
    setSelectedIncident,
    setActiveTab,
    openReportModal,
    updateIncident,
    transitionIncidentStage,
    addToast,
    openConfirmDialog,
  } = useAppStore();

  // Panel State: Grouping, Sorting, Pagination
  const [groupBy, setGroupBy] = useState<'none' | 'severity' | 'status' | 'category'>('none');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity' | 'risk'>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Target incidents for this domain
  const targetIncidents = useMemo(() => {
    return domain ? incidents.filter((i) => i.category === domain) : incidents;
  }, [incidents, domain]);

  // Compute Risk Score for each incident dynamically
  const enrichedIncidents = useMemo(() => {
    return targetIncidents.map((inc) => {
      let riskScore = 45;
      if (inc.severity === 'critical') riskScore = 94;
      else if (inc.severity === 'high') riskScore = 78;
      else if (inc.severity === 'medium') riskScore = 60;
      else riskScore = 32;

      if (inc.status === 'resolved') riskScore = 10;
      return { ...inc, riskScore };
    });
  }, [targetIncidents]);

  // Sorting
  const sortedIncidents = useMemo(() => {
    const arr = [...enrichedIncidents];
    arr.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
      if (sortBy === 'severity') {
        const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return rank[b.severity] - rank[a.severity];
      }
      if (sortBy === 'risk') return b.riskScore - a.riskScore;
      return 0;
    });
    return arr;
  }, [enrichedIncidents, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedIncidents.length / pageSize));
  const paginatedIncidents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedIncidents.slice(start, start + pageSize);
  }, [sortedIncidents, page, pageSize]);

  // Grouping
  const groupedIncidents = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, (Incident & { riskScore: number })[]> = {};
    sortedIncidents.forEach((inc) => {
      const key = groupBy === 'severity' ? inc.severity : groupBy === 'status' ? inc.status : inc.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inc);
    });
    return groups;
  }, [sortedIncidents, groupBy]);

  // Handlers for Quick Actions
  const handleViewDetails = (inc: Incident) => {
    setSelectedIncident(inc);
    setActiveTab('incidents');
    addToast({ title: 'Case Selected', message: `Opened case ${inc.id} details.`, type: 'info' });
  };

  const handleAssignOfficer = (inc: Incident) => {
    openConfirmDialog({
      title: `Assign Officer to Case ${inc.id}`,
      message: `Assign Officer Lokesh (Field Unit) as primary response officer for "${inc.title}"?`,
      confirmLabel: 'Assign Officer Lokesh',
      onConfirm: () => {
        updateIncident(inc.id, { status: 'assigned', reportedBy: 'Officer Lokesh' });
        addToast({ title: 'Officer Assigned', message: `Officer Lokesh assigned to ${inc.id}.`, type: 'success' });
      },
    });
  };

  const handleOpenMap = (inc: Incident) => {
    setSelectedIncident(inc);
    setActiveTab('map');
    addToast({ title: 'Map Centered', message: `GIS camera centered on ${inc.id} coordinates.`, type: 'info' });
  };

  const handleGenerateReport = (inc: Incident) => {
    openReportModal(inc.category, `Incident Telemetry Report — ${inc.id}: ${inc.title}`);
  };

  const handleMarkResolved = (inc: Incident) => {
    updateIncident(inc.id, { status: 'resolved' });
    addToast({ title: 'Case Resolved', message: `Incident ${inc.id} verified and marked as RESOLVED.`, type: 'success' });
  };

  const renderRow = (inc: Incident & { riskScore: number }) => (
    <motion.tr
      key={inc.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => handleViewDetails(inc)}
      className="border-b border-white/5 hover:bg-cyan-950/20 transition-all cursor-pointer group"
    >
      {/* 1. Incident ID */}
      <td className="py-3 px-3 font-mono font-bold text-xs text-cyan-400">
        {inc.id}
      </td>

      {/* 2. Title & Short Description */}
      <td className="py-3 px-3">
        <div className="flex flex-col">
          <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
            {inc.title}
          </span>
          <span className="text-[9px] text-slate-400 line-clamp-1 font-mono">{inc.description}</span>
        </div>
      </td>

      {/* 3. Severity */}
      <td className="py-3 px-3">
        <SeverityBadge severity={inc.severity} />
      </td>

      {/* 4. Category */}
      <td className="py-3 px-3">
        <CategoryBadge category={inc.category} />
      </td>

      {/* 5. Assigned Officer */}
      <td className="py-3 px-3 font-mono text-[10px]">
        {inc.reportedBy ? (
          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
            👮 {inc.reportedBy}
          </span>
        ) : (
          <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded">Unassigned</span>
        )}
      </td>

      {/* 6. Current Status */}
      <td className="py-3 px-3">
        <StatusBadge status={inc.status} />
      </td>

      {/* 7. Location */}
      <td className="py-3 px-3 text-[10px] font-mono text-slate-300">
        📍 {inc.location?.name || 'Vijayawada'}
      </td>

      {/* 8. Reported Time */}
      <td className="py-3 px-3 font-mono text-[9px] text-slate-400">
        {formatDate(inc.reportedAt)}
      </td>

      {/* 9. Last Updated */}
      <td className="py-3 px-3 font-mono text-[9px] text-slate-500">
        {formatDate(inc.updatedAt)}
      </td>

      {/* 10. Risk Score */}
      <td className="py-3 px-3 font-mono text-[10px]">
        <span className={cn(
          'px-2 py-0.5 rounded font-bold border',
          inc.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
          inc.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        )}>
          {inc.riskScore}% RISK
        </span>
      </td>

      {/* Actions Button Menu */}
      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleViewDetails(inc)}
            className="p-1 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition"
            title="View Details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAssignOfficer(inc)}
            className="p-1 rounded bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition"
            title="Assign Officer"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenMap(inc)}
            className="p-1 rounded bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition"
            title="Open Map"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => transitionIncidentStage(inc.id, 'investigating')}
            className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition"
            title="Advance Stage"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleMarkResolved(inc)}
            className="p-1 rounded bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition"
            title="Mark Resolved"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── PANEL HEADER & GROUPING CONTROLS ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Incident Management Operations Log</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  {sortedIncidents.length} CASES
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Full telemetry directory with sorting, grouping, and pagination</p>
            </div>
          </div>

          {/* Grouping & Sorting Controls */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
            
            {/* Grouping Picker */}
            <div className="flex items-center gap-1 bg-[#050B14] p-1 rounded-xl border border-white/10">
              <span className="text-slate-500 font-bold px-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" /> GROUP:
              </span>
              {(['none', 'severity', 'status', 'category'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={cn(
                    'px-2 py-0.5 rounded uppercase font-bold transition',
                    groupBy === g ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sorting Picker */}
            <div className="flex items-center gap-1 bg-[#050B14] p-1 rounded-xl border border-white/10">
              <span className="text-slate-500 font-bold px-2 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-teal-400" /> SORT:
              </span>
              {(['newest', 'oldest', 'severity', 'risk'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    'px-2 py-0.5 rounded uppercase font-bold transition',
                    sortBy === s ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── INCIDENT MANAGEMENT OPERATIONS TABLE ── */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#050B14] z-10 relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#070D18] text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Reported</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupBy === 'none' ? (
                paginatedIncidents.map(renderRow)
              ) : (
                Object.entries(groupedIncidents || {}).map(([groupKey, items]) => (
                  <React.Fragment key={groupKey}>
                    <tr className="bg-cyan-950/40 border-y border-cyan-500/20 text-[10px] font-mono font-bold uppercase text-cyan-300">
                      <td colSpan={11} className="py-2 px-3">
                        📂 GROUP: {groupKey} ({items.length} Cases)
                      </td>
                    </tr>
                    {items.map(renderRow)}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          {sortedIncidents.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              📋 No operations recorded matching current filters.
            </div>
          )}
        </div>
      </div>

      {/* ── PAGINATION CONTROLS & FOOTER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-400 z-10 relative">
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-[#050B14] border border-white/10 rounded px-2 py-1 text-slate-200 outline-none"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={20}>20 per page</option>
          </select>
          <span className="text-slate-500">Showing page {page} of {totalPages}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded bg-[#050B14] border border-white/10 text-slate-300 hover:border-cyan-500/40 disabled:opacity-40 font-bold transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>

          <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded bg-[#050B14] border border-white/10 text-slate-300 hover:border-cyan-500/40 disabled:opacity-40 font-bold transition flex items-center gap-1"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Card>
  );
};
