'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck,
  Bot,
  UserCheck,
  Activity,
  Archive,
  Camera,
  Zap,
  Clock,
  Filter,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Notification, NotificationEventType, NotificationPriorityGroup } from '../../types';

const INITIAL_ENGINE_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    eventType: 'priority_escalated',
    priorityGroup: 'P1_CRITICAL',
    title: 'EM-208 Priority Escalated to CRITICAL',
    message: 'Sub-surface hydrostatic pressure hit 94/100 threshold at Benz Circle Ward 12.',
    timestamp: 'Just now',
    status: 'unread',
    incidentId: 'EM-208',
    actor: 'Neural AI Decision Engine',
    type: 'critical',
    read: false,
  },
  {
    id: 'n-2',
    eventType: 'ai_analysis_completed',
    priorityGroup: 'P2_HIGH',
    title: 'AI Vision Pre-Scan Completed',
    message: 'Computer Vision confirmed STRUCTURAL_SUBSIDENCE hazard (94.2% confidence).',
    timestamp: '4m ago',
    status: 'unread',
    incidentId: 'EM-208',
    actor: 'EarthMind AI Engine',
    type: 'warning',
    read: false,
  },
  {
    id: 'n-3',
    eventType: 'officer_assigned',
    priorityGroup: 'P3_MEDIUM',
    title: 'Officer Lokesh Dispatched',
    message: 'Response Squad L3 dispatched to Benz Circle. ETA: 8 minutes.',
    timestamp: '12m ago',
    status: 'unread',
    incidentId: 'EM-208',
    actor: 'Control Duty Lead',
    type: 'info',
    read: false,
  },
  {
    id: 'n-4',
    eventType: 'evidence_uploaded',
    priorityGroup: 'P3_MEDIUM',
    title: '4K Thermal Drone Video Package Uploaded',
    message: 'FLIR Zenmuse H20T sensor clip uploaded to case ledger (184.6 MB).',
    timestamp: '25m ago',
    status: 'read',
    incidentId: 'EM-208',
    actor: 'Drone Pilot-01',
    type: 'info',
    read: true,
  },
  {
    id: 'n-5',
    eventType: 'incident_created',
    priorityGroup: 'P3_MEDIUM',
    title: 'New Incident Case Created — EM-208',
    message: 'Citizen intake recorded at Vijayawada Sector 4 corridor.',
    timestamp: '42m ago',
    status: 'read',
    incidentId: 'EM-208',
    actor: 'Citizen Intake',
    type: 'info',
    read: true,
  },
  {
    id: 'n-6',
    eventType: 'resolution_completed',
    priorityGroup: 'P4_INFO',
    title: 'EM-201 Pipeline Remediation Complete',
    message: 'Conduit valve 4B repaired & pressure stabilized. Inspection passed.',
    timestamp: '1h ago',
    status: 'archived',
    incidentId: 'EM-201',
    actor: 'Officer Sravan',
    type: 'success',
    read: true,
  },
  {
    id: 'n-7',
    eventType: 'archive_completed',
    priorityGroup: 'P4_INFO',
    title: 'EM-189 Case Archived to ISO Ledger',
    message: 'Cryptographically sealed audit certificate generated.',
    timestamp: '3h ago',
    status: 'archived',
    incidentId: 'EM-189',
    actor: 'System Auditor',
    type: 'info',
    read: true,
  },
];

