'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Compass, ShieldCheck, TrendingUp, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PlanetaryHealthCard: React.FC = () => {
  const { incidents, setActiveTab } = useAppStore();

  // Dynamic calculations from Zustand incidents state
  const metrics = useMemo(() => {
    const activeByCat = (cat: string) => incidents.filter(i => i.category === cat && i.status !== 'resolved').length;

    const envScore = Math.max(65, 96 - activeByCat('environment') * 7);
    const infraScore = Math.max(60, 92 - activeByCat('infrastructure') * 8);
    const waterScore = Math.max(65, 95 - activeByCat('water') * 7);
    const agriScore = Math.max(70, 94 - activeByCat('agriculture') * 6);
    const disasterScore = Math.max(60, 98 - activeByCat('disaster') * 9);

    const rawAvg = (envScore + infraScore + waterScore + agriScore + disasterScore) / 5;
    const overallScore = Number(rawAvg.toFixed(1));

    let grade = 'A+';
    let statusText = 'OPTIMAL HEALTH';
    let gradeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

    if (overallScore < 75) {
      grade = 'C';
      statusText = 'HIGH RISK WARNING';
      gradeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    } else if (overallScore < 85) {
      grade = 'B';
      statusText = 'MODERATE WATCH';
      gradeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else if (overallScore < 92) {
      grade = 'A';
      statusText = 'STABLE STATE';
      gradeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }

    return {
      overallScore,
      grade,
      statusText,
      gradeColor,
      domains: [
        { label: 'Environmental Status', score: envScore, icon: '🌿', color: 'bg-emerald-500', status: envScore >= 85 ? 'Flourishing' : 'Watch' },
        { label: 'Infrastructure Status', score: infraScore, icon: '🏗️', color: 'bg-indigo-500', status: infraScore >= 80 ? 'Stable' : 'Degraded' },
        { label: 'Water Status', score: waterScore, icon: '💧', color: 'bg-cyan-500', status: waterScore >= 85 ? 'Optimal' : 'Leak Warning' },
        { label: 'Agriculture Status', score: agriScore, icon: '🌾', color: 'bg-teal-500', status: agriScore >= 85 ? 'High Yield' : 'Pest Risk' },
        { label: 'Disaster Preparedness', score: disasterScore, icon: '🌊', color: 'bg-amber-500', status: disasterScore >= 85 ? 'High Readiness' : 'Flood Alert' },
      ],
    };
  }, [incidents]);

  return (
    <Card className="flex flex-col justify-between border-cyan-500/30 bg-[#0A1220]/95 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── CARD HEADER ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Planetary Health Intelligence (PHI)
            </h3>
            <p className="text-[10px] text-slate-400">Real-time dynamic synthesis across 5 core telemetry pillars</p>
          </div>
        </div>

        {/* Dynamic Health Grade Badge */}
        <div className={cn('px-3 py-1 rounded-xl border flex items-center gap-2 font-mono shadow-inner', metrics.gradeColor)}>
          <span className="text-xs font-bold uppercase tracking-wider">{metrics.statusText}</span>
          <span className="text-sm font-black px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
            GRADE {metrics.grade}
          </span>
        </div>
      </div>

      {/* ── SCORE SUMMARY BAR ── */}
      <div className="my-4 p-4 rounded-2xl bg-[#050B14] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        
        {/* Animated Main Score */}
        <div className="flex items-baseline gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Overall Health Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <motion.span
                key={metrics.overallScore}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-black font-mono text-slate-100 tracking-tight"
              >
                {metrics.overallScore}
              </motion.span>
              <span className="text-xs font-mono text-slate-500 font-bold">/ 100</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.1 pts // Improving</span>
          </div>
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry Locked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Auto-Updated</span>
          </div>
        </div>
      </div>

      {/* ── 5 DOMAIN HEALTH BARS WITH SMOOTH TRANSITIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-1 z-10">
        {metrics.domains.map((d) => (
          <div key={d.label} className="p-3 rounded-xl bg-[#050B14] border border-white/5 flex flex-col gap-2 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>{d.icon}</span>
                <span className="truncate max-w-[90px]">{d.label.replace(' Status', '')}</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-300">{d.status}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-slate-100">{d.score}%</span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">LIVE</span>
            </div>

            {/* Smooth Animated Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', d.color)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── CARD FOOTER ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 mt-3 border-t border-white/10 z-10">
        <span className="font-mono text-[10px] text-slate-400">
          Sync Status: <strong>Sentinel-2B Pass in 14 mins</strong>
        </span>
        <button
          onClick={() => setActiveTab('insights')}
          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-xs transition"
        >
          View Full Analytical Breakdowns →
        </button>
      </div>
    </Card>
  );
};
