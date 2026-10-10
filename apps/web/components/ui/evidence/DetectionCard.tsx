'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — DetectionCard Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import type { DetectionObject } from '../../../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Target, Layers } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DetectionCardProps {
  detection: DetectionObject;
  onClick?: (detection: DetectionObject) => void;
  className?: string;
}

export const DetectionCard = memo<DetectionCardProps>(({ detection, onClick, className }) => {
  const { label, confidence, category, boundingBox } = detection;

  return (
    <div
      onClick={() => onClick && onClick(detection)}
      className={cn(
        'p-3 rounded-xl border bg-slate-900/60 border-white/5 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            {label}
          </span>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-500" />
          {category}
        </span>
        <span className="uppercase font-bold text-cyan-400">
          [{boundingBox?.x ?? 25}%, {boundingBox?.y ?? 25}%]
        </span>
      </div>
    </div>
  );
});

DetectionCard.displayName = 'DetectionCard';
export default DetectionCard;
