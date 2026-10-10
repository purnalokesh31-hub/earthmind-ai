'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Modal } from './Overlay';
import { Button } from './Button';
import { SeverityBadge } from './Badge';
import { aiDecisionEngine, AIDecisionResult } from '../../lib/ai-decision-engine';
import {
  Bot,
  Brain,
  Zap,
  ShieldAlert,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AIDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentTitle?: string;
  category?: any;
  severity?: any;
}

const STAGED_PIPELINE_STEPS = [
  { stage: 1, label: 'Intake & Neural Vision Pre-Scan', icon: <Cpu className="w-4 h-4 text-cyan-400 animate-spin" /> },
  { stage: 2, label: 'Cross-Sector Risk Index Hydrodynamics', icon: <Activity className="w-4 h-4 text-purple-400 animate-bounce" /> },
  { stage: 3, label: 'Root Cause Diagnostics & Officer Allocation', icon: <Brain className="w-4 h-4 text-indigo-400 animate-pulse" /> },
  { stage: 4, label: 'Synthesizing Executive Summary & Action Plan', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
];

export const AIDecisionEngineModal: React.FC<AIDecisionModalProps> = ({
  isOpen,
  onClose,
  incidentTitle = 'Benz Circle Sub-surface Subsidence',
  category = 'infrastructure',
  severity = 'high',
}) => {
  const { addToast, updateIncident, selectedIncident } = useAppStore();

  const [processingStage, setProcessingStage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [decisionResult, setDecisionResult] = useState<AIDecisionResult | null>(null);

  // Staged Enterprise Processing Pipeline Animation
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(true);
      setProcessingStage(1);

      const t1 = setTimeout(() => setProcessingStage(2), 600);
      const t2 = setTimeout(() => setProcessingStage(3), 1200);
      const t3 = setTimeout(() => setProcessingStage(4), 1800);
      const t4 = setTimeout(async () => {
        const result = await aiDecisionEngine.analyzeIncident({ category, severity, title: incidentTitle });
        setDecisionResult(result);
        setIsProcessing(false);
      }, 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isOpen, category, severity, incidentTitle]);

  const handleExecuteAction = (actionTitle: string) => {
    addToast({
      title: 'Action Dispatched',
      message: `Dispatched operational command: "${actionTitle}".`,
      type: 'success',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Neural AI Decision Engine"
      size="xl"
    >
      <div className="flex flex-col gap-5 text-slate-200 font-mono">
        
        {/* ── STAGED ENTERPRISE PROCESSING ANIMATION SCREEN ── */}
        {isProcessing && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-5 rounded-2xl bg-[#050B14] border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 animate-pulse">
              <Bot className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center justify-center gap-2">
                <span>Enterprise Neural Model Ingesting Telemetry</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  STAGE {processingStage} / 4
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Processing hazard case "{incidentTitle}" through multi-layer neural classifier...
              </p>
            </div>

            {/* Staged Pipeline Stepper */}
            <div className="w-full max-w-lg space-y-2 text-[10px]">
              {STAGED_PIPELINE_STEPS.map((stg) => {
                const isActive = processingStage === stg.stage;
                const isDone = processingStage > stg.stage;

                return (
                  <div
                    key={stg.stage}
                    className={cn(
                      'p-2.5 rounded-xl border flex items-center justify-between transition-all duration-300',
                      isActive ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : isDone ? 'bg-[#070D18] border-emerald-500/40 text-emerald-400' : 'bg-[#050B14] border-white/5 text-slate-500'
                    )}
                  >
                    <span className="flex items-center gap-2 font-bold">
                      {stg.icon} {stg.label}
                    </span>
                    {isDone ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">✓ DONE</span>
                    ) : isActive ? (
                      <span className="text-cyan-400 font-bold animate-pulse">PROCESSING...</span>
                    ) : (
                      <span className="text-slate-600">QUEUED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMPLETE AI DECISION ENGINE OUTPUT (12 PARAMETERS) ── */}
        {!isProcessing && decisionResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* Header Telemetry Pill */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-[10px]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100">CLASSIFICATION:</span>
                <span className="text-cyan-300 font-bold">{decisionResult.classification}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">Confidence: {decisionResult.confidenceScore}%</span>
                <span className="text-rose-400 font-bold">Risk Index: {decisionResult.riskIndex}/100</span>
              </div>
            </div>

            {/* Grid of 12 Decision Output Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
              
              {/* 1. Priority & SLA */}
              <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">1. Priority & SLA Target</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-bold">{decisionResult.priorityLevel}</span>
                  <span className="text-slate-300">ETA: {decisionResult.estimatedResolutionTime}</span>
                </div>
              </div>

              {/* 2. Recommended Officer */}
              <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">2. Recommended Response Lead</span>
                <span className="text-emerald-400 font-bold text-xs">👮 {decisionResult.recommendedOfficer}</span>
              </div>

              {/* 3. Affected Departments */}
              <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">3. Affected Departments</span>
                <div className="flex flex-wrap gap-1">
                  {decisionResult.affectedDepartments.map((dept, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-bold text-[9px]">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Required Resources */}
              <div className="p-3 rounded-xl bg-[#050B14] border border-white/10 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">4. Required Squad Equipment</span>
                <div className="flex flex-wrap gap-1">
                  {decisionResult.requiredResources.map((res, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-bold text-[9px]">
                      🛠️ {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Root Cause Diagnostics */}
            <div className="p-3.5 rounded-xl bg-[#050B14] border border-white/10 text-[10px]">
              <span className="text-slate-500 font-bold uppercase text-[9px] block mb-1">5. Neural Root Cause Diagnostics</span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">{decisionResult.rootCauseAnalysis}</p>
            </div>

            {/* 6. Executive Summary */}
            <div className="p-3.5 rounded-xl bg-[#050B14] border border-white/10 text-[10px]">
              <span className="text-slate-500 font-bold uppercase text-[9px] block mb-1">6. C-Suite Executive Summary</span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">{decisionResult.executiveSummary}</p>
            </div>

            {/* 7. Suggested Actions (1-Tap Execution) */}
            <div className="space-y-2 text-[10px]">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">7. Suggested Action Directives</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {decisionResult.suggestedActions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleExecuteAction(act.title)}
                    className="p-3 rounded-xl bg-[#070D18] border border-white/10 hover:border-cyan-500/40 text-left flex flex-col justify-between gap-2 group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{act.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition leading-snug">{act.title}</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{act.desc}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-cyan-400 font-bold flex items-center gap-1 pt-1 border-t border-white/5">
                      EXECUTE DIRECTIVE →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[9px]">
              <span className="text-slate-500">Model Signature: {decisionResult.modelSignature}</span>
              <Button variant="primary" size="sm" onClick={onClose}>
                Dismiss Decision Engine
              </Button>
            </div>

          </motion.div>
        )}

      </div>
    </Modal>
  );
};
