'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import type { Severity, IncidentStatus, Category } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  className,
  variant = 'neutral',
  size = 'sm',
  ...props
}) => {
  const base = 'inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded border leading-none shrink-0 select-none';

  const variants = {
    critical: 'bg-rose-950/60 text-rose-400 border-rose-800/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    high: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_10px_rgba(251,191,36,0.15)]',
    medium: 'bg-amber-950/40 text-amber-300 border-amber-700/40',
    low: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    info: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
    neutral: 'bg-slate-900/80 text-slate-400 border-slate-700/50',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[10px]',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';

export const SeverityBadge: React.FC<{ severity: Severity; className?: string }> = React.memo(({ severity, className }) => {
  const map: Record<Severity, 'critical' | 'high' | 'medium' | 'low'> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  };

  return (
    <Badge variant={map[severity]} className={className}>
      <span>{severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢'}</span>
      <span>{severity}</span>
    </Badge>
  );
});
SeverityBadge.displayName = 'SeverityBadge';

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = React.memo(({ status, className }) => {
  const labels: Record<IncidentStatus, string> = {
    reported: 'Reported',
    evidence_collection: 'Evidence Collection',
    ai_processing: 'AI Processing',
    created: 'Created',
    verified: 'Verified',
    assigned: 'Assigned',
    investigating: 'Investigating',
    resolved: 'Resolved',
    archived: 'Archived',
  };

  const variants: Record<IncidentStatus, 'info' | 'high' | 'medium' | 'low' | 'neutral'> = {
    reported: 'info',
    evidence_collection: 'info',
    ai_processing: 'medium',
    created: 'info',
    verified: 'medium',
    assigned: 'info',
    investigating: 'high',
    resolved: 'low',
    archived: 'neutral',
  };

  return (
    <Badge variant={variants[status]} className={className}>
      {labels[status]}
    </Badge>
  );
});
StatusBadge.displayName = 'StatusBadge';

export const CategoryBadge: React.FC<{ category: Category; className?: string }> = React.memo(({ category, className }) => {
  const icons: Record<Category, string> = {
    infrastructure: '🏗️',
    agriculture: '🌿',
    water: '💧',
    energy: '⚡',
    climate: '🌎',
    environment: '🌍',
    wildlife: '🦜',
    disaster: '🌊',
    urban: '🏢',
  };

  return (
    <Badge variant="neutral" className={cn('bg-white/5 border-white/10 text-slate-300', className)}>
      <span>{icons[category] || '📁'}</span>
      <span>{category}</span>
    </Badge>
  );
});
CategoryBadge.displayName = 'CategoryBadge';
