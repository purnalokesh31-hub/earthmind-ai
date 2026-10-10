'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { CategoryBadge, SeverityBadge, StatusBadge } from './Badge';
import type { Category, Incident } from '../../types';
import { ArrowRight, BarChart2, Radio, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';

export interface OperationalLaunchCardProps {
  id: Category;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  onOpen: (id: Category, tag?: string) => void;
}

export const OperationalLaunchCard: React.FC<OperationalLaunchCardProps> = ({
  id,
  title,
  icon,
  description,
  tags,
  onOpen,
}) => {
  const { incidents, setActiveCategoryFilter, setActiveTab, setActiveDomainWorkspace } = useAppStore();

  // Dynamic Telemetry Calculations for this specific Operational Department
  const telemetry = useMemo(() => {
    const domainIncidents = incidents.filter((i) => i.category === id);
    const activeCount = domainIncidents.filter((i) => i.status !== 'resolved').length;
    const criticalCount = domainIncidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
    const latestIncident = domainIncidents[0] || null;

    const baseHealth = 96;
    const computedHealth = Math.max(60, baseHealth - activeCount * 5 - criticalCount * 10);

    return {
      healthScore: computedHealth,
      activeCount,
      criticalCount,
      latestIncident,
      lastUpdated: latestIncident ? formatDate(latestIncident.updatedAt) : 'Synced',
    };
  }, [incidents, id]);

  const handleOpenAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCategoryFilter(id);
    setActiveTab('insights');
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0C1525] border-white/10 hover:border-cyan-500/40 transition-all duration-300 group shadow-xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />

      <div>
        {/* ── DEPARTMENT HEADER ── */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#050B14] border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner group-hover:border-cyan-500/40 transition">
              {icon}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">DEPARTMENT COMMAND</span>
              <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors leading-snug">{title}</h3>
            </div>
          </div>

          {/* Department Health Badge */}
          <div className={cn(
            'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase shrink-0',
            telemetry.healthScore >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            telemetry.healthScore >= 75 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          )}>
            {telemetry.healthScore}% HEALTH
          </div>
        </div>

        {/* ── TELEMETRY STRIP ── */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#050B14] border border-white/5 my-3 text-[10px] font-mono">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-bold uppercase">Active Cases</span>
            <span className="text-xs font-black text-slate-200">{telemetry.activeCount} Active</span>
          </div>

          <div className="flex flex-col border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase">Critical</span>
            <span className={cn('text-xs font-black', telemetry.criticalCount > 0 ? 'text-rose-400' : 'text-slate-400')}>
              {telemetry.criticalCount} Critical
            </span>
          </div>

          <div className="flex flex-col border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase">Last Sync</span>
            <span className="text-[10px] text-slate-400 truncate">{telemetry.lastUpdated}</span>
          </div>
        </div>

        {/* ── RECENT ACTIVITY PREVIEW ── */}
        {telemetry.latestIncident ? (
          <div className="p-2.5 rounded-xl bg-[#08101E] border border-white/5 my-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-cyan-400 font-bold">LATEST TELEMETRY LOG</span>
              <StatusBadge status={telemetry.latestIncident.status} />
            </div>
            <p className="text-xs font-bold text-slate-300 truncate">{telemetry.latestIncident.title}</p>
            <span className="text-[9px] text-slate-500 font-mono">📍 {telemetry.latestIncident.location?.name || 'Vijayawada'}</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 my-3 leading-relaxed line-clamp-2">{description}</p>
        )}

        {/* Department Operational Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onOpen(id, tag)}
              className="px-2 py-0.5 rounded-md bg-[#050B14] border border-white/5 text-[8px] font-bold font-mono uppercase tracking-wider text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── DUAL LAUNCH ACTION BUTTONS ── */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 text-[10px] py-1.5 justify-center"
          icon={<ArrowRight className="w-3 h-3" />}
          onClick={() => onOpen(id)}
        >
          OPEN WORKSPACE
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-[10px] py-1.5 px-3 border-white/10 hover:border-cyan-500/40 text-slate-300"
          icon={<BarChart2 className="w-3 h-3 text-cyan-400" />}
          onClick={handleOpenAnalytics}
        >
          ANALYTICS
        </Button>
      </div>
    </Card>
  );
};
