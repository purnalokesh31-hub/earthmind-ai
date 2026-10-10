'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — ConfidenceBadge Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
  showIcon?: boolean;
}

export const ConfidenceBadge = memo<ConfidenceBadgeProps>(({
  confidence,
  className,
  showIcon = true,
}) => {
  const isHigh = confidence >= 90;
  const isMedium = confidence >= 75;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all',
        isHigh
          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950'
          : isMedium
          ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
          : 'bg-amber-950/80 text-amber-400 border-amber-500/40',
        className
      )}
    >
      {showIcon && (isHigh ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3" />)}
      <span>{confidence}% Confidence</span>
    </span>
  );
});

ConfidenceBadge.displayName = 'ConfidenceBadge';
export default ConfidenceBadge;
