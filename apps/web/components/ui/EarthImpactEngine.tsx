'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Compass, TrendingUp, TrendingDown, ShieldAlert, Activity, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export const EarthImpactEngine: React.FC = () => {
  const { incidents } = useAppStore();

  // Dynamic Impact Computation from Zustand Incidents
  const impact = useMemo(() => {
    const activeCases = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'archived');
    const criticalCases = activeCases.filter((i) => i.severity === 'critical');
    const highCases = activeCases.filter((i) => i.severity === 'high');
    const mediumCases = activeCases.filter((i) => i.severity === 'medium');

    const activeByCat = (cat: string) =>
      activeCases.filter((i) => i.category === cat || (i as any).domain === cat).length;

    // Core Domain Scores
    const infraHealth = Math.max(50, Number((98 - activeByCat('infrastructure') * 7.5).toFixed(1)));
    const envHealth = Math.max(55, Number((96 - activeByCat('environment') * 6.8).toFixed(1)));
    const waterHealth = Math.max(50, Number((95 - activeByCat('water') * 7.2).toFixed(1)));
    const agriHealth = Math.max(60, Number((94 - activeByCat('agriculture') * 5.8).toFixed(1)));
    const climateHealth = Math.max(55, Number((97 - activeByCat('climate') * 7.0).toFixed(1)));

    // Overall Planetary Health Index (PHI)
    const rawPhi = (infraHealth + envHealth + waterHealth + agriHealth + climateHealth) / 5;
    const phi = Number(rawPhi.toFixed(1));

    // Regional Risk Score (Inverse of PHI)
    const regionalRiskScore = Number((100 - phi).toFixed(1));

    // Health Rating Grade & Color
    let grade = 'A+';
    let statusText = 'OPTIMAL PLANETARY HEALTH';
    let badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

    if (phi < 75) {
      grade = 'C';
      statusText = 'HIGH REGIONAL RISK ALERT';
      badgeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    } else if (phi < 85) {
      grade = 'B';
      statusText = 'MODERATE WATCH';
      badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else if (phi < 92) {
      grade = 'A';
      statusText = 'STABLE OPERATIONAL STATE';
      badgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }

    return {
      phi,
      regionalRiskScore,
      grade,
      statusText,
      badgeColor,
      activeCount: activeCases.length,
      criticalCount: criticalCases.length,
      domains: [
        { key: 'infra', label: 'Infrastructure Health', score: infraHealth, icon: '🏗️', color: 'bg-indigo-500' },
        { key: 'env', label: 'Environmental Health', score: envHealth, icon: '🌿', color: 'bg-emerald-500' },
        { key: 'water', label: 'Water Health', score: waterHealth, icon: '💧', color: 'bg-cyan-500' },
        { key: 'agri', label: 'Agriculture Health', score: agriHealth, icon: '🌾', color: 'bg-teal-500' },
        { key: 'climate', label: 'Climate Health', score: climateHealth, icon: '☀️', color: 'bg-amber-500' },
      ],
    };
  }, [incidents]);

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-emerald-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Earth Impact Intelligence Engine</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  ANIMATED REALTIME DYNAMICS
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Real-time dynamic synthesis across 5 core domain pillars, PHI score & regional risk index
              </p>
            </div>
          </div>

          <div className={cn('px-3 py-1 rounded-xl border flex items-center gap-2 font-mono shadow-inner', impact.badgeColor)}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{impact.statusText}</span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
              GRADE {impact.grade}
            </span>
          </div>
        </div>

        {/* ── MAIN ANIMATED SCORE CARDS (PHI & REGIONAL RISK) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 z-10 relative">
          {/* 1. Planetary Health Index (PHI) */}
          <div className="p-4 rounded-xl bg-[#050B14] border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Planetary Health Index (PHI)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.span
                key={impact.phi}
                initial={{ scale: 1.2, color: '#34d399' }}
                animate={{ scale: 1, color: '#f8fafc' }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-black tracking-tight"
              >
                {impact.phi}
              </motion.span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[9px] text-emerald-400 font-sans mt-1">✓ Live synthesis from {incidents.length} city cases</p>
          </div>

          {/* 2. Regional Risk Score */}
          <div className="p-4 rounded-xl bg-[#050B14] border border-rose-500/30 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Regional Risk Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.span
                key={impact.regionalRiskScore}
                initial={{ scale: 1.2, color: '#f43f5e' }}
                animate={{ scale: 1, color: '#f8fafc' }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-black tracking-tight"
              >
                {impact.regionalRiskScore}
              </motion.span>
              <span className="text-xs text-slate-400 font-bold">% RISK INDEX</span>
            </div>
            <p className="text-[9px] text-rose-400 font-sans mt-1">
              {impact.regionalRiskScore > 20 ? '⚠️ Elevated hazard density detected' : '✓ Low risk exposure'}
            </p>
          </div>

          {/* 3. Operational KPIs Summary */}
          <div className="p-4 rounded-xl bg-[#050B14] border border-cyan-500/30 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Operational Dispatch KPIs</span>
            <div className="flex items-center justify-between mt-1 text-xs font-bold">
              <div>
                <span className="text-slate-500 block text-[9px]">Active Cases:</span>
                <span className="text-slate-100">{impact.activeCount} Active</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Critical P1:</span>
                <span className="text-rose-400">{impact.criticalCount} Critical</span>
              </div>
            </div>
            <p className="text-[9px] text-cyan-400 font-sans mt-1">⚡ SLA Target: 2.0 hrs (Avg 1.4h)</p>
          </div>
        </div>

        {/* ── 5 CORE DOMAIN HEALTH PILLARS WITH PROGRESS BARS ── */}
        <div className="space-y-2.5 z-10 relative text-[10px]">
          {impact.domains.map((dom) => (
            <div key={dom.key} className="p-3 rounded-xl bg-[#050B14] border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{dom.icon}</span>
                  <span className="font-bold text-slate-200">{dom.label}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <motion.span
                    key={dom.score}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-bold text-slate-100 text-xs"
                  >
                    {dom.score}%
                  </motion.span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">
                    {dom.score >= 85 ? 'OPTIMAL' : 'WATCH'}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dom.score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', dom.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Automatically recalculates on every incident state mutation via Zustand.</span>
        <span className="text-emerald-400 font-bold">EARTH IMPACT ENGINE LIVE</span>
      </div>
    </Card>
  );
};
