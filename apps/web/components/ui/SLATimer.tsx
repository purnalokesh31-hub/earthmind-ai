'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, Severity } from '../../types';

// Severity SLA Target Durations (in milliseconds)
export const SLA_TARGET_MS: Record<Severity, number> = {
  critical: 2 * 60 * 60 * 1000, // 2 Hours
  high: 4 * 60 * 60 * 1000,     // 4 Hours
  medium: 8 * 60 * 60 * 1000,   // 8 Hours
  low: 24 * 60 * 60 * 1000,    // 24 Hours
};

export const SLA_COLOR_MAP: Record<Severity, { text: string; bg: string; border: string; glow: string }> = {
  critical: {
    text: 'text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  },
  high: {
    text: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  medium: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
  },
  low: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
  },
};

export interface SLATimerProps {
  incident: Incident;
  compact?: boolean;
  className?: string;
}

export const SLATimer: React.FC<SLATimerProps> = React.memo(({ incident, compact = false, className }) => {
  const [now, setNow] = useState<number>(Date.now());

  // 1-Second Interval Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const severity = incident.severity || 'medium';
  const targetMs = SLA_TARGET_MS[severity] || SLA_TARGET_MS.medium;
  const reportedMs = useMemo(() => {
    const parsed = new Date(incident.reportedAt).getTime();
    return isNaN(parsed) ? Date.now() - 1800000 : parsed; // Fallback: 30m ago
  }, [incident.reportedAt]);

  const deadlineMs = reportedMs + targetMs;
  const remainingMs = deadlineMs - now;
  const elapsedMs = now - reportedMs;

  const isResolved = incident.status === 'resolved' || incident.status === 'archived';
  const isOverdue = !isResolved && remainingMs <= 0;

  // Percentage calculation (0 to 100%)
  const percentage = useMemo(() => {
    if (isResolved) return 100;
    const pct = (elapsedMs / targetMs) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [elapsedMs, targetMs, isResolved]);

  // Formatter for HH:MM:SS
  const formatTimeSpan = (ms: number) => {
    const absMs = Math.abs(ms);
    const totalSeconds = Math.floor(absMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const colors = SLA_COLOR_MAP[severity];

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 font-mono text-[11px]', className)}>
        <Clock className={cn('w-3.5 h-3.5', isOverdue ? 'text-rose-400 animate-pulse' : colors.text)} />
        <div>
          {isResolved ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> SLA Met
            </span>
          ) : isOverdue ? (
            <span className="text-rose-400 font-black flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 animate-pulse" /> OVERDUE ({formatTimeSpan(remainingMs)})
            </span>
          ) : (
            <span className={cn('font-bold', colors.text)}>
              {formatTimeSpan(remainingMs)} remaining
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-3.5 rounded-xl border bg-[#050B14]/80 backdrop-blur-xl font-mono space-y-2 relative overflow-hidden',
        isOverdue ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]' : colors.border,
        className
      )}
    >
      {/* Top Details & Countdown */}
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <Clock className={cn('w-3.5 h-3.5', isOverdue ? 'text-rose-400 animate-pulse' : colors.text)} />
          <span className="text-slate-400 font-bold uppercase tracking-wider">
            SLA SLA Target: ({severity.toUpperCase()} — {targetMs / 3600000}h)
          </span>
        </div>

        {/* Status / Overdue Badge */}
        {isResolved ? (
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[9px] font-black flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> SLA COMPLIED
          </span>
        ) : isOverdue ? (
          <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-400 text-[9px] font-black flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-2.5 h-2.5" /> BREACHED ({formatTimeSpan(remainingMs)})
          </span>
        ) : (
          <span className={cn('px-2 py-0.5 rounded bg-white/5 border text-[9px] font-bold', colors.border, colors.text)}>
            {formatTimeSpan(remainingMs)} REMAINING
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isResolved
              ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
              : isOverdue
              ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse'
              : percentage > 85
              ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
              : colors.bg
          )}
        />
      </div>

      {/* Footer Progress Telemetry */}
      <div className="flex items-center justify-between text-[9px] text-slate-400">
        <span>Elapsed: {formatTimeSpan(elapsedMs)}</span>
        <span>{Math.round(percentage)}% Expired</span>
      </div>
    </div>
  );
});
SLATimer.displayName = 'SLATimer';

export default SLATimer;
