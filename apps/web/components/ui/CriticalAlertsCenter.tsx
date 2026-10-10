'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge, StatusBadge } from './Badge';
import { formatDate } from '../../lib/utils';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  UserCheck,
  EyeOff,
  FileText,
  CheckCircle2,
  Bell,
  Filter,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, Severity } from '../../types';

export const CriticalAlertsCenter: React.FC = () => {
  const {
    incidents,
    setSelectedIncident,
    setActiveTab,
    openReportModal,
    addToast,
    openConfirmDialog,
  } = useAppStore();

  const [activeSeverityTab, setActiveSeverityTab] = useState<'all' | Severity>('all');
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

  // Filter out acknowledged alerts and group by severity
  const activeAlerts = useMemo(() => {
    return incidents.filter((i) => !acknowledgedIds.includes(i.id));
  }, [incidents, acknowledgedIds]);

  const grouped = useMemo(() => {
    const critical = activeAlerts.filter((i) => i.severity === 'critical');
    const high = activeAlerts.filter((i) => i.severity === 'high');
    const medium = activeAlerts.filter((i) => i.severity === 'medium');
    const low = activeAlerts.filter((i) => i.severity === 'low');
    return { critical, high, medium, low };
  }, [activeAlerts]);

  // Handlers for Quick Actions
  const handleOpenAlert = (inc: Incident) => {
    setSelectedIncident(inc);
    setActiveTab('incidents');
    addToast({ title: 'Alert Selected', message: `Opened alert ${inc.id} details.`, type: 'info' });
  };

  const handleAssignAlert = (inc: Incident) => {
    openConfirmDialog({
      title: `Assign Officer to Alert ${inc.id}`,
      message: `Assign Officer Lokesh (Field Supervisor) to manage critical alert "${inc.title}"?`,
      confirmLabel: 'Assign Officer Lokesh',
      onConfirm: () => {
        addToast({
          title: 'Officer Dispatched',
          message: `Officer Lokesh assigned to alert ${inc.id}.`,
          type: 'success',
        });
      },
    });
  };

  const handleIgnoreAlert = (inc: Incident) => {
    if (inc.severity === 'critical') {
      openConfirmDialog({
        title: `Acknowledge Critical Alert ${inc.id}?`,
        message: `Critical alerts must be acknowledged before dismissing. Mark alert as acknowledged?`,
        confirmLabel: 'Acknowledge & Dismiss',
        onConfirm: () => {
          setAcknowledgedIds((prev) => [...prev, inc.id]);
          addToast({
            title: 'Critical Alert Acknowledged',
            message: `Critical alert ${inc.id} marked as acknowledged.`,
            type: 'warning',
          });
        },
      });
    } else {
      setAcknowledgedIds((prev) => [...prev, inc.id]);
      addToast({
        title: 'Alert Muted',
        message: `Alert ${inc.id} acknowledged and dismissed from feed.`,
        type: 'info',
      });
    }
  };

  const handleGenerateReport = (inc: Incident) => {
    openReportModal(inc.category, `Executive Alert Briefing — ${inc.id}: ${inc.title}`);
  };

  const deptNames: Record<string, string> = {
    infrastructure: 'Infrastructure Intelligence',
    agriculture: 'Agriculture Intelligence',
    environment: 'Environmental Intelligence',
    disaster: 'Disaster Intelligence',
    water: 'Water Intelligence',
    energy: 'Energy Intelligence',
    urban: 'Urban Intelligence',
    climate: 'Climate Intelligence',
    wildlife: 'Wildlife Intelligence',
  };

  const renderAlertCard = (inc: Incident) => {
    const isCritical = inc.severity === 'critical';

    return (
      <motion.div
        key={inc.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 relative overflow-hidden group',
          isCritical
            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/30'
            : inc.severity === 'high'
            ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
            : 'bg-[#050B14] border-white/10 hover:border-cyan-500/30'
        )}
      >
        {isCritical && (
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500 animate-pulse" />
        )}

        <div>
          {/* Card Top Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {isCritical ? '🚨' : inc.severity === 'high' ? '⚠️' : '⚡'}
              </span>
              <span className="font-mono text-xs font-bold text-slate-100">{inc.id}</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                🏢 {deptNames[inc.category] || 'Multi-Domain Command'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <SeverityBadge severity={inc.severity} />
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> {formatDate(inc.reportedAt)}
              </span>
            </div>
          </div>

          {/* Incident Name & Location */}
          <div className="my-2.5">
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
              {inc.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{inc.location?.name || 'Vijayawada Sector'}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 mt-1">
          <Button
            variant="primary"
            size="sm"
            className="text-[10px] py-1 px-2.5"
            icon={<ExternalLink className="w-3 h-3" />}
            onClick={() => handleOpenAlert(inc)}
          >
            Open
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 px-2.5 border-white/10 text-slate-300 hover:border-emerald-500/40"
            icon={<UserCheck className="w-3 h-3 text-emerald-400" />}
            onClick={() => handleAssignAlert(inc)}
          >
            Assign
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 px-2.5 border-white/10 text-slate-300 hover:border-amber-500/40"
            icon={<EyeOff className="w-3 h-3 text-amber-400" />}
            onClick={() => handleIgnoreAlert(inc)}
          >
            Ignore
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 px-2.5 border-white/10 text-slate-300 hover:border-indigo-500/40 ml-auto"
            icon={<FileText className="w-3 h-3 text-indigo-400" />}
            onClick={() => handleGenerateReport(inc)}
          >
            Report
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-rose-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── CENTER HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Critical Alerts Center</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  {grouped.critical.length} CRITICAL ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Priority hazard feeds grouped by severity level</p>
            </div>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#050B14] p-1 rounded-xl border border-white/10 text-[10px] font-mono font-bold">
            <button
              onClick={() => setActiveSeverityTab('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition',
                activeSeverityTab === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              ALL ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveSeverityTab('critical')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition',
                activeSeverityTab === 'critical' ? 'bg-rose-500 text-white' : 'text-rose-400 hover:bg-rose-950/40'
              )}
            >
              🚨 CRITICAL ({grouped.critical.length})
            </button>
            <button
              onClick={() => setActiveSeverityTab('high')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition',
                activeSeverityTab === 'high' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-950/40'
              )}
            >
              ⚠️ HIGH ({grouped.high.length})
            </button>
            <button
              onClick={() => setActiveSeverityTab('medium')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition',
                activeSeverityTab === 'medium' ? 'bg-indigo-500 text-white' : 'text-indigo-400 hover:bg-indigo-950/40'
              )}
            >
              ⚡ MEDIUM ({grouped.medium.length})
            </button>
            <button
              onClick={() => setActiveSeverityTab('low')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition',
                activeSeverityTab === 'low' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
              )}
            >
              ℹ️ LOW ({grouped.low.length})
            </button>
          </div>
        </div>

        {/* ── ALERTS CONTAINER GROUPED BY SEVERITY ── */}
        <div className="flex flex-col gap-5 max-h-[460px] overflow-y-auto pr-1 z-10">
          
          {/* Critical Group */}
          {(activeSeverityTab === 'all' || activeSeverityTab === 'critical') && grouped.critical.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest pb-1 border-b border-rose-500/20">
                <span>🚨 PRIORITY 1 — CRITICAL ALERTS ({grouped.critical.length})</span>
                <span className="text-slate-500">MUST REMAIN UNTIL ACKNOWLEDGED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.critical.map(renderAlertCard)}
              </div>
            </div>
          )}

          {/* High Group */}
          {(activeSeverityTab === 'all' || activeSeverityTab === 'high') && grouped.high.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest pb-1 border-b border-amber-500/20">
                <span>⚠️ PRIORITY 2 — HIGH ALERTS ({grouped.high.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.high.map(renderAlertCard)}
              </div>
            </div>
          )}

          {/* Medium Group */}
          {(activeSeverityTab === 'all' || activeSeverityTab === 'medium') && grouped.medium.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest pb-1 border-b border-indigo-500/20">
                <span>⚡ PRIORITY 3 — MEDIUM ALERTS ({grouped.medium.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.medium.map(renderAlertCard)}
              </div>
            </div>
          )}

          {/* Low Group */}
          {(activeSeverityTab === 'all' || activeSeverityTab === 'low') && grouped.low.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-white/10">
                <span>ℹ️ PRIORITY 4 — LOW ALERTS ({grouped.low.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.low.map(renderAlertCard)}
              </div>
            </div>
          )}

          {activeAlerts.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              ✅ All alerts acknowledged and cleared from operational queue.
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between z-10">
        <span className="flex items-center gap-1 text-rose-400">
          <Bell className="w-3 h-3 animate-pulse" /> Critical alerts require explicit supervisor acknowledgement
        </span>
        <button
          onClick={() => setAcknowledgedIds([])}
          className="text-cyan-400 hover:underline font-bold"
        >
          Reset Muted Alerts
        </button>
      </div>
    </Card>
  );
};
