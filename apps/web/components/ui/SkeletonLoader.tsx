'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface ShimmerSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({ className, style }) => {
  return (
    <div
      style={style}
      className={cn(
        'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-xl border border-white/5',
        className
      )}
    />
  );
};

// Preset 1: Incident Header / Card Skeleton
export const IncidentCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0A1220]/60 space-y-4 font-mono', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="w-8 h-8 rounded-xl" />
          <ShimmerSkeleton className="w-48 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="w-20 h-5 rounded-full" />
          <ShimmerSkeleton className="w-20 h-5 rounded-full" />
        </div>
      </div>

      <ShimmerSkeleton className="w-full h-12 rounded-xl" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <ShimmerSkeleton className="h-10 rounded-xl" />
        <ShimmerSkeleton className="h-10 rounded-xl" />
        <ShimmerSkeleton className="h-10 rounded-xl" />
        <ShimmerSkeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
};

// Preset 2: Table / List Row Skeletons
export const TableRowsSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows = 5, className }) => {
  return (
    <div className={cn('space-y-3 font-mono', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#070D18]/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <ShimmerSkeleton className="w-6 h-6 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <ShimmerSkeleton className="w-2/3 h-3.5" />
              <ShimmerSkeleton className="w-1/3 h-2.5" />
            </div>
          </div>
          <ShimmerSkeleton className="w-24 h-6 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};

// Preset 3: Telemetry Grid Skeleton
export const TelemetryGridSkeleton: React.FC<{ cols?: number; className?: string }> = ({ cols = 4, className }) => {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3 font-mono', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-[#050B14]/80 space-y-2">
          <ShimmerSkeleton className="w-16 h-3" />
          <ShimmerSkeleton className="w-24 h-6" />
          <ShimmerSkeleton className="w-full h-2 rounded-full" />
        </div>
      ))}
    </div>
  );
};

// Preset 4: Map Loading Skeleton
export const MapSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('relative w-full h-full min-h-[400px] rounded-2xl border border-white/10 bg-[#040812] overflow-hidden flex flex-col items-center justify-center p-6 text-center font-mono', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950/80 to-[#040812] animate-pulse" />
      <ShimmerSkeleton className="w-16 h-16 rounded-2xl mb-4" />
      <ShimmerSkeleton className="w-64 h-4 mb-2" />
      <ShimmerSkeleton className="w-40 h-3" />
    </div>
  );
};

export default ShimmerSkeleton;
