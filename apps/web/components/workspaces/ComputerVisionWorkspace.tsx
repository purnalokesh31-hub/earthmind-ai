'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Computer Vision Studio
// ──────────────────────────────────────────────────────────────
// Multi-modal intake, 10-task domain model switcher, SVG bounding box viewer,
// live image upload, genuine PIL/Gemini inference or transparent simulated fallback,
// confidence gauge, damage estimator, 1-click dispatch & export.
// ──────────────────────────────────────────────────────────────

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { computerVisionEngine, type VisionTaskType, type CVPredictionOutput } from '../../lib/computer-vision-engine';
import { Button, Card, KPICard, SeverityBadge, AIVisionPipelineVisualizer } from '../ui';
import {
  Eye,
  Upload,
  Sparkles,
  Zap,
  FileText,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  Download,
  Share2,
  Maximize2,
  Sliders,
  FileCode,
  ShieldCheck,
  Building2,
  Clock,
  DollarSign,
  MapPin,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const VISION_TASKS: { id: VisionTaskType; label: string; icon: string }[] = [
  { id: 'road_damage', label: 'Road Damage & Subsidence', icon: '🛣️' },
  { id: 'flood', label: 'Urban Flood Inundation', icon: '🌊' },
  { id: 'garbage', label: 'Solid Waste Accumulation', icon: '🗑️' },
  { id: 'illegal_dumping', label: 'Unsanctioned Debris Dumping', icon: '🚛' },
  { id: 'tree_damage', label: 'Tree Canopy & Arbor Hazard', icon: '🌳' },
  { id: 'crop_disease', label: 'Agricultural Foliar Blight', icon: '🌾' },
  { id: 'water_leakage', label: 'Hydro Main Leak & Erosion', icon: '💧' },
  { id: 'electric_pole_damage', label: 'Utility Pole & Transformer Tilt', icon: '⚡' },
  { id: 'fire', label: 'Thermal Ignition & Smoke Plume', icon: '🔥' },
  { id: 'building_damage', label: 'Masonry Fracture & Column Shear', icon: '🏗️' },
];

export default function ComputerVisionWorkspace() {
  const { incidents, updateIncident, createIncidentFromEvidence, uploadEvidence, addToast } = useAppStore();

  // State
  const [selectedTask, setSelectedTask] = useState<VisionTaskType>('road_damage');
  const [activeModality, setActiveModality] = useState<'image' | 'video' | 'document' | 'sensor'>('image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<CVPredictionOutput | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Preview Media URLs by modality
  const previewUrl = useMemo(() => {
    if (customImage && activeModality === 'image') return customImage;
    switch (activeModality) {
      case 'image':
        return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80';
      case 'video':
        return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80';
    }
  }, [activeModality, customImage]);

  // Execute Neural Vision Task
  const handleRunInference = async (task: VisionTaskType = selectedTask, imageToAnalyze?: string) => {
    setIsProcessing(true);
    setPrediction(null);

    const imageParam = imageToAnalyze || customImage || previewUrl;

    try {
      const output = await computerVisionEngine.runInference(task, imageParam);
      setPrediction(output);

      const modeLabel = output.isSimulated ? 'Simulated Preset' : output.analysisEngine || 'PIL-LocalCV';

      addToast({
        title: 'Neural Inference Complete',
        message: `Processed ${output.taskLabel} via ${modeLabel} in ${output.inferenceTimeMs}ms (${output.confidence}% confidence).`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Inference Error',
        message: 'Failed to process vision task pipeline.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Local File Upload
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        title: 'Invalid File Type',
        message: 'Only image assets (JPEG, PNG, WebP) are supported for computer vision inference.',
        type: 'error',
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Image size exceeds maximum limit of 25MB.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomImage(dataUrl);
      setActiveModality('image');
      handleRunInference(selectedTask, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Dispatch to Zustand SSOT
  const handleDispatchIncident = async () => {
    if (!prediction) return;
    setIsProcessing(true);

    const newAsset = await uploadEvidence({
      name: `${prediction.taskLabel.split(' ')[0]}_Inference_${Date.now().toString().slice(-4)}.jpg`,
      type: activeModality,
      url: previewUrl,
      sizeBytes: 3800000,
    });

    const newIncId = createIncidentFromEvidence(newAsset.id);
    setIsProcessing(false);

    addToast({
      title: 'Incident Dispatched from CV Studio',
      message: `Created Incident ${newIncId} and assigned to ${prediction.departmentRecommendation}.`,
      type: 'info',
    });
  };

  // Attach Analysis to Existing Incident
  const handleAttachToIncident = () => {
    if (!prediction || !targetIncidentId) return;

    updateIncident(targetIncidentId, {
      severity: prediction.severity,
      aiAnalysis: {
        confidence: prediction.confidence,
        classification: prediction.taskLabel,
        severity: prediction.severity,
        summary: `Vision Inference (${prediction.analysisEngine || prediction.modelVersion}): ${prediction.taskLabel}. Detected: ${prediction.detectedObjects.join(', ')}. Est. Damage: ${prediction.damageCost}.`,
        recommendations: [`Deploy ${prediction.departmentRecommendation} response team immediately`],
        estimatedCost: prediction.damageCost,
      },
      updatedAt: new Date().toISOString(),
    });

    addToast({
      title: 'Vision Analysis Attached',
      message: `Updated Incident ${targetIncidentId} with ${prediction.analysisEngine || 'Vision'} telemetry.`,
      type: 'success',
    });
  };

  // Export JSON Report
  const handleExportJSON = () => {
    if (!prediction) return;
    const blob = new Blob([JSON.stringify(prediction, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vision_Analysis_${prediction.taskType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Report Downloaded',
      message: 'Exported neural vision telemetry payload in JSON format.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. ENTERPRISE STUDIO HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[#0A1220]/90 backdrop-blur-xl p-5 rounded-2xl border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Enterprise Computer Vision Studio
              <span className={cn(
                "text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border",
                prediction?.isSimulated
                  ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                  : "bg-cyan-950 text-cyan-400 border border-cyan-500/40"
              )}>
                {prediction
                  ? (prediction.isSimulated ? 'Simulated Preset [Offline]' : `${prediction.analysisEngine} [Live Engine]`)
                  : 'PIL-LocalCV / Gemini Multi-Modal Engine'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live evidence intake • 10 domain hazard tasks • Real-time SVG bounding boxes • Damage cost estimation
            </p>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] border-white/10 text-slate-300 hover:border-cyan-500/40"
            icon={<Upload className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] border-white/10 text-slate-300 hover:border-cyan-500/40"
            icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleExportJSON}
            disabled={!prediction}
          >
            Export JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-[11px] uppercase tracking-wider"
            icon={<Zap className="w-3.5 h-3.5 text-cyan-300" />}
            onClick={() => handleRunInference()}
            isLoading={isProcessing}
          >
            Run Neural Inference
          </Button>
        </div>
      </div>

      {/* ── 8-STAGE REAL-TIME AI VISION PIPELINE VISUALIZER ── */}
      <AIVisionPipelineVisualizer />

      {/* ── 2. TASK SELECTION BAR ── */}
      <Card className="p-3 border-cyan-500/20 bg-[#0A1220]/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
          Select Neural Vision Model Task (10 Hazard Categories Supported)
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {VISION_TASKS.map((task) => {
            const isSelected = selectedTask === task.id;
            return (
              <button
                key={task.id}
                onClick={() => {
                  setSelectedTask(task.id);
                  handleRunInference(task.id);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0',
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500/60 text-cyan-300 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
                )}
              >
                <span>{task.icon}</span>
                <span>{task.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── 3. MAIN STUDIO CANVAS & TELEMETRY SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Drag & Drop Multi-Modal Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 border-cyan-500/30 bg-[#0A1220]/80 relative overflow-hidden">
            {/* Modality Selector Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/80 border border-white/5">
                {(['image', 'video', 'document', 'sensor'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveModality(m)}
                    className={cn(
                      'px-3 py-1 rounded-md text-[11px] font-bold uppercase transition-all capitalize',
                      activeModality === m
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {customImage && (
                  <button
                    onClick={() => setCustomImage(null)}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Reset to Default Image
                  </button>
                )}
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {prediction?.analysisEngine || 'PIL / Multi-Modal Vision'}
                </span>
              </div>
            </div>

            {/* Drag & Drop Canvas Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleFileSelect(file);
                } else {
                  handleRunInference();
                }
              }}
              className={cn(
                'relative min-h-[420px] rounded-xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center bg-slate-950/80',
                isDragOver ? 'border-cyan-400 bg-cyan-950/20' : 'border-cyan-500/30 hover:border-cyan-500/50'
              )}
            >
              {/* Laser Scanning Animation Overlay during Inference */}
              {isProcessing && (
                <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-cyan-300 animate-pulse">Running Neural Inference Pipeline...</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Feature Extraction & Spatial Hazard Bounding Box Layering</p>
                  </div>
                  {/* Laser Scan Line */}
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4]"
                  />
                </div>
              )}

              {/* Modality Canvas Previews */}
              {activeModality === 'image' || activeModality === 'video' ? (
                <div className="relative w-full h-[420px]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />

                  {/* SVG Bounding Box Layer */}
                  {prediction && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {prediction.boundingBoxes.map((box) => (
                        <rect
                          key={box.id}
                          x={`${box.x}%`}
                          y={`${box.y}%`}
                          width={`${box.width}%`}
                          height={`${box.height}%`}
                          fill="rgba(6, 182, 212, 0.15)"
                          stroke={box.severity === 'critical' ? '#f43f5e' : box.severity === 'high' ? '#fbbf24' : '#06b6d4'}
                          strokeWidth="3"
                          strokeDasharray="4 2"
                        />
                      ))}
                    </svg>
                  )}

                  {/* Bounding Box Labels */}
                  {prediction?.boundingBoxes.map((box) => (
                    <div
                      key={`lbl-${box.id}`}
                      style={{ left: `${box.x}%`, top: `${Math.max(2, box.y - 6)}%` }}
                      className={cn(
                        'absolute px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-10',
                        box.severity === 'critical'
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                          : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50'
                      )}
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {box.label} ({box.confidence}%)
                    </div>
                  ))}
                </div>
              ) : activeModality === 'document' ? (
                <div className="p-6 w-full font-mono text-xs text-slate-300 space-y-3 bg-slate-950">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-cyan-400 font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Document OCR Extracted Text
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">OCR Confidence 98.6%</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 bg-slate-900/60 p-4 rounded-lg border border-white/5">
                    {`MUNICIPAL WATER & ROAD INFRASTRUCTURE REPORT\nDate: Oct 2026\nLocation: Benz Circle Sector 4, Ward 12\nObservation: Cast-iron main 300mm pipe fatigue with active groundwater seepage.\nPriority: HIGH\nAssigned Department: Public Works Department`}
                  </pre>
                </div>
              ) : (
                /* Sensor JSON Preview */
                <div className="p-6 w-full font-mono text-xs text-slate-300 space-y-3 bg-slate-950">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-amber-400 font-bold flex items-center gap-2">
                      <FileCode className="w-4 h-4" /> Sensor Stream JSON Payload
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">
                      THRESHOLD ANOMALY
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-cyan-300 bg-slate-900/80 p-4 rounded-lg border border-white/10">
                    {JSON.stringify(
                      {
                        sensorId: 'PIEZO-4B',
                        sensorType: 'Hydro-Piezometric Pressure',
                        unit: 'PSI',
                        value: 14.2,
                        normalRange: { min: 50.0, max: 80.0 },
                        isAnomaly: true,
                        rawPayload: { gridSector: 'Ward 12', timestamp: new Date().toISOString() },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Vision Intelligence Telemetry Sidebar */}
        <div className="space-y-4">
          {prediction ? (
            <Card className="p-5 border-cyan-500/30 bg-[#0A1220]/90 space-y-4 shadow-2xl">
              <div className="border-b border-white/10 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">Neural Vision Results</span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{prediction.taskLabel}</h3>
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold border",
                  prediction.isSimulated
                    ? "bg-amber-950/70 text-amber-300 border-amber-500/40"
                    : "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                )}>
                  {prediction.isSimulated ? 'Simulated Preset' : prediction.analysisEngine || 'Real Inference'}
                </span>
              </div>

              {/* Confidence Gauge */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Neural Confidence Score</span>
                  <span className="text-base font-mono font-black text-cyan-300">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${prediction.confidence}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                </div>
                <p className="text-[9px] text-slate-500">
                  Feature detection confidence. Physical incident confirmation requires field operational verification.
                </p>
              </div>

              {/* Severity & Cost Gauge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity Level</span>
                  <SeverityBadge severity={prediction.severity} className="mt-1" />
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Cost</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">{prediction.damageCost}</span>
                </div>
              </div>

              {/* Department Recommendation */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Department</span>
                <span className="text-xs font-bold text-cyan-400 mt-1 block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {prediction.departmentRecommendation}
                </span>
              </div>

              {/* Detected Objects List */}
              {prediction.detectedObjects.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Detected Objects</span>
                  <div className="flex flex-wrap gap-1">
                    {prediction.detectedObjects.map((obj, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-[11px] py-2 bg-gradient-to-r from-cyan-600 to-blue-600 font-bold uppercase tracking-wider"
                  icon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                  onClick={handleDispatchIncident}
                >
                  Create Live Incident
                </Button>

                {/* Attach to Existing Incident Dropdown */}
                <div className="flex gap-2">
                  <select
                    value={targetIncidentId}
                    onChange={(e) => setTargetIncidentId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="">Select Incident to Attach...</option>
                    {incidents.slice(0, 5).map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {inc.id}: {inc.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] border-white/10 text-slate-300 hover:border-cyan-500/40"
                    icon={<LinkIcon className="w-3.5 h-3.5 text-cyan-400" />}
                    onClick={handleAttachToIncident}
                    disabled={!targetIncidentId}
                  >
                    Attach
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-cyan-500/20 bg-[#0A1220]/60 text-center">
              <Eye className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-300">No Active Inference Output</h4>
              <p className="text-[10px] text-slate-400 mt-1">Select a task model and click 'Run Neural Inference'.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
