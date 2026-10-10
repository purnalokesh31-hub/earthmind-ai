'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Button } from './Button';
import { SearchInput } from './Input';
import { CategoryBadge } from './Badge';
import { formatDate } from '../../lib/utils';
import type { Category } from '../../types';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  Building2,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EnterpriseWorkspaceHeaderProps {
  domain: Category;
  title: string;
  icon: string;
  description: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const EnterpriseWorkspaceHeader: React.FC<EnterpriseWorkspaceHeaderProps> = ({
  domain,
  title,
  icon,
  description,
  searchQuery,
  onSearchChange,
}) => {
  const {
    incidents,
    setActiveDomainWorkspace,
    openReportModal,
    addToast,
  } = useAppStore();

  // Dynamic telemetry calculations for this workspace
  const metrics = useMemo(() => {
    const domainInc = incidents.filter((i) => i.category === domain);
    const activeCount = domainInc.filter((i) => i.status !== 'resolved').length;
    const criticalCount = domainInc.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
    const resolvedCount = domainInc.filter((i) => i.status === 'resolved').length;
    const latestInc = domainInc[0] || null;

    const baseHealth = 96;
    const healthScore = Math.max(60, baseHealth - activeCount * 5 - criticalCount * 10);

    return {
      activeCount,
      criticalCount,
      resolvedCount,
      healthScore,
      lastUpdated: latestInc ? formatDate(latestInc.updatedAt) : 'Live Sync',
    };
  }, [incidents, domain]);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#0A1220]/95 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── BREADCRUMB NAVIGATION ── */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 z-10">
        <button
          onClick={() => setActiveDomainWorkspace(null)}
          className="flex items-center gap-1 hover:text-cyan-400 transition"
        >
          <Home className="w-3.5 h-3.5 text-cyan-400" /> Command Center
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <button
          onClick={() => setActiveDomainWorkspace(null)}
          className="hover:text-cyan-400 transition"
        >
          Workspaces
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-cyan-300 font-bold uppercase">{domain}</span>
      </div>

      {/* ── PRIMARY WORKSPACE ROW ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 z-10">
        <div className="flex items-center gap-3.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveDomainWorkspace(null)}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="border-white/10 hover:border-cyan-500/40 text-slate-300"
          >
            Hub
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#050B14] border border-white/10 flex items-center justify-center text-2xl shadow-inner border-cyan-500/30">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-slate-100 uppercase tracking-tight leading-none">
                  {title}
                </h1>
                <CategoryBadge category={domain} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Department Status & Health Badge */}
        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            OPERATIONAL // SYS OK
          </div>

          <div className={cn(
            'px-3.5 py-1 rounded-xl border text-xs font-black font-mono shadow-inner',
            metrics.healthScore >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
            metrics.healthScore >= 75 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            'bg-rose-500/20 text-rose-300 border-rose-500/40'
          )}>
            {metrics.healthScore}% HEALTH
          </div>
        </div>
      </div>

      {/* ── TELEMETRY BAR & QUICK CONTROLS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3 border-t border-white/10 z-10">
        
        {/* Telemetry Metrics Strip (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#050B14] p-2.5 rounded-xl border border-white/5 text-[10px] font-mono">
          
          <div className="flex flex-col justify-center">
            <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Active Incidents
            </span>
            <span className="text-xs font-black text-slate-200 mt-0.5">{metrics.activeCount} Active</span>
          </div>

          <div className="flex flex-col justify-center border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Critical
            </span>
            <span className={cn('text-xs font-black mt-0.5', metrics.criticalCount > 0 ? 'text-rose-400' : 'text-slate-400')}>
              {metrics.criticalCount} Critical
            </span>
          </div>

          <div className="flex flex-col justify-center border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved Today
            </span>
            <span className="text-xs font-black text-slate-200 mt-0.5">{metrics.resolvedCount} Closed</span>
          </div>

          <div className="flex flex-col justify-center border-l border-white/10 pl-2">
            <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Last Updated
            </span>
            <span className="text-[10px] text-slate-400 truncate mt-0.5">{metrics.lastUpdated}</span>
          </div>
        </div>

        {/* Global Search Input & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${domain} cases...`}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            className="text-[10px] py-2 px-3 shrink-0"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openReportModal(domain)}
          >
            Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-2 px-3 border-white/10 hover:border-indigo-500/40 text-slate-300 shrink-0"
            icon={<FileText className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={() => openReportModal(domain, `Executive ${title} Report`)}
          >
            PDF Briefing
          </Button>
        </div>

      </div>
    </div>
  );
};
