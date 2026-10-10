'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — VisionMetric Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { cn } from '../../../lib/utils';

export interface VisionMetricProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const VisionMetric = memo<VisionMetricProps>(({
  label,
  value,
  subtext,
  icon,
  color = 'cyan',
  className,
}) => {
  const colorClasses = {
    cyan: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/20',
    emerald: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20',
    amber: 'border-amber-500/30 text-amber-300 bg-amber-950/20',
    rose: 'border-rose-500/30 text-rose-300 bg-rose-950/20',
  };

  return (
    <div className={cn('p-3 rounded-xl border space-y-1', colorClasses[color], className)}>
      <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400">
        <span>{label}</span>
        {icon}
      </div>
      <div className="text-base font-black font-mono tracking-tight">{value}</div>
      {subtext && <div className="text-[9px] font-mono text-slate-400 truncate">{subtext}</div>}
    </div>
  );
});

VisionMetric.displayName = 'VisionMetric';
export default VisionMetric;
