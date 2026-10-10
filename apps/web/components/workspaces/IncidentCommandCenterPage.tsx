'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { SeverityBadge, CategoryBadge, StatusBadge } from '../ui/Badge';
import {
  EnterpriseWorkspaceHeader,
  OperationalAIAnalyst,
  OperationalLifecycleTimeline,
  EvidencePreviewPanel,
  QuickActionHub,
  ResourceIntelligenceCenter,
  IncidentIntelligenceEngine,
  EnterpriseAutomationEngineCard,
  AIVisionIntelligenceStudio,
  ComputerVisionStudioCard,
  EnterpriseCollaborationHub,
  SLATimer,
} from '../ui';
import { formatDate } from '../../lib/utils';
import {
  ShieldAlert,
  MapPin,
  Clock,
  UserCheck,
  MessageSquare,
  History,
  Layers,
  Zap,
  FileText,
  Send,
  ExternalLink,
  Bot,
  Activity,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export const IncidentCommandCenterPage: React.FC = () => {
  const {
    selectedIncident,
    incidents,
    setSelectedIncident,
    setActiveTab,
    updateIncident,
    addToast,
    openConfirmDialog,
    openReportModal,
  } = useAppStore();

  // Focus incident or fallback to first critical case
  const activeIncident = useMemo(() => {
    return selectedIncident || incidents.find((i) => i.severity === 'critical') || incidents[0] || null;
  }, [selectedIncident, incidents]);

  // Operator Comments State
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; role: string; text: string; timestamp: string }>>([
    { id: 'c-1', author: 'Control Room Officer Rakesh', role: 'Supervisor', text: 'Confirmed sub-surface water pressure anomaly. Dispatched Squad L3.', timestamp: '14m ago' },
    { id: 'c-2', author: 'Officer Lokesh', role: 'Field Commander', text: 'Arrived on-site at Benz Circle. Isolated surrounding valve 4B.', timestamp: '8m ago' },
  ]);

  // Related Incidents
  const relatedIncidents = useMemo(() => {
    if (!activeIncident) return [];
    return incidents.filter((i) => i.id !== activeIncident.id && i.category === activeIncident.category).slice(0, 3);
  }, [activeIncident, incidents]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'Chief Operations Officer',
        role: 'Command Duty',
        text: commentText,
        timestamp: 'Just now',
      },
    ]);
    setCommentText('');
    addToast({ title: 'Comment Posted', message: 'Added operator observation note to case ledger.', type: 'success' });
  };

  const handleReassignOfficer = () => {
    if (!activeIncident) return;
    openConfirmDialog({
      title: `Reassign Field Officer for ${activeIncident.id}`,
      message: `Reassign case "${activeIncident.title}" to Duty Squad Alpha (Officer Rakesh)?`,
      confirmLabel: 'Reassign Squad Alpha',
      onConfirm: () => {
        updateIncident(activeIncident.id, { reportedBy: 'Officer Rakesh' });
        addToast({ title: 'Officer Reassigned', message: `Case ${activeIncident.id} assigned to Officer Rakesh.`, type: 'success' });
      },
    });
  };

  if (!activeIncident) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 lg:pb-8 text-slate-200"
    >
      {/* ──────────────────────────────────────────────────────────
          1. ENTERPRISE HEADER
      ────────────────────────────────────────────────────────── */}
      <EnterpriseWorkspaceHeader
        domain={activeIncident.category}
        title={`Incident Command Center — ${activeIncident.id}`}
        icon="🛡️"
        description={`Dedicated operational command workspace for case "${activeIncident.title}"`}
        searchQuery=""
        onSearchChange={() => {}}
      />

      {/* ──────────────────────────────────────────────────────────
          2. INCIDENT SUMMARY
      ────────────────────────────────────────────────────────── */}
      <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                  Case Summary & Telemetry Overview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={activeIncident.severity} />
                <StatusBadge status={activeIncident.status} />
              </div>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[9px] block">Title</span>
                <h2 className="text-sm font-bold text-slate-100">{activeIncident.title}</h2>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[9px] block">Description</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">{activeIncident.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Sector Location:</span>
                  <span className="text-slate-200 font-bold">📍 {activeIncident.location?.name || 'Vijayawada'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reported Time:</span>
                  <span className="text-slate-200 font-bold">{formatDate(activeIncident.reportedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">AI Confidence:</span>
                  <span className="text-emerald-400 font-bold">94.2% Verified</span>
                </div>
              </div>

              {/* Dynamic Live SLA Tracking Engine */}
              <div className="pt-2">
                <SLATimer incident={activeIncident} />
              </div>
            </div>
          </div>
        </Card>

      {/* ──────────────────────────────────────────────────────────
          5. RESOURCE INTELLIGENCE CENTER (Roster & Dispatch)
      ────────────────────────────────────────────────────────── */}
      <ResourceIntelligenceCenter />

      {/* ──────────────────────────────────────────────────────────
          3. ENTERPRISE AI VISION INTELLIGENCE STUDIO & COMPUTER VISION ENGINE
      ────────────────────────────────────────────────────────── */}
      <AIVisionIntelligenceStudio />
      <ComputerVisionStudioCard />

      {/* ──────────────────────────────────────────────────────────
          3. EVIDENCE PREVIEW & 4. AI ANALYSIS (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Evidence Center */}
        <EvidencePreviewPanel />

        {/* 4. Operational AI Analyst */}
        <OperationalAIAnalyst />
      </div>

      {/* ──────────────────────────────────────────────────────────
          6. LIFECYCLE TIMELINE
      ────────────────────────────────────────────────────────── */}
      <OperationalLifecycleTimeline />

      {/* ──────────────────────────────────────────────────────────
          7. ENTERPRISE COLLABORATION HUB (Comments, Notes, Mentions)
      ────────────────────────────────────────────────────────── */}
      <EnterpriseCollaborationHub />

      {/* ──────────────────────────────────────────────────────────
          8. IMMUTABLE OPERATOR AUDIT TRAIL
      ────────────────────────────────────────────────────────── */}
      <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-white/10 shadow-2xl font-mono">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                  Immutable Operator Audit Trail
                </h3>
              </div>
              <span className="text-[9px] text-slate-500">ISO-27001 LOG</span>
            </div>

            <div className="space-y-2 text-[10px]">
              {[
                { time: '14m ago', action: 'STAGE_TRANSITION', actor: 'System Engine', desc: 'Moved case from INTENDED to ASSIGNED' },
                { time: '22m ago', action: 'AI_PRESCAN_RUN', actor: 'Neural Model v4.2', desc: 'Classification: STRUCTURAL_HAZARD (94% conf)' },
                { time: '35m ago', action: 'CASE_CREATED', actor: 'Citizen Intake', desc: 'Case EM-208 logged at Benz Circle' },
              ].map((log, i) => (
                <div key={i} className="p-2 rounded-lg bg-[#050B14] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-indigo-400 font-bold uppercase">{log.action}: </span>
                    <span className="text-slate-300">{log.desc}</span>
                  </div>
                  <span className="text-slate-500 text-[9px]">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[9px] text-slate-500 flex justify-between">
            <span>Cryptographically sealed ledger entries</span>
            <span className="text-emerald-400 font-bold">VERIFIED</span>
          </div>
        </Card>


      {/* ──────────────────────────────────────────────────────────
          9. INCIDENT INTELLIGENCE & CORRELATIONS ENGINE
      ────────────────────────────────────────────────────────── */}
      <IncidentIntelligenceEngine />

      {/* ──────────────────────────────────────────────────────────
          10. ENTERPRISE AUTOMATION ENGINE (12 Pipeline Steps)
      ────────────────────────────────────────────────────────── */}
      <EnterpriseAutomationEngineCard />

      {/* ──────────────────────────────────────────────────────────
          11. QUICK ACTIONS HUB
      ────────────────────────────────────────────────────────── */}
      <QuickActionHub />

      {/* ──────────────────────────────────────────────────────────
          12. C-SUITE EXECUTIVE SUMMARY BRIEFING
      ────────────────────────────────────────────────────────── */}
      <Card className="p-5 bg-[#0A1220]/95 border-cyan-500/40 shadow-2xl relative overflow-hidden font-mono text-[11px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> C-Suite Executive Telemetry Briefing Summary
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="text-[9px] py-1 border-white/10 text-slate-300"
            onClick={() => openReportModal(activeIncident.category, `Executive Briefing — ${activeIncident.id}`)}
          >
            Export PDF Executive Briefing
          </Button>
        </div>

        <p className="text-slate-300 font-sans text-xs leading-relaxed">
          Case <strong>{activeIncident.id}</strong> ({activeIncident.title}) is currently under active remediation by Response Squad L3 in {activeIncident.location?.name || 'Vijayawada Sector'}. 
          AI neural pre-scan confirmed a <strong>94.2% hazard confidence rating</strong>. Response team dispatch is operating within the <strong>2.0 hour SLA window</strong>.
        </p>
      </Card>
    </motion.div>
  );
};
