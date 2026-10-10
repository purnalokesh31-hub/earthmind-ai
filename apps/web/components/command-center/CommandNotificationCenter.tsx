'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Notification Center Panel
// Operational Alerts, SLA Warnings, & System Telemetry Notifications
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface CommandNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'info';
  isRead: boolean;
  timestamp: string;
  linkedIncidentId?: string;
}

export const CommandNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<CommandNotificationItem[]>([
    {
      id: 'notif-1',
      type: 'SLA_WARNING',
      title: '⚡ Critical SLA Breach Warning',
      message: 'Dispatch EM-INC-2026-001 has 5 minutes remaining before automatic L1 escalation to Supervisor.',
      severity: 'critical',
      isRead: false,
      timestamp: new Date().toISOString(),
      linkedIncidentId: 'inc-101',
    },
    {
      id: 'notif-2',
      type: 'AI_DETECTION',
      title: '🤖 New Vision Analysis Ingested',
      message: 'Drone Telemetry #42 completed YOLOv8 inferencing with 96.4% confidence score.',
      severity: 'info',
      isRead: false,
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      linkedIncidentId: 'inc-101',
    },
    {
      id: 'notif-3',
      type: 'DISPATCH_UPDATE',
      title: '✅ Officer En Route',
      message: 'Capt. Rajesh Varma marked status EN_ROUTE for NH-9 Road Subsidence.',
      severity: 'high',
      isRead: true,
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      linkedIncidentId: 'inc-101',
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🔔</span>
          <h3 className="font-bold text-slate-100 text-sm">Operational Notification Center</h3>
        </div>
        <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:underline font-mono">
          Mark All Read
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {notifications.map((n) => {
          const borderClr = n.severity === 'critical' ? 'border-red-500/40 bg-red-950/20' : 'border-slate-800 bg-slate-900/60';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 border rounded-lg space-y-1 ${borderClr} ${!n.isRead ? 'ring-1 ring-cyan-500/30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{n.title}</span>
                <span className="text-[10px] font-mono text-slate-500">{new Date(n.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-300 text-[11px]">{n.message}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
