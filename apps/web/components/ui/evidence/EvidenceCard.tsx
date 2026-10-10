'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — EvidenceCard Reusable Component
// ──────────────────────────────────────────────────────────────
// Features Progressive Image Loading (blur -> high-res) & Optimistic UI
// ──────────────────────────────────────────────────────────────

import React, { memo, useState } from 'react';
import type { EvidenceItem } from '../../../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Eye, FileText, Activity, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface EvidenceCardProps {
  item: EvidenceItem;
  selected?: boolean;
  onSelect?: (item: EvidenceItem) => void;
  onDispatch?: (item: EvidenceItem) => void;
}

export const EvidenceCard = memo<EvidenceCardProps>(({
  item,
  selected,
  onSelect,
  onDispatch,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optimisticDispatched, setOptimisticDispatched] = useState(!!item.linkedIncidentId);

  const handleDispatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimisticDispatched(true);
    if (onDispatch) onDispatch(item);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className={cn(
        'group rounded-xl border bg-[#0A1220]/80 overflow-hidden cursor-pointer transition-all duration-200 space-y-2 relative',
        selected
          ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-xl shadow-cyan-950/50'
          : 'border-white/10 hover:border-cyan-500/40 hover:bg-[#0D182A]/90'
      )}
    >
      {/* Media Image Container with Progressive Loading */}
      <div className="w-full h-36 bg-slate-900 relative overflow-hidden">
        {/* Shimmer Skeleton Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center text-[10px] text-slate-500 font-mono">
            Loading Asset...
          </div>
        )}

        <img
          src={item.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop'}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          )}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
            {item.type}
          </span>
          {item.aiAnalysis && <ConfidenceBadge confidence={item.aiAnalysis.overallConfidence} />}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
            {item.name}
          </h4>
          <span className="text-[9px] font-mono text-slate-500 shrink-0">
            {item.sizeBytes ? `${(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : '3.4 MB'}
          </span>
        </div>

        {item.aiAnalysis && (
          <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
            Classified: {item.aiAnalysis.classification}
          </p>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono">
          <span className="text-slate-500">{item.uploadedBy || 'Autonomous Sensor'}</span>

          {optimisticDispatched ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Dispatched
            </span>
          ) : (
            <button
              onClick={handleDispatchClick}
              className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold uppercase tracking-wider hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              1-Click Incident
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

EvidenceCard.displayName = 'EvidenceCard';
export default EvidenceCard;
