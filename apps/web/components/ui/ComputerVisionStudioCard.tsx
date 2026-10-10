'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { computerVisionEngine, type VisionTaskType, type CVPredictionOutput } from '../../lib/computer-vision-engine';
import {
  Scan,
  Cpu,
  Sparkles,
  ShieldCheck,
  Building2,
  Zap,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ComputerVisionStudioCard: React.FC = () => {
  const { selectedIncident, incidents, updateIncident, addToast } = useAppStore();

  const activeInc = selectedIncident || incidents[0] || null;

  const [selectedTask, setSelectedTask] = useState<VisionTaskType>('road_damage');
  const [inferring, setInferring] = useState(false);
  const [prediction, setPrediction] = useState<CVPredictionOutput | null>(null);

  const tasksList: { id: VisionTaskType; label: string; icon: string }[] = [
    { id: 'road_damage', label: 'Road Damage', icon: '🛣️' },
    { id: 'flood_detection', label: 'Flood Inundation', icon: '🌊' },
    { id: 'garbage_detection', label: 'Garbage Waste', icon: '🗑️' },
    { id: 'illegal_dumping', label: 'Illegal Dumping', icon: '🚛' },
    { id: 'tree_damage', label: 'Tree Damage', icon: '🌳' },
    { id: 'crop_health', label: 'Crop Health', icon: '🌾' },
    { id: 'water_leakage', label: 'Water Leakage', icon: '💧' },
    { id: 'electric_pole', label: 'Electric Pole', icon: '⚡' },
    { id: 'fire_detection', label: 'Fire & Thermal', icon: '🔥' },
    { id: 'building_damage', label: 'Building Damage', icon: '🏗️' },
  ];

  // Execute YOLO Inference
  const handleRunInference = async (task: VisionTaskType) => {
    setSelectedTask(task);
    setInferring(true);
    try {
      const result = await computerVisionEngine.runInferenceTask(task);
      setPrediction(result);

      addToast({
        title: 'YOLO Computer Vision Inference Complete',
        message: `${result.taskLabel} completed in ${result.inferenceTimeMs}ms (${result.confidenceScore}% confidence).`,
        type: 'success',
      });
    } finally {
      setInferring(false);
    }
  };

  // Commit Inference to Zustand
  const handleCommitToLedger = () => {
    if (!prediction || !activeInc) return;

    updateIncident(activeInc.id, {
      severity: prediction.severity,
      aiAnalysis: {
        confidence: prediction.confidence || prediction.confidenceScore || 95,
        classification: prediction.taskLabel,
        severity: prediction.severity,
        summary: `YOLO Inference (${prediction.modelVersion || prediction.yoloModelVersion || 'YOLOv8'}): ${prediction.taskLabel}. Detected ${prediction.detectedObjects.join(', ')}. Est. Damage: ${prediction.damageCost || prediction.estimatedDamageCost}.`,
        recommendations: activeInc.aiAnalysis?.recommendations || ['Review YOLO detection bounding boxes'],
        estimatedCost: prediction.damageCost || prediction.estimatedDamageCost,
      },
      updatedAt: new Date().toISOString(),
    });

    addToast({
      title: 'Inference Applied',
      message: `Updated case ${activeInc.id} with YOLO inference data.`,
      type: 'info',
    });
  };

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-cyan-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Computer Vision Engine (YOLOv8 & TensorRT)</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  10 TASKS READY
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Real-time object detection, damage estimation, affected area calculation & TensorRT model inference
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="text-[10px] py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            disabled={inferring}
            icon={<Scan className="w-3.5 h-3.5" />}
            onClick={() => handleRunInference(selectedTask)}
          >
            {inferring ? 'Running YOLO Inference...' : 'Run Selected Vision Task'}
          </Button>
        </div>

        {/* ── 10 DOMAIN TASK SELECTOR PILLS ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 z-10 relative text-[10px]">
          {tasksList.map((t) => (
            <button
              key={t.id}
              onClick={() => handleRunInference(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl border text-left transition shrink-0 flex items-center gap-1.5 font-bold',
                selectedTask === t.id
                  ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-md'
                  : 'border-white/10 bg-[#050B14] hover:border-cyan-500/30 text-slate-400 hover:text-slate-200'
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── PREDICTION RESULTS & TELEMETRY ── */}
        {prediction ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 z-10 relative text-[10px]"
          >
            {/* Left: Interactive Bounding Box Display */}
            <div className="md:col-span-6 p-3 rounded-xl bg-[#050B14] border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop"
                  alt="Vision Inference target"
                  className="w-full h-full object-cover opacity-75"
                />

                {/* SVG Bounding Boxes Overlay */}
                {prediction.boundingBoxes.map((box) => (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className="absolute border-2 border-cyan-400 bg-cyan-500/20 rounded flex items-start p-1"
                  >
                    <span className="text-[8px] bg-cyan-500 text-slate-950 font-bold px-1 py-0.5 rounded">
                      {box.label} ({box.confidence}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-slate-400 mt-2">
                <span>Model: <strong className="text-cyan-300">{prediction.yoloModelVersion}</strong></span>
                <span>Latency: <strong className="text-emerald-400">{prediction.inferenceTimeMs} ms</strong></span>
              </div>
            </div>

            {/* Right: Telemetry Metrics Card */}
            <div className="md:col-span-6 p-3.5 rounded-xl bg-[#050B14] border border-white/10 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-slate-100 text-xs">{prediction.taskLabel}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[9px]">
                    {prediction.confidenceScore}% ACCURACY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="text-slate-500 block">Affected Area:</span>
                    <span className="font-bold text-cyan-300">{prediction.affectedAreaSqMeters} sq. meters</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Damage:</span>
                    <span className="font-bold text-rose-400">{prediction.estimatedDamageCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity Level:</span>
                    <span className="font-bold uppercase text-amber-400">{prediction.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Suggested Agency:</span>
                    <span className="font-bold text-slate-200">{prediction.suggestedDepartment}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-500 block text-[9px]">Detected Objects:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prediction.detectedObjects.map((obj, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200 text-[8px] font-bold">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-white/10 text-slate-200 hover:border-cyan-500/40 text-[9px]"
                onClick={handleCommitToLedger}
              >
                Commit Inference to Incident Ledger
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-[10px] font-mono z-10 relative">
            Select any of the 10 domain vision tasks above or click "Run Selected Vision Task" to execute YOLO inference.
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Prepared architecture for seamless future YOLOv8 / TensorRT model binding.</span>
        <span className="text-cyan-400 font-bold">YOLO ENGINE ONLINE</span>
      </div>
    </Card>
  );
};
