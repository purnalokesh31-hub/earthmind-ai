'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Intelligence & Explainability Panel
// Displays YOLOv8/SAM Detections, Grad-CAM XAI Heatmaps & Source Tags
// ──────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';

interface BoundingBoxItem {
  label: string;
  confidence: number;
  severity: string;
  damageScore: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AiIntelligencePanelProps {
  aiSummary: string | null;
  modelTask?: string;
  modelVersion?: string;
  confidence?: number;
  overallRiskScore?: number;
  boundingBoxes?: BoundingBoxItem[];
  xaiReasoning?: string[];
  processedAt?: string;
}

export const AiIntelligencePanel: React.FC<AiIntelligencePanelProps> = ({
  aiSummary,
  modelTask = 'OBJECT_DETECTION & SEGMENTATION',
  modelVersion = 'YOLOv8x-v4.2-TensorRT-INT8',
  confidence = 96.4,
  overallRiskScore = 94,
  boundingBoxes = [
    { label: 'Severe Road Crack / Subsidence', confidence: 0.96, severity: 'CRITICAL', damageScore: 92, x: 0.25, y: 0.35, width: 0.4, height: 0.3 },
    { label: 'Standing Water Accumulation', confidence: 0.89, severity: 'HIGH', damageScore: 68, x: 0.10, y: 0.60, width: 0.3, height: 0.2 },
  ],
  xaiReasoning = [
    'Grad-CAM heatmaps highlight high vertical surface displacement on structural asphalt.',
    'Proximity to active traffic corridor increases public safety hazard coefficient.',
    'No recent repair records found in municipal GIS ledger for past 180 days.',
  ],
  processedAt = new Date().toISOString(),
}) => {
  return (
    <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
      {/* Header Tagging */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">AI situational Intelligence</h3>
            <p className="text-[11px] text-slate-400">Model: {modelVersion}</p>
          </div>
        </div>

        <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
          AI GENERATED • {confidence}% CONFIDENCE
        </span>
      </div>

      {/* Primary Summary */}
      <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
        <span className="font-semibold text-purple-300 block mb-1">Model Assessment</span>
        <p className="text-slate-200 leading-relaxed">{aiSummary || 'Automated AI vision inference completed.'}</p>
      </div>

      {/* Data Source Distinction Tags */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        <div className="p-2 bg-purple-950/30 border border-purple-500/30 rounded text-center">
          <span className="text-purple-400 block font-bold">🤖 AI PREDICTION</span>
          <span className="text-slate-300">Subsidence 96.4%</span>
        </div>
        <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded text-center">
          <span className="text-emerald-400 block font-bold">👤 HUMAN CONFIRMED</span>
          <span className="text-slate-300">Capt. Varma</span>
        </div>
        <div className="p-2 bg-cyan-950/30 border border-cyan-500/30 rounded text-center">
          <span className="text-cyan-400 block font-bold">⚡ SYSTEM DECISION</span>
          <span className="text-slate-300">P1 Auto-Dispatch</span>
        </div>
      </div>

      {/* Bounding Box Hazard List */}
      <div className="space-y-2">
        <span className="font-semibold text-slate-300 block">Detected Bounding Box Hazards ({boundingBoxes.length})</span>
        {boundingBoxes.map((box, idx) => (
          <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">{box.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                Coordinates: [{box.x}, {box.y}, {box.width}, {box.height}]
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                {box.severity}
              </span>
              <span className="text-[10px] text-amber-400 font-mono block mt-0.5">Damage: {box.damageScore}/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Explainable AI (XAI) Attribution */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-1.5">
        <span className="font-semibold text-slate-300 block">Explainability & Feature Attribution (Grad-CAM 8x8)</span>
        <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
          {xaiReasoning.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
