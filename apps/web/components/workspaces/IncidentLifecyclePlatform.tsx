'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SeverityBadge, CategoryBadge, StatusBadge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { incidentService } from '../../lib/api-client';
import {
  Activity,
  ArrowRight,
  Bot,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
  Archive,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, IncidentStatus, Category } from '../../types';

const STAGES: Array<{ id: IncidentStatus; label: string; icon: React.ReactNode; color: string }> = [
  { id: 'reported', label: '1. Citizen Report', icon: <Clock className="w-3.5 h-3.5 text-cyan-400" />, color: 'border-cyan-500/40 text-cyan-300' },
  { id: 'evidence_collection', label: '2. Evidence Collection', icon: <Camera className="w-3.5 h-3.5 text-blue-400" />, color: 'border-blue-500/40 text-blue-300' },
  { id: 'ai_processing', label: '3. AI Processing', icon: <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />, color: 'border-purple-500/40 text-purple-300' },
  { id: 'created', label: '4. Incident Creation', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />, color: 'border-indigo-500/40 text-indigo-300' },
  { id: 'verified', label: '5. Verification', icon: <Search className="w-3.5 h-3.5 text-amber-400" />, color: 'border-amber-500/40 text-amber-300' },
  { id: 'assigned', label: '6. Assignment', icon: <UserCheck className="w-3.5 h-3.5 text-teal-400" />, color: 'border-teal-500/40 text-teal-300' },
  { id: 'investigating', label: '7. Investigation', icon: <Activity className="w-3.5 h-3.5 text-rose-400" />, color: 'border-rose-500/40 text-rose-300' },
  { id: 'resolved', label: '8. Resolution', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, color: 'border-emerald-500/40 text-emerald-300' },
  { id: 'archived', label: '9. Archive', icon: <Archive className="w-3.5 h-3.5 text-slate-400" />, color: 'border-slate-500/40 text-slate-400' },
];

export const IncidentLifecyclePlatform: React.FC = () => {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    updateIncident,
    addToast,
    openConfirmDialog,
  } = useAppStore();

  const [activeStageFilter, setActiveStageFilter] = useState<IncidentStatus | 'all'>('all');

  // Next stage sequence resolver
  const getNextStage = (curr: IncidentStatus): IncidentStatus => {
    const seq: IncidentStatus[] = [
      'reported',
      'evidence_collection',
      'ai_processing',
      'created',
      'verified',
      'assigned',
      'investigating',
      'resolved',
      'archived',
    ];
    const idx = seq.indexOf(curr);
    return idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : 'archived';
  };

  // Execute 1-Tap Stage Transition (SSOT update in Zustand + API Client)
  const handleTransitionStage = async (inc: Incident, targetStatus?: IncidentStatus) => {
    const nextStatus = targetStatus || getNextStage(inc.status);
    
    // Abstracted API Client service invocation
    await incidentService.transitionStage({
      incidentId: inc.id,
      newStatus: nextStatus,
      remarks: `Transitioned to ${nextStatus.toUpperCase()}`,
      actor: 'Control Command Engine',
    });

    // Zustand SSOT update
    updateIncident(inc.id, { status: nextStatus });
    addToast({
      title: 'Workflow Stage Transitioned',
      message: `Incident ${inc.id} moved to stage "${nextStatus.toUpperCase()}".`,
      type: 'success',
    });
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── PLATFORM HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Incident Intelligence Platform Engine</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  SSOT ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                9-Stage Operational Lifecycle Pipeline: Intake → AI Processing → Verification → Archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-400">Pipeline Total:</span>
            <span className="text-cyan-400 font-black text-xs">{incidents.length} Active Operations</span>
          </div>
        </div>

        {/* ── 9-STAGE WORKFLOW STEPPER BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 mb-4 z-10 relative text-[10px] font-mono">
          {STAGES.map((stg) => {
            const count = incidents.filter((i) => i.status === stg.id).length;
            const isSelected = activeStageFilter === stg.id;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveStageFilter(isSelected ? 'all' : stg.id)}
                className={cn(
                  'p-2 rounded-xl border bg-[#050B14] flex flex-col justify-between gap-1 transition-all duration-200 text-left group',
                  isSelected ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300' : 'border-white/10 hover:border-cyan-500/30 text-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-white/5">{stg.icon}</span>
                  <span className="font-bold text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-cyan-400">
                    {count}
                  </span>
                </div>
                <span className="font-bold text-[9px] truncate leading-tight mt-1">{stg.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── KANBAN PIPELINE STREAM ── */}
        <div className="overflow-x-auto pb-3 z-10 relative">
          <div className="flex gap-3 min-w-[1200px]">
            {STAGES.map((stg) => {
              const stageIncidents = incidents.filter((i) => i.status === stg.id);

              return (
                <div
                  key={stg.id}
                  className="flex-1 min-w-[240px] bg-[#050B14] border border-white/10 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 text-[10px] font-mono font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">{stg.icon} {stg.label}</span>
                      <span className="text-cyan-400">{stageIncidents.length}</span>
                    </div>

                    {/* Stage Incident Cards Stream */}
                    <div className="space-y-2.5">
                      {stageIncidents.map((inc) => {
                        const isSelectedInc = selectedIncident?.id === inc.id;

                        return (
                          <motion.div
                            key={inc.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedIncident(inc)}
                            className={cn(
                              'p-3 rounded-xl border bg-[#070D18] flex flex-col gap-2 transition-all cursor-pointer group',
                              isSelectedInc ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-white/10 hover:border-cyan-500/30'
                            )}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-cyan-400">{inc.id}</span>
                              <SeverityBadge severity={inc.severity} />
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                                {inc.title}
                              </h4>
                              <span className="text-[9px] text-slate-400 block mt-0.5">📍 {inc.location?.name || 'Vijayawada'}</span>
                            </div>

                            {/* 1-Tap Stage Advancement Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransitionStage(inc);
                              }}
                              className="mt-1 w-full py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-[9px] font-mono font-bold transition flex items-center justify-center gap-1"
                            >
                              Advance Stage <ArrowRight className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}

                      {stageIncidents.length === 0 && (
                        <div className="text-center py-8 text-slate-600 text-[10px] font-mono">
                          No operations in {stg.id} stage.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3 mt-4 border-t border-white/10 z-10 relative">
        <span>Single Source of Truth (SSOT) binding all 9 workspaces & AI Situation Rooms</span>
        <span className="text-emerald-400 font-bold">PIPELINE NOMINAL</span>
      </div>
    </Card>
  );
};
