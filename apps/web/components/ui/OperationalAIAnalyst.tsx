'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge } from './Badge';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserCheck,
  MapPin,
  ListTodo,
  Layers,
  Building2,
  Radio,
  Zap,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export const OperationalAIAnalyst: React.FC = () => {
  const {
    selectedIncident,
    incidents,
    openReportModal,
    setActiveTab,
    updateIncident,
    openConfirmDialog,
    addToast,
  } = useAppStore();

  // Selected incident or fallback to primary critical case
  const activeIncident = useMemo(() => {
    if (selectedIncident) return selectedIncident;
    return incidents.find((i) => i.severity === 'critical') || incidents[0] || null;
  }, [selectedIncident, incidents]);

  // Derived Nearby Incidents
  const nearbyIncidents = useMemo(() => {
    if (!activeIncident) return [];
    return incidents.filter(
      (i) => i.id !== activeIncident.id && (i.category === activeIncident.category || i.severity === 'critical')
    ).slice(0, 2);
  }, [activeIncident, incidents]);

  // Derived AI Intelligence metrics
  const aiDetails = useMemo(() => {
    if (!activeIncident) {
      return {
        execSummary: 'System operating at optimal capacity. Planetary Health Index is 92.4 / 100.',
        rootCause: 'Normal environmental equilibrium.',
        riskLevel: 'LOW (12%)',
        priority: 'P4 - Routine Monitoring',
        affectedDepts: ['Urban Operations'],
        suggestedResources: ['Field Patrol Unit 01'],
        recommendedActions: ['Continue automated satellite scanning'],
      };
    }

    const isCrit = activeIncident.severity === 'critical';
    const isHigh = activeIncident.severity === 'high';

    return {
      execSummary: isCrit
        ? `CRITICAL TELEMETRY ALERT: High-consequence incident detected in ${activeIncident.location?.name || 'Vijayawada'}. Immediate intervention required to prevent cascade failure.`
        : `OPERATIONAL ANALYSIS: Active ${activeIncident.category} case under monitoring. AI confidence level is 94.2%.`,
      incidentSummary: activeIncident.description || `Case logged under ${activeIncident.category} domain.`,
      rootCause: isCrit
        ? 'Soil erosion & heavy vehicle pressure causing micro-fractures in sub-surface infrastructure.'
        : isHigh
        ? 'Thermal stress & high usage load exceeding design margins.'
        : 'Routine environmental degradation.',
      riskLevel: isCrit ? 'CRITICAL (94% RISK)' : isHigh ? 'HIGH (78% RISK)' : 'MEDIUM (45% RISK)',
      priority: isCrit ? 'P1 - Immediate Intervention' : isHigh ? 'P2 - High Priority' : 'P3 - Standard SLA',
      affectedDepts: [
        `${activeIncident.category.toUpperCase()} Department`,
        'Emergency Response Command',
        'Vijayawada Municipal Board',
      ],
      suggestedResources: [
        'Heavy Hydraulic Rig 02',
        'Aerial Scanning Drone 01',
        'Field Inspection Squad L3',
      ],
      recommendedActions: activeIncident.aiAnalysis?.recommendations || [
        'Dispatch primary field unit to GPS coordinates',
        'Isolate surrounding utility main valves',
        'Post public safety warning on city portal',
      ],
    };
  }, [activeIncident]);

  // Action handlers
  const handleAssignTeam = () => {
    if (!activeIncident) return;
    openConfirmDialog({
      title: `Assign Rapid Response Team to ${activeIncident.id}`,
      message: `Dispatch Response Unit L3 (Officer Lokesh) to "${activeIncident.title}"?`,
      confirmLabel: 'Dispatch Team L3',
      onConfirm: () => {
        updateIncident(activeIncident.id, { status: 'assigned', reportedBy: 'Officer Lokesh' });
        addToast({ title: 'Team Dispatched', message: `Unit L3 dispatched to ${activeIncident.id}.`, type: 'success' });
      },
    });
  };

  const handleOpenDigitalTwin = () => {
    if (!activeIncident) return;
    setActiveTab('map');
    addToast({ title: 'Digital Twin Centered', message: `Map centered on ${activeIncident.id}.`, type: 'info' });
  };

  const handleGenerateReport = () => {
    if (!activeIncident) return;
    openReportModal(activeIncident.category, `AI Operational Analyst Briefing — ${activeIncident.id}: ${activeIncident.title}`);
  };

  const handleCreateTask = () => {
    if (!activeIncident) return;
    addToast({ title: 'Follow-up Task Created', message: `Added follow-up inspection task for ${activeIncident.id}.`, type: 'success' });
  };

  if (!activeIncident) return null;

  return (
    <Card className="flex flex-col justify-between p-4 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── ANALYST HEADER ── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 z-10 relative">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span>EarthMind AI Operational Analyst</span>
                <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                  MODEL V4.2
                </span>
              </h3>
              <p className="text-[9px] text-slate-400 font-mono">Real-time predictive telemetry & causal analysis</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono font-bold text-slate-400 block">CASE TARGET</span>
            <span className="text-xs font-mono font-black text-cyan-400">{activeIncident.id}</span>
          </div>
        </div>

        {/* ── 1. EXECUTIVE SUMMARY ── */}
        <div className="p-3 rounded-xl bg-[#050B14] border border-cyan-500/20 mb-3 text-[11px] z-10 relative">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[10px] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Executive Summary
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">{aiDetails.execSummary}</p>
        </div>

        {/* ── 2. INCIDENT SUMMARY & PRIORITY ROW ── */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-[10px] font-mono z-10 relative">
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 font-bold uppercase block mb-1">Incident Title</span>
            <span className="text-slate-100 font-bold block truncate">{activeIncident.title}</span>
            <span className="text-slate-400 text-[9px]">📍 {activeIncident.location?.name || 'Vijayawada'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 font-bold uppercase block mb-1">Priority SLA</span>
            <span className="text-rose-400 font-bold block">{aiDetails.priority}</span>
            <span className="text-slate-400 text-[9px]">{aiDetails.riskLevel}</span>
          </div>
        </div>

        {/* ── 3. ROOT CAUSE ANALYSIS & RISK ASSESSMENT ── */}
        <div className="space-y-2 mb-3 text-[10px] z-10 relative font-mono">
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-amber-400 font-bold uppercase block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Root Cause Analysis
            </span>
            <p className="text-slate-300 text-[10px] font-sans">{aiDetails.rootCause}</p>
          </div>

          {/* ── 4. RECOMMENDED ACTIONS ── */}
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-emerald-400 font-bold uppercase block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Recommended Actions
            </span>
            <ul className="space-y-1 text-[10px] text-slate-300 font-sans">
              {aiDetails.recommendedActions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-mono font-bold">{idx + 1}.</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 5. AFFECTED DEPARTMENTS & SUGGESTED RESOURCES ── */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-[9px] font-mono z-10 relative">
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/5">
            <span className="text-slate-500 font-bold uppercase block mb-1">Affected Depts</span>
            {aiDetails.affectedDepts.map((d, i) => (
              <span key={i} className="block text-slate-300 font-medium">• {d}</span>
            ))}
          </div>

          <div className="p-2 rounded-xl bg-[#050B14] border border-white/5">
            <span className="text-slate-500 font-bold uppercase block mb-1">Suggested Equipment</span>
            {aiDetails.suggestedResources.map((r, i) => (
              <span key={i} className="block text-cyan-300 font-medium">⚡ {r}</span>
            ))}
          </div>
        </div>

        {/* ── 6. NEARBY INCIDENTS ── */}
        {nearbyIncidents.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10 mb-3 text-[10px] font-mono z-10 relative">
            <span className="text-slate-400 font-bold uppercase block mb-1">Nearby Related Incidents</span>
            <div className="space-y-1">
              {nearbyIncidents.map((ni) => (
                <div key={ni.id} className="flex items-center justify-between bg-white/5 p-1.5 rounded">
                  <span className="text-slate-200 font-bold truncate">{ni.id}: {ni.title}</span>
                  <SeverityBadge severity={ni.severity} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 7. OPERATIONAL ACTION BUTTONS (4 CONTROLS) ── */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 z-10 relative text-[10px]">
        <Button
          variant="primary"
          size="sm"
          className="py-2"
          icon={<UserCheck className="w-3.5 h-3.5" />}
          onClick={handleAssignTeam}
        >
          Assign Team
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="py-2 border-white/10 text-slate-200 hover:border-cyan-500/40"
          icon={<MapPin className="w-3.5 h-3.5 text-cyan-400" />}
          onClick={handleOpenDigitalTwin}
        >
          Open Map
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="py-2 border-white/10 text-slate-200 hover:border-indigo-500/40"
          icon={<FileText className="w-3.5 h-3.5 text-indigo-400" />}
          onClick={handleGenerateReport}
        >
          PDF Report
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="py-2 text-slate-200"
          icon={<ListTodo className="w-3.5 h-3.5 text-amber-400" />}
          onClick={handleCreateTask}
        >
          Follow-up Task
        </Button>
      </div>
    </Card>
  );
};
