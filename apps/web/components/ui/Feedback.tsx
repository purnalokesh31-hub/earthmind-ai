'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description = 'There are no items matching your criteria.',
  icon = '📭',
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/5 bg-[#0A1220]/40', className)}>
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">{title}</h4>
      <p className="text-[11px] text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('animate-pulse bg-white/5 rounded-lg', className)} />
  );
};

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={cn('animate-spin rounded-full border-cyan-500 border-t-transparent', sizes[size], className)} />
      {label && <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{label}</span>}
    </div>
  );
};

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-rose-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    info: <Info className="w-4 h-4 text-cyan-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={() => onDismiss(t.id)}
            className="pointer-events-auto p-3 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl flex items-start gap-3 cursor-pointer hover:border-white/20 transition-colors"
          >
            <div className="shrink-0 mt-0.5">{icons[t.type || 'info']}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-200">{t.title}</h5>
              {t.message && <p className="text-[10px] text-slate-400 mt-0.5">{t.message}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
