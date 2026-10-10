'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge } from './Badge';
import {
  Eye,
  Camera,
  Video,
  FileText,
  Activity,
  Sparkles,
  Zap,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
  Trash2,
  Layers,
  Crosshair,
  Cpu,
  Brain,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EvidenceItem, EvidenceMediaType } from '../../types';

export const AIVisionIntelligenceStudio: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const {
    evidenceList,
    selectedEvidenceId,
    setSelectedEvidenceId,
    uploadEvidence,
    deleteEvidence,
    analyzeEvidence,
    createIncidentFromEvidence,
    linkEvidenceToIncident,
    incidents,
    addToast,
  } = useAppStore();

  const [activeType, setActiveType] = useState<EvidenceMediaType>('image');
  const [analyzing, setAnalyzing] = useState(false);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  // Active selected evidence
  const activeEvidence = useMemo(() => {
    return evidenceList.find((e) => e.id === selectedEvidenceId) || evidenceList[0] || null;
  }, [evidenceList, selectedEvidenceId]);

  // Upload handler simulation
  const handleUploadSim = async () => {
    setAnalyzing(true);
    try {
      const mockNames: Record<EvidenceMediaType, string> = {
        image: 'Benz_Circle_Road_Deformation_Drone.jpg',
        video: 'Sector_4_Substation_Thermal_Feed.mp4',
        document: 'Municipal_Inspection_Report.pdf',
        sensor: 'Hydro_Piezometric_Stream_Packet.json',
      };

      await uploadEvidence({
        name: mockNames[activeType],
        type: activeType,
        linkedIncidentId: incidentId,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Re-run vision inference
  const handleReanalyze = async () => {
    if (!activeEvidence) return;
    setAnalyzing(true);
    try {
      await analyzeEvidence(activeEvidence.id);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateIncident = () => {
    if (!activeEvidence) return;
    const newIncId = createIncidentFromEvidence(activeEvidence.id);
    if (newIncId) {
      addToast({
        title: 'Command Center Synced',
        message: `Dispatched new Incident ${newIncId} into Zustand SSOT.`,
        type: 'success',
      });
    }
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
              <Eye className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise AI Vision Intelligence Platform</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  YOLO v8 / OpenCV PIPELINE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Multi-modal neural object detection, damage segmentation, bounding box telemetry & auto-dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-cyan-500/40"
              icon={<Upload className="w-3.5 h-3.5 text-cyan-400" />}
              onClick={handleUploadSim}
              isLoading={analyzing}
            >
              Upload Evidence
            </Button>
          </div>
        </div>

        {/* ── MULTI-MODAL INTAKE TABS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 z-10 relative text-[10px]">
          {(['image', 'video', 'document', 'sensor'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'p-2.5 rounded-xl border transition flex items-center justify-center gap-2 font-bold uppercase tracking-wider',
                activeType === type
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-[#050B14] text-slate-400 border-white/10 hover:text-slate-200'
              )}
            >
              {type === 'image' && <Camera className="w-3.5 h-3.5" />}
              {type === 'video' && <Video className="w-3.5 h-3.5" />}
              {type === 'document' && <FileText className="w-3.5 h-3.5" />}
              {type === 'sensor' && <Activity className="w-3.5 h-3.5" />}
              <span>{type}</span>
            </button>
          ))}
        </div>

        {/* ── MAIN COMPUTER VISION DISPLAY & TELEMETRY GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 z-10 relative">
          {/* LEFT 2 COLS: COMPUTER VISION CANVAS WITH BOUNDING BOX OVERLAY */}
          <div className="lg:col-span-2 relative min-h-[320px] rounded-2xl border border-white/10 bg-[#040812] overflow-hidden flex flex-col justify-between p-4 group">
            {/* Background Media View */}
            {activeEvidence?.url ? (
              <img
                src={activeEvidence.url}
                alt={activeEvidence.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none filter contrast-125 brightness-90"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950/80 to-[#040812]" />
            )}

            {/* Interactive SVG Bounding Box Canvas Layer */}
            {activeEvidence?.aiAnalysis?.boundingBoxes && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {activeEvidence.aiAnalysis.boundingBoxes.map((box) => {
                  const isHovered = hoveredBoxId === box.id;
                  const colorMap = {
                    critical: '#f43f5e',
                    high: '#fbbf24',
                    medium: '#38bdf8',
                    low: '#10b981',
                  };
                  const color = colorMap[box.severity];

                  return (
                    <g key={box.id}>
                      {/* Rect border */}
                      <rect
                        x={`${box.x}%`}
                        y={`${box.y}%`}
                        width={`${box.width}%`}
                        height={`${box.height}%`}
                        fill={isHovered ? `${color}25` : `${color}10`}
                        stroke={color}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        strokeDasharray={box.severity === 'critical' ? '4 2' : 'none'}
                        className="transition-all duration-200"
                      />

                      {/* Bounding Box Label Tag */}
                      <foreignObject
                        x={`${box.x}%`}
                        y={`${Math.max(0, box.y - 8)}%`}
                        width="240"
                        height="30"
                        className="overflow-visible"
                      >
                        <div
                          style={{ borderColor: color, color }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050B14]/90 border text-[9px] font-bold shadow-lg backdrop-blur-md"
                        >
                          <Crosshair className="w-2.5 h-2.5 animate-spin" />
                          <span>{box.label} ({box.confidence}%)</span>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Top Telemetry Overlay */}
            <div className="z-20 relative flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-[9px] font-mono text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>ASSET: {activeEvidence?.name || 'Intake_Feed.jpg'}</span>
              </span>

              {activeEvidence?.aiAnalysis && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{activeEvidence.aiAnalysis.overallConfidence}% CONFIDENCE</span>
                </span>
              )}
            </div>

            {/* Bottom Bounding Box Chips Hover Control */}
            <div className="z-20 relative pt-20">
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#050B14]/90 border border-white/10 backdrop-blur-md">
                <span className="text-[9px] text-slate-500 font-mono self-center mr-1">DETECTION TARGETS:</span>
                {activeEvidence?.aiAnalysis?.boundingBoxes.map((box) => (
                  <button
                    key={box.id}
                    onMouseEnter={() => setHoveredBoxId(box.id)}
                    onMouseLeave={() => setHoveredBoxId(null)}
                    className={cn(
                      'px-2 py-0.5 rounded text-[9px] font-bold transition border flex items-center gap-1',
                      hoveredBoxId === box.id
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-cyan-500/40'
                    )}
                  >
                    <span>{box.label}</span>
                    <span className="text-cyan-400 font-mono">{box.confidence}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COL: AI VISION TELEMETRY & DISPATCH CONTROL */}
          <div className="p-4 rounded-2xl border border-white/10 bg-[#050B14] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Damage Score</span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {activeEvidence?.aiAnalysis?.damageScore || 0}% SEVERITY
                </span>
              </div>

              {/* Progress Bar for Damage Severity */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-4 border border-white/5">
                <div
                  style={{ width: `${activeEvidence?.aiAnalysis?.damageScore || 0}%` }}
                  className={cn(
                    'h-full transition-all duration-500',
                    (activeEvidence?.aiAnalysis?.damageScore || 0) >= 80
                      ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                      : 'bg-amber-500'
                  )}
                />
              </div>

              {/* Telemetry Key-Value List */}
              <div className="space-y-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 block text-[9px]">Classification:</span>
                  <span className="text-slate-200 font-bold block mt-0.5">
                    {activeEvidence?.aiAnalysis?.classification || 'Processing Intake...'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 block text-[9px]">Recommended Dispatch:</span>
                  <span className="text-cyan-300 font-bold block mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    {activeEvidence?.aiAnalysis?.recommendedDepartment || 'Public Works'}
                  </span>
                </div>

                {activeEvidence?.aiAnalysis?.ocrText && (
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-500 block text-[9px]">OCR Extracted Text:</span>
                    <p className="text-slate-300 text-[9px] mt-0.5 line-clamp-3 font-sans">
                      {activeEvidence.aiAnalysis.ocrText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-[10px] py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none shadow-lg font-bold uppercase tracking-wider"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={handleCreateIncident}
              >
                Dispatch Incident from Vision
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] py-1.5 border-white/10 text-slate-300 hover:border-cyan-500/40"
                icon={<Zap className="w-3 h-3 text-cyan-400" />}
                onClick={handleReanalyze}
                isLoading={analyzing}
              >
                Re-Run Neural Pipeline
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER TELEMETRY ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>YOLO v8 neural vision pipeline active across all multi-modal intake streams.</span>
        <span className="text-emerald-400 font-bold">INFERENCE 420ms</span>
      </div>
    </Card>
  );
};

export default AIVisionIntelligenceStudio;
