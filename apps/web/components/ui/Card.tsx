'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SeverityBadge, StatusBadge, CategoryBadge } from './Badge';
import type { Incident } from '../../types';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  className,
  hoverable = false,
  interactive = false,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-[#0A1220]/80 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-2xl transition-all duration-300 relative overflow-hidden',
        hoverable && 'hover:border-cyan-500/30 hover:bg-[#0c1628]/90 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-0.5',
        interactive && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export interface KPICardProps {
  label?: string;
  title?: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  percentChange?: string;
  sparkline?: number[];
  lastUpdated?: string;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = React.memo(({
  label,
  title,
  value,
  trend,
  isPositive = true,
  percentChange,
  sparkline,
  lastUpdated = 'Just now',
  subtext,
  icon,
  className,
}) => {
  const displayTitle = title || label || 'Metric';

  const renderSparkline = (data?: number[], positive: boolean = true) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 20;

    const points = data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = positive ? '#10b981' : '#f43f5e';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <Card hoverable className={cn('flex flex-col justify-between p-4 min-h-[125px] bg-[#0A1220]/90 border-white/10', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{displayTitle}</span>
          <p className="text-2xl font-black font-mono text-slate-100 mt-1 tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="text-lg text-cyan-400 p-2 rounded-xl bg-[#050B14] border border-white/10 shrink-0 shadow-inner">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px]">
        <div className="flex items-center gap-2">
          {sparkline && renderSparkline(sparkline, isPositive)}
          <div className="flex flex-col leading-none">
            {(trend || percentChange) && (
              <span className={cn('font-mono font-bold', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
                {percentChange ? `${isPositive ? '+' : ''}${percentChange}` : trend}
              </span>
            )}
            {subtext && <span className="text-slate-500 text-[9px] mt-0.5">{subtext}</span>}
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[9px]">
          {lastUpdated}
        </span>
      </div>
    </Card>
  );
});
KPICard.displayName = 'KPICard';

export interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = React.memo(({
  title,
  subtitle,
  children,
  action,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col gap-3 p-4', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
});
AnalyticsCard.displayName = 'AnalyticsCard';

export interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  selected?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = React.memo(({
  incident,
  onClick,
  selected = false,
}) => {
  return (
    <Card
      hoverable
      interactive
      onClick={onClick}
      className={cn(
        'p-3 flex flex-col gap-2 transition-colors',
        selected && 'border-cyan-500/50 bg-[#0c1628]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold text-cyan-400 shrink-0">{incident.id}</span>
          <h4 className="text-xs font-bold text-slate-200 truncate">{incident.title}</h4>
        </div>
        <SeverityBadge severity={incident.severity} />
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2">{incident.description}</p>

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5 text-[10px]">
        <div className="flex items-center gap-2">
          <CategoryBadge category={incident.category} />
          <span className="text-slate-500 font-mono truncate max-w-[120px]">{incident.location.name}</span>
        </div>
        <StatusBadge status={incident.status} />
      </div>
    </Card>
  );
});
IncidentCard.displayName = 'IncidentCard';

export interface WorkspaceCardProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  onOpen: (id: string, tag?: string) => void;
  onReport?: (id: string, tag?: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  id,
  title,
  icon,
  description,
  tags,
  onOpen,
  onReport,
}) => {
  return (
    <div className="bg-[#0c1525] rounded-2xl border border-[#1a2438] p-5 flex flex-col hover:border-[#1f3050] transition-all duration-300 group cursor-default">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#101c2e] border border-[#1a2a42] flex items-center justify-center text-[22px]">
          {icon}
        </div>
        <button
          onClick={() => onOpen(id)}
          className="text-[9px] font-bold uppercase tracking-widest text-cyan-600 hover:text-cyan-400 flex items-center gap-1 transition-colors opacity-80 group-hover:opacity-100"
        >
          OPEN WORKSPACE <span className="text-[10px]">&rarr;</span>
        </button>
      </div>

      {/* Title & Description */}
      <h3 className="text-[13px] font-bold text-slate-200 leading-snug">{title}</h3>
      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{description}</p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onOpen(id, tag)}
            title={`Filter ${title} by ${tag}`}
            className="px-2.5 py-[3px] rounded-full bg-[#0e1a2a] border border-[#1a2a42] text-[8px] font-bold uppercase tracking-wider text-slate-500 hover:bg-cyan-950/40 hover:border-cyan-700/40 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
