'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Vision Processing Pipeline Visualizer
// ──────────────────────────────────────────────────────────────
// Real-time 8-stage neural processing visualizer with animated
// progress steppers, streaming log terminal, latency telemetry,
// and real-time confidence evolution graphs.
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle2,
  Cpu,
  Zap,
  Sliders,
  Sparkles,
  Building2,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  Activity,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, Button } from './index';

export type PipelineStageId =
  | 'upload'
  | 'validation'
  | 'preprocessing'
  | 'inference'
  | 'postprocessing'
  | 'prediction'
  | 'recommendation'
  | 'incident_ready';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  description: string;
  icon: React.ReactNode;
  durationMs: number;
  terminalLog: string;
  confidenceDelta: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'upload',
    label: 'Upload',
    description: 'Multi-modal payload intake',
    icon: <Upload className="w-4 h-4" />,
    durationMs: 120,
    terminalLog: '[0ms] INGESTION: Received binary asset stream. Size: 3.4MB.',
    confidenceDelta: 0,
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Format & integrity check',
    icon: <ShieldCheck className="w-4 h-4" />,
    durationMs: 90,
    terminalLog: '[120ms] VALIDATION: Passed CRC32 checksum & MIME format verification.',
    confidenceDelta: 15,
  },
  {
    id: 'preprocessing',
    label: 'Pre-processing',
    description: 'Tensor normalization 640x640',
    icon: <Sliders className="w-4 h-4" />,
    durationMs: 140,
    terminalLog: '[210ms] PRE-PROCESSING: Normalizing 1080p image tensor (640x640, BGR2RGB).',
    confidenceDelta: 35,
  },
  {
    id: 'inference',
    label: 'Inference',
    description: 'YOLOv8 Feature Extraction',
    icon: <Cpu className="w-4 h-4" />,
    durationMs: 180,
    terminalLog: '[350ms] INFERENCE: Executing YOLOv8x CSPDarknet tensor kernels (14.2ms GPU).',
    confidenceDelta: 72,
  },
  {
    id: 'postprocessing',
    label: 'Post-processing',
    description: 'NMS IoU filtering (0.45)',
    icon: <Activity className="w-4 h-4" />,
    durationMs: 100,
    terminalLog: '[530ms] POST-PROCESSING: Non-Maximum Suppression (NMS) IoU threshold 0.45 applied.',
    confidenceDelta: 88,
  },
  {
    id: 'prediction',
    label: 'Prediction',
    description: 'Bounding box & severity score',
    icon: <Sparkles className="w-4 h-4" />,
    durationMs: 110,
    terminalLog: '[630ms] PREDICTION: Generated bounding box target (Road Subsidence 97.4%).',
    confidenceDelta: 95,
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    description: 'Municipal agency assignment',
    icon: <Building2 className="w-4 h-4" />,
    durationMs: 90,
    terminalLog: '[740ms] RECOMMENDATION: Assigned Public Works Department (Priority P1).',
    confidenceDelta: 97,
  },
  {
    id: 'incident_ready',
    label: 'Incident Ready',
    description: '1-Click Zustand SSOT Sync',
    icon: <CheckCircle2 className="w-4 h-4" />,
    durationMs: 80,
    terminalLog: '[830ms] INCIDENT READY: Synced to Zustand Single Source of Truth.',
    confidenceDelta: 97.4,
  },
];

export interface AIVisionPipelineVisualizerProps {
  onComplete?: () => void;
  className?: string;
  autoStart?: boolean;
}

