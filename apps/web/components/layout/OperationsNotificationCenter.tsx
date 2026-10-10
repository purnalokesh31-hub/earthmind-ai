'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  CheckCheck,
  ExternalLink,
  Filter,
  X,
  Radio,
  Clock,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import type { Notification } from '../../types';

export type NotificationGroup = 'all' | 'critical' | 'warning' | 'success' | 'info' | 'system';

export const OperationsNotificationCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    notifications,
    addNotification,
    incidents,
    setSelectedIncident,
    setActiveTab,
    addToast,
  } = useAppStore();

  const [activeGroup, setActiveGroup] = useState<NotificationGroup>('all');

  // Compute Unread Counts & Categories
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const criticalCount = useMemo(
    () => notifications.filter((n) => n.priorityGroup === 'P1_CRITICAL' || n.type === 'critical' || n.type === 'error').length,
    [notifications]
  );

  // Group Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeGroup === 'all') return true;
      if (activeGroup === 'critical') return n.priorityGroup === 'P1_CRITICAL' || n.type === 'critical' || n.type === 'error';
      if (activeGroup === 'warning') return n.priorityGroup === 'P2_HIGH' || n.type === 'warning';
      if (activeGroup === 'success') return n.type === 'success' || n.eventType === 'resolution_completed';
      if (activeGroup === 'info') return n.priorityGroup === 'P3_MEDIUM' || n.type === 'info';
      if (activeGroup === 'system') return n.eventType === 'ai_analysis_completed' || n.eventType === 'archive_completed';
      return true;
    });
  }, [notifications, activeGroup]);

  // Mark single as read
  const handleMarkAsRead = (id: string) => {
    useAppStore.setState((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    useAppStore.setState((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    addToast({ title: 'Notifications Updated', message: 'All operational notifications marked as read.', type: 'info' });
  };

  // Clear all notifications
  const handleClearAll = () => {
    useAppStore.setState({ notifications: [] });
    addToast({ title: 'Notifications Cleared', message: 'All operational notifications purged.', type: 'info' });
  };

  // Click handler to open incident
  const handleNotificationClick = (notif: Notification) => {
    handleMarkAsRead(notif.id);

    if (notif.incidentId) {
      const inc = incidents.find((i) => i.id === notif.incidentId);
      if (inc) {
        setSelectedIncident(inc);
        setActiveTab('incidents');
        onClose();
        addToast({ title: 'Case Opened', message: `Navigated to case ${inc.id} from notification.`, type: 'info' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-cyan-500/30 bg-[#0A1220]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 font-mono text-slate-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050B14]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Operations Intel Feed</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {unreadCount} NEW
                  </span>
                )}
              </h4>
              <span className="text-[9px] text-slate-400">Real-time SSOT Dispatch Telemetry</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#070D18] border-b border-white/5 overflow-x-auto text-[9px]">
          {(['all', 'critical', 'warning', 'success', 'info', 'system'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold capitalize transition whitespace-nowrap flex items-center gap-1',
                activeGroup === group
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              {group === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
              {group === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              {group === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              {group === 'info' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
              {group === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              <span>{group}</span>
            </button>
          ))}
        </div>

        {/* Action Controls Bar */}
        <div className="px-4 py-2 border-b border-white/5 bg-[#050B14]/60 flex items-center justify-between text-[9px]">
          <span className="text-slate-400">Showing {filteredNotifications.length} items</span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-bold"
            >
              <CheckCheck className="w-3 h-3" /> Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1 font-bold"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5 pr-1">
          {filteredNotifications.map((notif) => {
            const isCritical = notif.priorityGroup === 'P1_CRITICAL' || notif.type === 'critical' || notif.type === 'error';
            const isWarning = notif.priorityGroup === 'P2_HIGH' || notif.type === 'warning';
            const isSuccess = notif.type === 'success' || notif.eventType === 'resolution_completed';

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'p-3.5 flex items-start gap-3 transition cursor-pointer relative group',
                  !notif.read ? 'bg-cyan-950/20 hover:bg-cyan-950/30' : 'hover:bg-white/5 opacity-80 hover:opacity-100'
                )}
              >
                {/* Status Dot / Unread Indicator */}
                {!notif.read && (
                  <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'p-2 rounded-xl border shrink-0 mt-0.5',
                    isCritical
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : isSuccess
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  )}
                >
                  {isCritical ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h5 className="text-[11px] font-bold text-slate-100 truncate group-hover:text-cyan-300 transition">
                      {notif.title}
                    </h5>
                    <span className="text-[8px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed multiline-ellipsis line-clamp-2">
                    {notif.message}
                  </p>

                  {notif.incidentId && (
                    <div className="mt-2 flex items-center gap-1 text-[8px] text-cyan-400 font-bold">
                      <ExternalLink className="w-2.5 h-2.5" /> View Incident {notif.incidentId}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-2 font-mono">
              <Bell className="w-6 h-6 text-slate-600 opacity-40" />
              <span>No notifications in this filter group.</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OperationsNotificationCenter;
