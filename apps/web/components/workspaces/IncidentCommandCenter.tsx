'use client';

import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { computeSLA, formatSLARemaining } from '../../lib/services/incident.service';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  Building2,
  BrainCircuit,
  Globe2,
  Eye,
  History,
  Image as ImageIcon,
  Users,
  MessageSquare,
  FileText,
  ArrowLeft,
  BadgeCheck,
  UserPlus,
  CheckCircle2,
  Archive,
  Trash2,
  GitMerge,
  AlertTriangle,
  Timer,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, IncidentStatus } from '../../types';

// ── Lazy-loaded tab panels ──
const LazyAssignmentsTab = lazy(() => import('./tabs/AssignmentsTab'));
const LazyEvidenceTab = lazy(() => import('./tabs/EvidenceTab'));
const LazyCommentsTab = lazy(() => import('./tabs/CommentsTab'));
const LazyReportsTab = lazy(() => import('./tabs/ReportsTab'));

// ── Tab configuration ──
const TABS = [
  { id: 'overview', label: 'Overview', icon: <Eye className="w-3.5 h-3.5" />, lazy: false },
  { id: 'timeline', label: 'Timeline', icon: <History className="w-3.5 h-3.5" />, lazy: false },
  { id: 'evidence', label: 'Evidence', icon: <ImageIcon className="w-3.5 h-3.5" />, lazy: true },
  { id: 'assignments', label: 'Assignments', icon: <Users className="w-3.5 h-3.5" />, lazy: true },
  { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-3.5 h-3.5" />, lazy: true },
  { id: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" />, lazy: true },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Loading skeleton ──
const TabSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5" />
    ))}
  </div>
);

// ──────────────────────────────────────────────────────────────
// INCIDENT COMMAND CENTER
// ──────────────────────────────────────────────────────────────