export function AIVisionPipelineVisualizer({
  onComplete,
  className,
  autoStart = true,
}: AIVisionPipelineVisualizerProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([0]);

  // Real-time Pipeline Simulator
  useEffect(() => {
    if (!isRunning) return;

    // Reset simulator if starting fresh
    if (activeStageIndex === 0 && elapsedTimeMs === 0) {
      setTerminalLogs([PIPELINE_STAGES[0].terminalLog]);
      setConfidenceHistory([0]);
    }

    const stage = PIPELINE_STAGES[activeStageIndex];

    const timer = setTimeout(() => {
      setElapsedTimeMs((prev) => prev + stage.durationMs);

      if (activeStageIndex < PIPELINE_STAGES.length - 1) {
        const nextIndex = activeStageIndex + 1;
        setActiveStageIndex(nextIndex);

        const nextStage = PIPELINE_STAGES[nextIndex];
        setTerminalLogs((prev) => [...prev, nextStage.terminalLog]);
        setConfidenceHistory((prev) => [...prev, nextStage.confidenceDelta]);
      } else {
        setIsRunning(false);
        if (onComplete) onComplete();
      }
    }, stage.durationMs);

    return () => clearTimeout(timer);
  }, [isRunning, activeStageIndex]);

  const handleRestart = () => {
    setActiveStageIndex(0);
    setElapsedTimeMs(0);
    setTerminalLogs([PIPELINE_STAGES[0].terminalLog]);
    setConfidenceHistory([0]);
    setIsRunning(true);
  };

  const currentStage = PIPELINE_STAGES[activeStageIndex];
  const totalProgress = Math.round(((activeStageIndex + 1) / PIPELINE_STAGES.length) * 100);
  const currentConfidence = confidenceHistory[confidenceHistory.length - 1] || 0;

  return (
    <Card className={cn('p-5 border-cyan-500/30 bg-[#0A1220]/90 space-y-5 shadow-2xl relative overflow-hidden', className)}>
      {/* ── HEADER TELEMETRY BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              YOLOv8 Neural Pipeline
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> TensorRT 10.0 Accelerated
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
            AI Vision Pipeline Real-Time Processing
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right font-mono px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10">
            <div className="text-[9px] uppercase text-slate-400">Total Latency</div>
            <div className="text-xs font-bold text-cyan-300">{elapsedTimeMs} ms</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 border-white/10 text-slate-300 hover:border-cyan-500/40"
            icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleRestart}
          >
            Re-Run Pipeline
          </Button>
        </div>
      </div>

      {/* ── 8-STAGE ANIMATED STEPPER ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isDone = idx < activeStageIndex || (!isRunning && activeStageIndex === PIPELINE_STAGES.length - 1);
          const isCurrent = idx === activeStageIndex && isRunning;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'p-2.5 rounded-xl border transition-all text-center relative overflow-hidden flex flex-col items-center justify-between min-h-[90px]',
                isCurrent
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                  : isDone
                  ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/30 border-white/5 opacity-50'
              )}
            >
              {/* Animated Progress Indicator Bar */}
              {isCurrent && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: stage.durationMs / 1000, ease: 'linear' }}
                />
              )}

              {/* Stage Icon */}
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-1.5 transition-all',
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 font-bold animate-pulse'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                )}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : stage.icon}
              </div>

              {/* Stage Label */}
              <div className="w-full">
                <span className="text-[10px] font-bold block truncate text-slate-200">{stage.label}</span>
                <span className="text-[8px] text-slate-400 block truncate font-mono mt-0.5">{stage.description}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── STAGE METRICS & CONFIDENCE EVOLUTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Progress & Latency Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Overall Pipeline Progress</span>
            <span className="font-mono font-bold text-cyan-300">{totalProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full"
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
            <span>Stage: {currentStage.label}</span>
            <span>Est. Total: 830 ms</span>
          </div>
        </div>

        {/* Confidence Evolution Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Neural Confidence Evolution</span>
            <span className="font-mono font-bold text-emerald-400">{currentConfidence}%</span>
          </div>
          {/* Mini Sparkline Bar Chart */}
          <div className="h-6 flex items-end gap-1.5 pt-1">
            {confidenceHistory.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                className="flex-1 bg-cyan-500/60 hover:bg-cyan-400 rounded-t transition-all"
              />
            ))}
          </div>
        </div>

        {/* Current Stage Output Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Execution Output</span>
          <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5 truncate">
            {currentStage.icon}
            <span className="truncate">{currentStage.label}: {currentStage.description}</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 block mt-2">
            Status: {isRunning ? 'Processing Kernel Stream...' : 'Pipeline Completed Successfully'}
          </span>
        </div>
      </div>

      {/* ── REAL-TIME STREAMING TERMINAL LOGS ── */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/90 p-3 space-y-2 font-mono text-xs text-slate-300">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" /> Neural Pipeline Streaming Logs
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE
          </span>
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {terminalLogs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] text-slate-300 leading-tight flex items-start gap-2"
            >
              <span className="text-cyan-500 font-bold shrink-0">›</span>
              <span>{log}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default AIVisionPipelineVisualizer;
