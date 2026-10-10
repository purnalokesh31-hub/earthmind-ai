'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { SeverityBadge, CategoryBadge, StatusBadge } from './Badge';
import { formatDate } from '../../lib/utils';
import { Activity, Clock, ShieldAlert, UserCheck, CheckCircle2, FileText, Bot, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface OperationalEvent {
  id: string;
  eventType: 'report_submitted' | 'ai_analyzed' | 'verified' | 'officer_assigned' | 'updated' | 'report_generated' | 'resolved';
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  timestamp: string;
  incidentId: string;
  icon: string;
}

export const LiveOperationalTimeline: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  const { incidents, notifications } = useAppStore();

  // Dynamically calculate and synthesize live timeline events from global state
  const liveEvents = useMemo(() => {
    const events: OperationalEvent[] = [];

    const deptMap: Record<string, string> = {
      infrastructure: 'Infrastructure Intelligence',
      agriculture: 'Agriculture Intelligence',
      environment: 'Environmental Intelligence',
      disaster: 'Disaster Intelligence',
      water: 'Water Intelligence',
      energy: 'Energy Intelligence',
      urban: 'Urban Intelligence',
      climate: 'Climate Intelligence',
      wildlife: 'Wildlife Intelligence',
    };

    incidents.forEach((inc) => {
      const dept = deptMap[inc.category] || 'Multi-Domain Intelligence';
      const sev = inc.severity;

      // Event 1: Citizen / Field Report Submitted
      events.push({
        id: `evt-${inc.id}-report`,
        eventType: 'report_submitted',
        title: 'Citizen Report Submitted',
        description: `Field report ${inc.id}: "${inc.title}" logged at ${inc.location?.name || 'Vijayawada Region'}.`,
        category: inc.category,
        priority: sev,
        department: dept,
        timestamp: formatDate(inc.reportedAt),
        incidentId: inc.id,
        icon: '📱',
      });

      // Event 2: AI Analysis Completed
      if (inc.aiAnalysis) {
        events.push({
          id: `evt-${inc.id}-ai`,
          eventType: 'ai_analyzed',
          title: 'AI Analysis Completed',
          description: `AI model evaluated ${inc.id} with ${inc.aiAnalysis.confidence}% confidence: ${inc.aiAnalysis.classification}.`,
          category: inc.category,
          priority: sev,
          department: dept,
          timestamp: formatDate(inc.updatedAt),
          incidentId: inc.id,
          icon: '🤖',
        });
      }

      // Event 3: Officer Assigned
      if (inc.reportedBy || inc.status === 'assigned' || inc.status === 'investigating') {
        events.push({
          id: `evt-${inc.id}-assigned`,
          eventType: 'officer_assigned',
          title: 'Officer Assigned',
          description: `Response unit ${inc.reportedBy || 'Officer Lokesh'} assigned to ${inc.id}.`,
          category: inc.category,
          priority: sev,
          department: dept,
          timestamp: formatDate(inc.updatedAt),
          incidentId: inc.id,
          icon: '👮',
        });
      }

      // Event 4: Incident Status Updated / Verified
      if (inc.status === 'investigating' || inc.status === 'ai_processing' || inc.status === 'verified') {
        events.push({
          id: `evt-${inc.id}-updated`,
          eventType: 'updated',
          title: 'Incident Updated',
          description: `Case ${inc.id} status transitioned to "${inc.status.toUpperCase()}". SLA tracking active.`,
          category: inc.category,
          priority: sev,
          department: dept,
          timestamp: formatDate(inc.updatedAt),
          incidentId: inc.id,
          icon: '⚙️',
        });
      }

      // Event 5: Incident Resolved
      if (inc.status === 'resolved') {
        events.push({
          id: `evt-${inc.id}-resolved`,
          eventType: 'resolved',
          title: 'Incident Resolved',
          description: `Case ${inc.id} successfully contained and verified resolved. SLA closed.`,
          category: inc.category,
          priority: sev,
          department: dept,
          timestamp: formatDate(inc.updatedAt),
          incidentId: inc.id,
          icon: '✅',
        });
      }
    });

    // Also synthesize notifications into report events
    notifications.forEach((n, idx) => {
      if (n.title.toLowerCase().includes('report') || n.title.toLowerCase().includes('briefing')) {
        events.push({
          id: `evt-notif-${n.id}`,
          eventType: 'report_generated',
          title: 'Report Generated',
          description: `${n.title}: ${n.message}`,
          category: 'infrastructure',
          priority: 'medium',
          department: 'Executive Briefing Unit',
          timestamp: n.timestamp,
          incidentId: 'SYS-RPT',
          icon: '📄',
        });
      }
    });

    // Sort by timestamp (newest first) and limit
    return events.slice(0, limit);
  }, [incidents, notifications, limit]);

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-white/10 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Live Operational Activity Stream</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                REAL-TIME
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Automated event logging synced with global application state</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500 font-bold">
          {liveEvents.length} LIVE EVENTS
        </span>
      </div>

      {/* ── TIMELINE CONTAINER ── */}
      <div className="relative pl-6 border-l border-white/10 ml-3 flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 z-10">
        <AnimatePresence>
          {liveEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="relative flex flex-col gap-1.5 p-3 rounded-xl bg-[#050B14] border border-white/5 hover:border-cyan-500/30 transition group"
            >
              {/* Timeline Icon Marker */}
              <div className="absolute -left-[33px] top-3.5 w-6 h-6 rounded-full bg-[#0A1220] border border-cyan-500/50 flex items-center justify-center text-xs shadow-md">
                {evt.icon}
              </div>

              {/* Event Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {evt.title}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                    {evt.incidentId}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[9px] font-mono">
                  <SeverityBadge severity={evt.priority} />
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" /> {evt.timestamp}
                  </span>
                </div>
              </div>

              {/* Event Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

              {/* Event Footer Badges */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[9px] font-mono">
                <span className="text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold">
                  🏢 {evt.department}
                </span>
                <CategoryBadge category={evt.category as any} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-3 mt-3 border-t border-white/10 text-[10px] font-mono text-slate-500 flex items-center justify-between z-10">
        <span>Timeline automatically updates on incident intake, verification, or dispatch.</span>
        <span className="text-cyan-400 font-bold">GRID TELEMETRY // ACTIVE</span>
      </div>
    </Card>
  );
};
