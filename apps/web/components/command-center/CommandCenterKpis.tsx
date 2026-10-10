'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Compact Operational KPI Cards
// ──────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { CommandCenterKpiDto } from '../../lib/server/dto/command-center.dto';

interface CommandCenterKpisProps {
  kpis: CommandCenterKpiDto;
}

export const CommandCenterKpis: React.FC<CommandCenterKpisProps> = ({ kpis }) => {
  const cards = [
    { label: 'Active Incidents', value: kpis.activeIncidents, icon: '🚨', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Critical (P1)', value: kpis.criticalIncidents, icon: '⚡', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Pending Dispatches', value: kpis.pendingDispatches, icon: '🛰️', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Active Field Officers', value: kpis.activeOfficers, icon: '🛡️', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'SLA Breaches', value: kpis.slaBreaches, icon: '⏳', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Escalated (L1-L4)', value: kpis.escalatedIncidents, icon: '⬆️', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Resolved Today', value: kpis.resolvedToday, icon: '✅', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Multi-Agency Ops', value: kpis.activeMultiAgencyOps, icon: '🏛️', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className={`p-3.5 rounded-xl border backdrop-blur-md transition-all ${card.bg} hover:border-slate-600/50`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">{card.icon}</span>
            <span className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-300 tracking-wide uppercase">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
};
