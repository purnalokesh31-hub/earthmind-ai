'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — BoundingBox Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import type { BoundingBox as BoundingBoxType } from '../../../types';
import { cn } from '../../../lib/utils';

export interface BoundingBoxProps {
  box: BoundingBoxType;
  selected?: boolean;
  onSelect?: (box: BoundingBoxType) => void;
}

export const BoundingBox = memo<BoundingBoxProps>(({ box, selected, onSelect }) => {
  const { x, y, width, height, label, confidence, severity } = box;

  const borderColor =
    severity === 'critical'
      ? '#f43f5e'
      : severity === 'high'
      ? '#fbbf24'
      : severity === 'medium'
      ? '#06b6d4'
      : '#10b981';

  return (
    <g
      className="cursor-pointer group transition-all"
      onClick={() => onSelect && onSelect(box)}
    >
      {/* Bounding Rectangle */}
      <rect
        x={`${x}%`}
        y={`${y}%`}
        width={`${width}%`}
        height={`${height}%`}
        fill={selected ? 'rgba(6,182,212,0.2)' : 'rgba(15,23,42,0.15)'}
        stroke={borderColor}
        strokeWidth={selected ? 3 : 2}
        strokeDasharray={severity === 'critical' ? '4 4' : 'none'}
        className="transition-all duration-200"
      />

      {/* Target Label Badge */}
      <foreignObject
        x={`${x}%`}
        y={`${Math.max(0, y - 6)}%`}
        width="180"
        height="26"
        className="overflow-visible pointer-events-none"
      >
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-slate-100 shadow-md backdrop-blur-md transition-transform group-hover:scale-105',
            severity === 'critical'
              ? 'bg-rose-950/90 border border-rose-500/60 text-rose-300'
              : severity === 'high'
              ? 'bg-amber-950/90 border border-amber-500/60 text-amber-300'
              : 'bg-cyan-950/90 border border-cyan-500/60 text-cyan-300'
          )}
        >
          <span>{label}</span>
          <span className="opacity-80">({confidence}%)</span>
        </div>
      </foreignObject>
    </g>
  );
});

BoundingBox.displayName = 'BoundingBox';
export default BoundingBox;
