'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — InferenceTimeline Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { CheckCircle2, Clock, Cpu, Zap, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface InferenceStep {
  id: string;
  label: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
  durationMs?: number;
}

export interface InferenceTimelineProps {
  steps: InferenceStep[];
  className?: string;
}

export const InferenceTimeline = memo<InferenceTimelineProps>(({ steps, className }) => {
  return (
    <div className={cn('space-y-2 font-mono text-xs', className)}>
      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 border-b border-white/10 pb-1">
        <span className="flex items-center gap-1 text-cyan-400">
          <Cpu className="w-3.5 h-3.5" /> Neural Inference Stepper
        </span>
        <span className="text-emerald-400">YOLOv8x GPU Kernel</span>
      </div>

      <div className="space-y-1.5 pt-1">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg border text-[10px] transition-all',
              step.status === 'completed'
                ? 'bg-slate-900/80 border-emerald-500/30 text-emerald-300'
                : step.status === 'active'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 animate-pulse ring-1 ring-cyan-400/40'
                : 'bg-slate-950/40 border-white/5 text-slate-500 opacity-60'
            )}
          >
            <div className="flex items-center gap-2">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="font-bold">{step.label}</span>
            </div>

            <div className="flex items-center gap-2">
              {step.durationMs && <span className="text-slate-400 font-mono">({step.durationMs}ms)</span>}
              <span className="text-[9px] uppercase font-mono">{step.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

InferenceTimeline.displayName = 'InferenceTimeline';
export default InferenceTimeline;