export const IncidentCommandCenter: React.FC<{ incident: Incident; onClose: () => void }> = ({ incident, onClose }) => {
  const {
    updateIncident,
    addToast,
    openConfirmDialog,
    incidents,
    openReportModal,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // SLA computation
  const sla = useMemo(() => computeSLA(incident), [incident]);
  const [slaDisplay, setSlaDisplay] = useState(formatSLARemaining(sla.remainingMs));

  // Live SLA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = computeSLA(incident);
      setSlaDisplay(formatSLARemaining(fresh.remainingMs));
    }, 30000);
    return () => clearInterval(interval);
  }, [incident]);

  // Risk score derivation
  const riskScore = useMemo(() => {
    if (incident.severity === 'critical') return 94;
    if (incident.severity === 'high') return 78;
    if (incident.severity === 'medium') return 52;
    return 28;
  }, [incident.severity]);

  // Earth impact score
  const earthImpact = useMemo(() => {
    const base = incident.severity === 'critical' ? 8.2 : incident.severity === 'high' ? 5.4 : incident.severity === 'medium' ? 3.1 : 1.2;
    return base.toFixed(1);
  }, [incident.severity]);

  // Related incidents
  const relatedIncidents = useMemo(() =>
    incidents.filter((i) => i.id !== incident.id && i.category === incident.category).slice(0, 3),
    [incidents, incident],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-4"
    >
      {/* ── BACK BUTTON ── */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 hover:text-cyan-400 transition self-start"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Incident List
      </button>

      {/* ── INCIDENT SUMMARY HEADER ── */}
      <Card className="p-0 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className={cn(
          'h-1',
          incident.severity === 'critical' ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-orange-500' :
          incident.severity === 'high' ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500' :
          incident.severity === 'medium' ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-lime-500' :
          'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500'
        )} />

        <div className="p-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono font-black text-sm text-cyan-400">{incident.id}</span>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
                <h2 className="text-sm font-bold text-slate-100 leading-snug">{incident.title}</h2>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateIncident(incident.id, { status: 'verified' })}
                className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
                title="Verify"
              ><BadgeCheck className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => setActiveTab('assignments')}
                className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition"
                title="Assign"
              ><UserPlus className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => updateIncident(incident.id, { status: 'resolved', resolvedAt: new Date().toISOString() })}
                className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition"
                title="Resolve"
              ><CheckCircle2 className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => updateIncident(incident.id, { status: 'archived' })}
                className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 hover:bg-slate-500/20 transition"
                title="Archive"
              ><Archive className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* ── METRICS GRID ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {/* Incident ID */}
            <MetricCell icon={<Zap className="w-3 h-3 text-cyan-400" />} label="Incident ID" value={incident.id} valueClass="text-cyan-400" />
            {/* Status */}
            <MetricCell icon={<Activity className="w-3 h-3 text-blue-400" />} label="Status" value={incident.status.toUpperCase().replace('_', ' ')} valueClass="text-blue-400" />
            {/* Priority */}
            <MetricCell
              icon={<AlertTriangle className="w-3 h-3" style={{ color: incident.severity === 'critical' ? '#ef4444' : incident.severity === 'high' ? '#f97316' : '#eab308' }} />}
              label="Priority"
              value={incident.severity.toUpperCase()}
              valueClass={incident.severity === 'critical' ? 'text-rose-400' : incident.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'}
            />
            {/* SLA */}
            <MetricCell
              icon={<Timer className="w-3 h-3" style={{ color: sla.status === 'breached' ? '#ef4444' : sla.status === 'warning' ? '#f97316' : '#22c55e' }} />}
              label="SLA Timer"
              value={slaDisplay}
              valueClass={sla.status === 'breached' ? 'text-rose-400' : sla.status === 'warning' ? 'text-orange-400' : 'text-emerald-400'}
            />
            {/* Assigned Officer */}
            <MetricCell icon={<UserCheck className="w-3 h-3 text-emerald-400" />} label="Officer" value={incident.assignedTo || 'Unassigned'} valueClass="text-emerald-400" />
            {/* Department */}
            <MetricCell icon={<Building2 className="w-3 h-3 text-indigo-400" />} label="Department" value={incident.department || 'Pending'} valueClass="text-indigo-400" />
            {/* AI Confidence */}
            <MetricCell icon={<BrainCircuit className="w-3 h-3 text-purple-400" />} label="AI Confidence" value={`${incident.aiAnalysis?.confidence || riskScore}%`} valueClass="text-purple-400" />
            {/* Earth Impact */}
            <MetricCell icon={<Globe2 className="w-3 h-3 text-teal-400" />} label="Earth Impact" value={`Δ ${earthImpact}`} valueClass="text-teal-400" />
          </div>

          {/* SLA Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
              <span>SLA Progress</span>
              <span className={cn(
                'font-bold uppercase px-1.5 py-0.5 rounded text-[8px]',
                sla.status === 'breached' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                sla.status === 'warning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              )}>
                {sla.status}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sla.percentRemaining}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  sla.status === 'breached' ? 'bg-rose-500' :
                  sla.status === 'warning' ? 'bg-gradient-to-r from-orange-500 to-amber-400' :
                  'bg-gradient-to-r from-emerald-500 to-teal-400'
                )}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── TAB BAR ── */}
      <div className="flex items-center gap-1 bg-[#0A1220]/95 border border-white/10 rounded-xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && <OverviewTab incident={incident} relatedIncidents={relatedIncidents} />}
          {activeTab === 'timeline' && <TimelineTab incident={incident} />}
          {activeTab === 'evidence' && (
            <Suspense fallback={<TabSkeleton />}>
              <LazyEvidenceTab incident={incident} />
            </Suspense>
          )}
          {activeTab === 'assignments' && (
            <Suspense fallback={<TabSkeleton />}>
              <LazyAssignmentsTab incident={incident} />
            </Suspense>
          )}
          {activeTab === 'comments' && (
            <Suspense fallback={<TabSkeleton />}>
              <LazyCommentsTab incident={incident} />
            </Suspense>
          )}
          {activeTab === 'reports' && (
            <Suspense fallback={<TabSkeleton />}>
              <LazyReportsTab incident={incident} />
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────
// METRIC CELL
// ──────────────────────────────────────────────────────────────

const MetricCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}> = ({ icon, label, value, valueClass }) => (
  <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/5 flex flex-col gap-1">
    <div className="flex items-center gap-1 text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">
      {icon} {label}
    </div>
    <span className={cn('text-[11px] font-mono font-black truncate', valueClass || 'text-slate-200')}>
      {value}
    </span>
  </div>
);

// ──────────────────────────────────────────────────────────────
// OVERVIEW TAB (inline — not lazy)
// ──────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ incident: Incident; relatedIncidents: Incident[] }> = ({ incident, relatedIncidents }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Description */}
    <Card className="p-4 bg-[#0A1220]/95 border-white/10">
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <FileText className="w-3 h-3 text-cyan-400" /> Incident Description
      </h4>
      <p className="text-xs text-slate-300 leading-relaxed">{incident.description}</p>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-[10px] font-mono">
        <div>
          <span className="text-slate-500 block">Category</span>
          <CategoryBadge category={incident.category} />
        </div>
        <div>
          <span className="text-slate-500 block">Location</span>
          <span className="text-slate-200 font-bold">📍 {incident.location?.name || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Reported By</span>
          <span className="text-slate-200 font-bold">{incident.reportedBy}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Reported At</span>
          <span className="text-slate-200 font-bold">{formatDate(incident.reportedAt)}</span>
        </div>
      </div>
    </Card>

    {/* AI Analysis */}
    <Card className="p-4 bg-[#0A1220]/95 border-white/10">
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <BrainCircuit className="w-3 h-3 text-purple-400" /> AI Analysis
      </h4>
      {incident.aiAnalysis ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">{incident.aiAnalysis.summary}</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-[#050B14] border border-white/5">
              <span className="text-slate-500 block text-[8px]">CONFIDENCE</span>
              <span className="text-purple-400 font-black">{incident.aiAnalysis.confidence}%</span>
            </div>
            <div className="p-2 rounded-lg bg-[#050B14] border border-white/5">
              <span className="text-slate-500 block text-[8px]">CLASSIFICATION</span>
              <span className="text-cyan-400 font-black truncate block">{incident.aiAnalysis.classification}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#050B14] border border-white/5">
              <span className="text-slate-500 block text-[8px]">EST. COST</span>
              <span className="text-amber-400 font-black">{incident.aiAnalysis.estimatedCost || 'N/A'}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#050B14] border border-white/5">
              <span className="text-slate-500 block text-[8px]">EST. ETA</span>
              <span className="text-emerald-400 font-black">{incident.aiAnalysis.estimatedETA || 'N/A'}</span>
            </div>
          </div>
          {incident.aiAnalysis.recommendations?.length > 0 && (
            <div>
              <span className="text-slate-500 text-[9px] font-mono font-bold uppercase block mb-1">Recommendations</span>
              <ul className="space-y-1">
                {incident.aiAnalysis.recommendations.map((r, i) => (
                  <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">▸</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-xs font-mono">
          <BrainCircuit className="w-6 h-6 mx-auto mb-2 opacity-40" />
          AI analysis pending
        </div>
      )}
    </Card>

    {/* Related Incidents */}
    {relatedIncidents.length > 0 && (
      <Card className="p-4 bg-[#0A1220]/95 border-white/10 lg:col-span-2">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <GitMerge className="w-3 h-3 text-purple-400" /> Related Incidents ({relatedIncidents.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {relatedIncidents.map((ri) => (
            <div key={ri.id} className="p-3 rounded-xl bg-[#050B14] border border-white/5 hover:border-cyan-500/30 transition cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400">{ri.id}</span>
                <SeverityBadge severity={ri.severity} />
              </div>
              <p className="text-[10px] text-slate-300 font-bold truncate">{ri.title}</p>
              <span className="text-[9px] text-slate-500 font-mono">📍 {ri.location?.name || 'N/A'}</span>
            </div>
          ))}
        </div>
      </Card>
    )}
  </div>
);

// ──────────────────────────────────────────────────────────────
// TIMELINE TAB (inline — not lazy)
// ──────────────────────────────────────────────────────────────

const TimelineTab: React.FC<{ incident: Incident }> = ({ incident }) => (
  <Card className="p-4 bg-[#0A1220]/95 border-white/10">
    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
      <History className="w-3 h-3 text-indigo-400" /> Operational Timeline
    </h4>
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-indigo-500/30 to-transparent" />

      <div className="space-y-4">
        {incident.timeline.map((ev, idx) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* Dot */}
            <div className="absolute -left-[14px] top-1 w-3 h-3 rounded-full bg-[#0A1220] border-2 border-cyan-500/60 z-10" />

            <div className="p-3 rounded-xl bg-[#050B14] border border-white/5 hover:border-cyan-500/20 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{ev.icon}</span>
                  {ev.event}
                </span>
                <span className="text-[9px] font-mono text-slate-500">{formatDate(ev.timestamp)}</span>
              </div>
              {ev.actor && (
                <span className="text-[9px] font-mono text-cyan-400/70">by {ev.actor}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {incident.timeline.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-xs font-mono">
          <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
          No timeline events recorded
        </div>
      )}
    </div>
  </Card>
);

export default IncidentCommandCenter;
