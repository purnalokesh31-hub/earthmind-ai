'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import type { TimelineEvent } from '../../types';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyText?: string;
  className?: string;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  emptyText = 'No data available',
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-white/5 bg-[#0A1220]/60', className)}>
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#0d1117] text-[10px] uppercase font-mono font-black text-slate-400 border-b border-white/5">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-4 py-3 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick && 'cursor-pointer hover:bg-cyan-500/5'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-4 py-3', col.className)}>
                    {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 text-xs">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface DataGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DataGrid<T extends { id?: string | number }>({
  data,
  renderItem,
  columns = 3,
  className,
}: DataGridProps<T>) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 w-full', colClasses[columns], className)}>
      {data.map((item, idx) => (
        <React.Fragment key={item.id || idx}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('flex flex-col gap-4 relative pl-4 border-l border-white/10 ml-2', className)}>
      {events.map((evt) => (
        <div key={evt.id} className="relative flex flex-col gap-1">
          <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[8px]">
            {evt.icon}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-slate-200">{evt.event}</span>
            <span className="font-mono text-slate-500">{evt.timestamp}</span>
          </div>
          {evt.actor && <span className="text-[9px] text-cyan-400 font-mono">Actor: {evt.actor}</span>}
        </div>
      ))}
    </div>
  );
};

export interface ActivityFeedItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  avatar?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, className }) => {
  return (
    <div className={cn('flex flex-col divide-y divide-white/5', className)}>
      {items.map((item) => (
        <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
              {item.user[0]}
            </div>
            <p className="text-slate-300 text-[11px]">
              <span className="font-bold text-slate-100">{item.user}</span> {item.action}{' '}
              {item.target && <span className="text-cyan-400 font-mono">{item.target}</span>}
            </p>
          </div>
          <span className="text-[9px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
        </div>
      ))}
    </div>
  );
};
