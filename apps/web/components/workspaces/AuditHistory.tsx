'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  Download,
  ExternalLink,
  Activity,
  Zap,
  Tag,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AuditLogEntry } from '../../types';

export const AuditHistory: React.FC = () => {
  const { auditLogs, incidents, setSelectedIncident, setActiveTab, addToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Filter logs by search and event type
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        (log.event && log.event.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.department && log.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.incidentId && log.incidentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const eventName = log.event || log.action || 'OPERATIONAL_EVENT';
      const matchesEvent = eventFilter === 'all' || eventName === eventFilter;

      return matchesSearch && matchesEvent;
    });
  }, [auditLogs, searchQuery, eventFilter]);

  // Group logs by Today, Yesterday, and Earlier
  const groupedLogs = useMemo(() => {
    const today: AuditLogEntry[] = [];
    const yesterday: AuditLogEntry[] = [];
    const earlier: AuditLogEntry[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    filteredLogs.forEach((log) => {
      const logTime = new Date(log.timestamp).getTime();
      if (isNaN(logTime)) {
        today.push(log);
      } else if (logTime >= startOfToday) {
        today.push(log);
      } else if (logTime >= startOfYesterday) {
        yesterday.push(log);
      } else {
        earlier.push(log);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredLogs]);

  // Unique event types for filter dropdown
  const uniqueEvents = useMemo(() => {
    const events = new Set(auditLogs.map((l) => l.event || l.action || 'OPERATIONAL_EVENT'));
    return Array.from(events);
  }, [auditLogs]);

  // Format timestamp helper
  const formatAuditTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' IST';
    } catch {
      return isoStr;
    }
  };

  // Open incident action
  const handleOpenIncident = (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      setSelectedIncident(inc);
      setActiveTab('incidents');
      addToast({ title: 'Case Loaded', message: `Opened case record ${incidentId} from Audit History.`, type: 'info' });
    } else {
      addToast({ title: 'Incident Not Found', message: `Case ID ${incidentId} could not be resolved.`, type: 'warning' });
    }
  };

  // Export audit log JSON
  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EarthMind_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({ title: 'Audit Trail Exported', message: 'Full audit ledger downloaded as JSON.', type: 'success' });
  };

  // Badge color helper for event types
  const getEventBadge = (event: string) => {
    if (event.includes('DISPATCH') || event.includes('ASSIGN')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    if (event.includes('AI') || event.includes('SCAN')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (event.includes('TRANSITION') || event.includes('STAGE')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (event.includes('EVIDENCE') || event.includes('ATTACH')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (event.includes('REPORT') || event.includes('EXEC')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  };

  const renderAuditGroup = (title: string, entries: AuditLogEntry[], iconColor: string) => {
    if (entries.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Calendar className={cn('w-4 h-4', iconColor)} />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
            {entries.length} {entries.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="space-y-2.5">
          {entries.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-white/10 bg-[#0A1220]/80 backdrop-blur-xl hover:border-cyan-500/40 transition shadow-lg group relative overflow-hidden"
            >
              {/* Subtle left glowing line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-cyan-700 opacity-60 group-hover:opacity-100 transition" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                {/* Event & Incident Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide', getEventBadge(log.event || log.action || 'OPERATIONAL_EVENT'))}>
                    {log.event || log.action || 'OPERATIONAL_EVENT'}
                  </span>

                  {log.incidentId && (
                    <button
                      onClick={() => handleOpenIncident(log.incidentId!)}
                      className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/20 transition text-[10px] font-bold flex items-center gap-1 group/btn"
                    >
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{log.incidentId}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100 transition" />
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formatAuditTimestamp(log.timestamp)}</span>
                </div>
              </div>

              {/* Details Narrative */}
              <p className="text-xs text-slate-200 font-sans leading-relaxed mb-3">{log.details}</p>

              {/* Footer Metadata Grid: Actor & Department */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Actor:</span>
                    <strong className="text-slate-200">{log.actor}</strong>
                  </span>

                  {log.department && (
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Dept:</span>
                      <strong className="text-slate-200">{log.department}</strong>
                    </span>
                  )}
                </div>

                <span className="text-[9px] font-mono text-slate-600">ID: {log.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-mono">
      {/* ── HEADER STRIP ── */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#070D18] via-[#0A1220] to-[#050B14] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Audit Ledger</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                  SSOT IMMUTABLE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Centralized audit persistence for all operational dispatches, AI vision scans, and stage transitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" /> Export Ledger (JSON)
            </button>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#070D18] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit records by Event, Actor, Department, Incident ID, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050B14] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Event Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050B14] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-bold"
          >
            <option value="all">All Events ({auditLogs.length})</option>
            {uniqueEvents.map((evt) => (
              <option key={evt} value={evt}>
                {evt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── CHRONOLOGICAL AUDIT GROUPS ── */}
      <div className="space-y-8">
        {renderAuditGroup('Today', groupedLogs.today, 'text-cyan-400')}
        {renderAuditGroup('Yesterday', groupedLogs.yesterday, 'text-amber-400')}
        {renderAuditGroup('Earlier', groupedLogs.earlier, 'text-slate-400')}

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-[#070D18] text-slate-500 text-xs flex flex-col items-center gap-3">
            <Activity className="w-8 h-8 text-slate-600 opacity-40" />
            <p className="text-slate-400 font-bold">No audit entries matching your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setEventFilter('all');
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditHistory;
