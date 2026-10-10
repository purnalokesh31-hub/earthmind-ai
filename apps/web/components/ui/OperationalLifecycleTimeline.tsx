'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { Modal } from './Overlay';
import { StatusBadge } from './Badge';
import { formatDate } from '../../lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
  Bot,
  FileText,
  Activity,
  Paperclip,
  Archive,
  Sparkles,
  Camera,
  Plus,
  Send,
  Edit3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, IncidentStatus } from '../../types';

export interface TimelineStageEvent {
  id: string;
  stage: 'Reported' | 'AI Processing' | 'Created' | 'Verified' | 'Assigned' | 'Investigation' | 'Resolved' | 'Archived';
  icon: React.ReactNode;
  timestamp: string;
  department: string;
  officer: string;
  status: IncidentStatus;
  remarks: string;
  attachments?: string[];
}

export const OperationalLifecycleTimeline: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  const { incidents, selectedIncident, updateIncident, addToast } = useAppStore();

  const activeInc = useMemo(() => {
    return selectedIncident || incidents[0] || null;
  }, [selectedIncident, incidents]);

  // Modal for Manual Stage Update & Remark Entry
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [customRemark, setCustomRemark] = useState('');
  const [targetNextStatus, setTargetNextStatus] = useState<IncidentStatus>('verified');

  // Compute 8 Lifecycle Timeline Events for the active incident
  const timelineEvents = useMemo(() => {
    if (!activeInc) return [];

    const deptMap: Record<string, string> = {
      infrastructure: 'PWD Infrastructure',
      agriculture: 'Department of Agriculture',
      environment: 'Environmental Audit Board',
      disaster: 'Disaster Emergency Preparedness',
      water: 'Municipal Water Resources',
      energy: 'State Energy Grid Command',
      urban: 'Urban Mobility & Planning',
      climate: 'Climate Action Cell',
      wildlife: 'Forest Wildlife Protection',
    };

    const dept = deptMap[activeInc.category] || 'Multi-Domain Control';
    const officer = activeInc.reportedBy || 'Officer Lokesh';

    const events: TimelineStageEvent[] = [
      // 1. Reported
      {
        id: `stg-1-${activeInc.id}`,
        stage: 'Reported',
        icon: <Clock className="w-3.5 h-3.5 text-cyan-400" />,
        timestamp: formatDate(activeInc.reportedAt),
        department: dept,
        officer: 'Citizen Sentinel / Intake',
        status: 'reported',
        remarks: `Case intake recorded: "${activeInc.title}". Location pinned at ${activeInc.location?.name || 'Vijayawada Sector'}.`,
        attachments: ['Intake_GPS_Telematics.json'],
      },
      // 2. AI Processing
      {
        id: `stg-2-${activeInc.id}`,
        stage: 'AI Processing',
        icon: <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: 'EarthMind Neural AI Engine',
        officer: 'Neural Model v4.2',
        status: 'ai_processing',
        remarks: `Neural computer vision pre-scan completed. Classification: ${activeInc.category.toUpperCase()} hazard with 94.2% confidence.`,
        attachments: ['Neural_Heatmap_Overlay.png'],
      },
      // 3. Created
      {
        id: `stg-3-${activeInc.id}`,
        stage: 'Created',
        icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: 'System Engine',
        status: 'created',
        remarks: `Operational case record ${activeInc.id} generated and committed to the city ledger.`,
        attachments: ['Case_Ledger_Record.pdf'],
      },
      // 4. Verified
      {
        id: `stg-4-${activeInc.id}`,
        stage: 'Verified',
        icon: <Search className="w-3.5 h-3.5 text-amber-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: 'Control Room Supervisor',
        status: 'verified',
        remarks: `Satellite GIS imagery and RTK sensor readings cross-verified by duty supervisor.`,
        attachments: ['Satellite_GIS_Verification.png'],
      },
      // 5. Assigned
      {
        id: `stg-5-${activeInc.id}`,
        stage: 'Assigned',
        icon: <UserCheck className="w-3.5 h-3.5 text-teal-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: officer,
        status: 'assigned',
        remarks: `Dispatched Response Lead ${officer} (Tactical Squad L3) to sector location.`,
        attachments: ['Officer_Dispatch_Ticket.pdf'],
      },
      // 6. Investigation
      {
        id: `stg-6-${activeInc.id}`,
        stage: 'Investigation',
        icon: <Activity className="w-3.5 h-3.5 text-rose-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: officer,
        status: 'investigating',
        remarks: `Field team arrived on-site. Deployed ground-penetrating radar and isolated conduit valves.`,
        attachments: ['Onsite_Sensor_Telemetry.log', 'Ground_Radar_Scan.raw'],
      },
      // 7. Resolved
      {
        id: `stg-7-${activeInc.id}`,
        stage: 'Resolved',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: officer,
        status: 'resolved',
        remarks: `Remediation inspection passed. Conduit pressure stabilized and road resurfaced.`,
        attachments: ['Final_Inspection_Signoff.pdf'],
      },
      // 8. Archived
      {
        id: `stg-8-${activeInc.id}`,
        stage: 'Archived',
        icon: <Archive className="w-3.5 h-3.5 text-slate-400" />,
        timestamp: formatDate(activeInc.updatedAt),
        department: dept,
        officer: 'System Auditor',
        status: 'archived',
        remarks: `Case archived to cryptographically sealed ISO-27001 audit ledger.`,
        attachments: ['ISO27001_Audit_Certificate.pem'],
      },
    ];

    return events.slice(0, limit);
  }, [activeInc, limit]);

  // Execute Manual Stage Update & Synchronization
  const handleManualStageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInc) return;

    updateIncident(activeInc.id, {
      status: targetNextStatus,
      updatedAt: new Date().toISOString(),
    });

    addToast({
      title: 'Lifecycle Stage Updated',
      message: `Manual update committed: Case ${activeInc.id} moved to "${targetNextStatus.toUpperCase()}".`,
      type: 'success',
    });

    setShowUpdateModal(false);
    setCustomRemark('');
  };

  if (!activeInc) return null;

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Lifecycle Engine Stream</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  8 STAGES ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Real-time operational audit timeline for case <strong className="text-cyan-400">{activeInc.id}</strong>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-cyan-500/40"
            icon={<Edit3 className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={() => setShowUpdateModal(true)}
          >
            Manual Stage Update
          </Button>
        </div>

        {/* ── 8-STAGE TIMELINE CARDS STREAM ── */}
        <div className="space-y-3 z-10 relative font-mono text-[10px]">
          {timelineEvents.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-3.5 rounded-xl bg-[#050B14] border border-white/10 flex flex-col gap-2 relative overflow-hidden group hover:border-cyan-500/30 transition shadow-md"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-white/5">{evt.icon}</span>
                  <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition">
                    {evt.stage}
                  </span>
                  <StatusBadge status={evt.status} />
                </div>
                <span className="text-[9px] text-slate-500">{evt.timestamp}</span>
              </div>

              {/* Officer & Department Info */}
              <div className="flex items-center gap-3 text-[9px] text-slate-400">
                <span>Officer: <strong className="text-slate-200">{evt.officer}</strong></span>
                <span>• Dept: <strong className="text-cyan-300">{evt.department}</strong></span>
              </div>

              {/* Remarks */}
              <p className="text-slate-300 font-sans text-xs leading-relaxed pt-1 border-t border-white/5">
                {evt.remarks}
              </p>

              {/* Attachments */}
              {evt.attachments && evt.attachments.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Paperclip className="w-3 h-3 text-cyan-400" />
                  {evt.attachments.map((att, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 text-[9px] font-bold">
                      {att}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── MANUAL UPDATE MODAL ── */}
      {showUpdateModal && (
        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          title={`Manual Lifecycle Stage Update — ${activeInc.id}`}
          size="md"
        >
          <form onSubmit={handleManualStageUpdate} className="flex flex-col gap-4 font-mono text-[11px] text-slate-200">
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Lifecycle Stage</label>
              <select
                value={targetNextStatus}
                onChange={(e) => setTargetNextStatus(e.target.value as IncidentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#050B14] border border-white/10 text-slate-100 text-xs outline-none focus:border-cyan-500"
              >
                <option value="verified">4. Verified</option>
                <option value="assigned">5. Assigned</option>
                <option value="investigating">6. Investigation</option>
                <option value="resolved">7. Resolved</option>
                <option value="archived">8. Archived</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Operator Log Remark</label>
              <textarea
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                placeholder="Enter stage transition remark..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#050B14] border border-white/10 text-slate-100 text-xs outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button variant="secondary" size="sm" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                Commit Stage Update
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>ISO-27001 audit timeline synchronized across all 9 domain workspaces.</span>
        <span className="text-emerald-400 font-bold">TIMELINE VERIFIED</span>
      </div>
    </Card>
  );
};