export const NotificationStatusPanel: React.FC = () => {
  const { addToast } = useAppStore();

  const [notificationList, setNotificationList] = useState<Notification[]>(INITIAL_ENGINE_NOTIFICATIONS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriorityGroup | 'all'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<NotificationEventType | 'all'>('all');

  // Multi-Criteria Filtering
  const filteredNotifications = useMemo(() => {
    return notificationList.filter((n) => {
      const matchStatus = statusFilter === 'all' || n.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || n.priorityGroup === priorityFilter;
      const matchEventType = eventTypeFilter === 'all' || n.eventType === eventTypeFilter;
      return matchStatus && matchPriority && matchEventType;
    });
  }, [notificationList, statusFilter, priorityFilter, eventTypeFilter]);

  const unreadCount = useMemo(() => notificationList.filter((n) => n.status === 'unread').length, [notificationList]);

  // Actions
  const handleMarkRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read', read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotificationList((prev) =>
      prev.map((n) => ({ ...n, status: 'read', read: true }))
    );
    addToast({ title: 'Notifications Cleared', message: 'Marked all notifications as read.', type: 'info' });
  };

  const handleArchive = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'archived' } : n))
    );
    addToast({ title: 'Notification Archived', message: 'Moved notification to archive vault.', type: 'info' });
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-purple-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Bell className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Notification Engine Feed</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {unreadCount} UNREAD ALERTS
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Event notifications bound to application lifecycle state
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 border-white/10 text-slate-300 hover:border-purple-500/40"
            icon={<CheckCheck className="w-3.5 h-3.5 text-purple-400" />}
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        </div>

        {/* ── 3 MULTI-CRITERIA FILTER DROPDOWNS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4 z-10 relative text-[10px]">
          {/* Status Filter */}
          <div>
            <label className="text-slate-500 text-[9px] uppercase font-bold block mb-1">State Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-[#050B14] border border-white/10 text-slate-200 outline-none focus:border-purple-500"
            >
              <option value="all">All States (Unread, Read, Archived)</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
              <option value="archived">Archived Vault</option>
            </select>
          </div>

          {/* Priority Group Filter */}
          <div>
            <label className="text-slate-500 text-[9px] uppercase font-bold block mb-1">Priority Group</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-[#050B14] border border-white/10 text-slate-200 outline-none focus:border-purple-500"
            >
              <option value="all">All Priority Levels</option>
              <option value="P1_CRITICAL">P1 - CRITICAL</option>
              <option value="P2_HIGH">P2 - HIGH</option>
              <option value="P3_MEDIUM">P3 - MEDIUM</option>
              <option value="P4_INFO">P4 - ROUTINE INFO</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="text-slate-500 text-[9px] uppercase font-bold block mb-1">8 Notification Event Types</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-[#050B14] border border-white/10 text-slate-200 outline-none focus:border-purple-500"
            >
              <option value="all">All 8 Event Types</option>
              <option value="incident_created">Incident Created</option>
              <option value="ai_analysis_completed">AI Analysis Completed</option>
              <option value="officer_assigned">Officer Assigned</option>
              <option value="priority_escalated">Priority Escalated</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="field_update">Field Update</option>
              <option value="resolution_completed">Resolution Completed</option>
              <option value="archive_completed">Archive Completed</option>
            </select>
          </div>
        </div>

        {/* ── NOTIFICATION CARDS STREAM ── */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 z-10 relative text-[10px]">
          {filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleMarkRead(notif.id)}
              className={cn(
                'p-3 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer group shadow-sm',
                notif.status === 'unread'
                  ? 'bg-purple-950/20 border-purple-500/40'
                  : notif.status === 'archived'
                  ? 'bg-[#050B14] border-white/5 opacity-60'
                  : 'bg-[#070D18] border-white/10'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-white/5">
                    {notif.priorityGroup === 'P1_CRITICAL' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    {notif.priorityGroup === 'P2_HIGH' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {notif.priorityGroup === 'P3_MEDIUM' && <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                    {notif.priorityGroup === 'P4_INFO' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </span>

                  <span className="font-bold text-slate-100 text-xs group-hover:text-purple-300 transition">
                    {notif.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase',
                      notif.priorityGroup === 'P1_CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
                    )}
                  >
                    {notif.priorityGroup.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 text-[9px]">{notif.timestamp}</span>
                </div>
              </div>

              <p className="text-slate-300 font-sans text-xs leading-relaxed">{notif.message}</p>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-slate-400">
                <span>Actor: <strong className="text-cyan-300">{notif.actor}</strong></span>
                
                <div className="flex items-center gap-2">
                  {notif.status !== 'archived' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchive(notif.id); }}
                      className="text-slate-400 hover:text-amber-300 transition font-bold flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3" /> Archive
                    </button>
                  )}
                  <span className="text-slate-500 font-bold uppercase">{notif.status}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs font-mono">
              No notifications matching the selected filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Application event notifications managed in client state.</span>
        <span className="text-purple-400 font-bold">NOTIFICATION ENGINE ACTIVE</span>
      </div>
    </Card>
  );
};
