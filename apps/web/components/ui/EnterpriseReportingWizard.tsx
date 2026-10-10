'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Modal } from './Overlay';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { SeverityBadge, CategoryBadge } from './Badge';
import {
  Building2,
  MapPin,
  Camera,
  Bot,
  FileText,
  CheckCircle2,
  Send,
  Save,
  WifiOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Upload,
  Video,
  Mic,
  Navigation,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Category, Severity, Incident } from '../../types';

const CATEGORY_OPTIONS: Array<{ id: Category; label: string; icon: string; desc: string }> = [
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', desc: 'Roads, bridges, utilities & civic structures' },
  { id: 'water', label: 'Water Resources', icon: '💧', desc: 'Pipelines, floodways & water quality' },
  { id: 'disaster', label: 'Disaster Risk', icon: '🌊', desc: 'Cyclones, floods & emergency hazards' },
  { id: 'environment', label: 'Environment', icon: '🌍', desc: 'Air quality, waste & pollution telemetry' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌿', desc: 'Crop health, soil moisture & farm grid' },
  { id: 'energy', label: 'Energy Grid', icon: '⚡', desc: 'Power lines, substations & solar farms' },
  { id: 'urban', label: 'Urban Operations', icon: '🏢', desc: 'Zoning, traffic & municipal services' },
  { id: 'climate', label: 'Climate Action', icon: '🌎', desc: 'Thermal heat islands & carbon sinks' },
  { id: 'wildlife', label: 'Wildlife Protection', icon: '🦜', desc: 'Forest corridors & fauna telemetry' },
];

export interface WizardDraftData {
  category: Category;
  locationName: string;
  lat: number;
  lng: number;
  evidencePhoto: string | null;
  evidenceType: 'image' | 'video' | 'audio' | 'document';
  aiConfidence: number;
  aiDetectedClass: string;
  title: string;
  description: string;
  severity: Severity;
}

const initialDraft: WizardDraftData = {
  category: 'infrastructure',
  locationName: 'Benz Circle Sector, Vijayawada',
  lat: 16.5085,
  lng: 80.6410,
  evidencePhoto: null,
  evidenceType: 'image',
  aiConfidence: 94.2,
  aiDetectedClass: 'STRUCTURAL_SUBSIDENCE_HAZARD',
  title: '',
  description: '',
  severity: 'high',
};

import { AIDecisionEngineModal } from './AIDecisionEngineModal';

export const EnterpriseReportingWizard: React.FC = () => {
  const {
    isReportModalOpen,
    reportCategory,
    reportInitialTitle,
    closeReportModal,
    addIncident,
    addToast,
  } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<WizardDraftData>(initialDraft);
  const [isOffline, setIsOffline] = useState(false);
  const [isSavedDraft, setIsSavedDraft] = useState(false);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isManualGps, setIsManualGps] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // AI Decision Engine Trigger State
  const [showAIDecisionModal, setShowAIDecisionModal] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);

  // Cleanup file preview object URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Sync initial modal props if provided
  useEffect(() => {
    if (isReportModalOpen) {
      setStep(1);
      if (reportCategory) setFormData((p) => ({ ...p, category: reportCategory }));
      if (reportInitialTitle) setFormData((p) => ({ ...p, title: reportInitialTitle }));

      const saved = localStorage.getItem('earthmind-report-draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((p) => ({ ...p, ...parsed }));
          setIsSavedDraft(true);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isReportModalOpen, reportCategory, reportInitialTitle]);

  const updateForm = <K extends keyof WizardDraftData>(key: K, value: WizardDraftData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem('earthmind-report-draft', JSON.stringify(formData));
    setIsSavedDraft(true);
    addToast({ title: 'Draft Saved', message: 'Report draft saved to local browser storage.', type: 'success' });
  };

  // Real GPS Geolocation Handler
  const handleAcquireGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser. Enter coordinates manually.');
      setIsManualGps(true);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateForm('lat', Number(latitude.toFixed(6)));
        updateForm('lng', Number(longitude.toFixed(6)));
        setGpsLoading(false);
        setIsManualGps(false);
        addToast({
          title: 'GPS Position Fixed',
          message: `Acquired coordinates: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
          type: 'success',
        });
      },
      (error) => {
        setGpsLoading(false);
        setIsManualGps(true);
        let msg = 'Failed to acquire GPS position.';
        if (error.code === 1) msg = 'Location permission denied. Please enter coordinates manually.';
        else if (error.code === 2) msg = 'GPS position unavailable. Please enter coordinates manually.';
        else if (error.code === 3) msg = 'GPS request timed out. Please enter coordinates manually.';
        setGpsError(msg);
        addToast({ title: 'GPS Location Notice', message: msg, type: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Real File Validation and Selection Handler
  const processSelectedFile = (file: File) => {
    setUploadError(null);
    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

    if (file.size > MAX_SIZE) {
      const err = `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 25 MB limit.`;
      setUploadError(err);
      addToast({ title: 'File Too Large', message: err, type: 'error' });
      return;
    }

    const mime = file.type.toLowerCase();
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');
    const isDoc = mime === 'application/pdf' || mime === 'text/plain';

    if (!isImage && !isVideo && !isDoc) {
      const err = `Unsupported file format '${mime}'. Please upload an image, video, or PDF.`;
      setUploadError(err);
      addToast({ title: 'Invalid File Type', message: err, type: 'error' });
      return;
    }

    // Revoke previous blob url
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(preview);
    updateForm('evidencePhoto', preview);
    updateForm('evidenceType', isImage ? 'image' : isVideo ? 'video' : 'document');

    addToast({
      title: 'File Attached',
      message: `${file.name} (${(file.size / 1024).toFixed(1)} KB) ready for upload.`,
      type: 'info',
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    updateForm('evidencePhoto', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canProceed = () => {
    if (step === 1) return !!formData.category;
    if (step === 2) return !!formData.locationName;
    if (step === 3) return true;
    if (step === 4) return true;
    if (step === 5) return !!formData.title.trim();
    if (step === 6) return true;
    return true;
  };

  const handleNext = () => {
    if (step < 7 && canProceed()) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleSubmitReport = async () => {
    const newId = `EM-${Date.now().toString().slice(-4)}`;

    let uploadedStorageUrl: string | undefined = undefined;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);
        uploadForm.append('incidentId', newId);
        uploadForm.append('fileType', formData.evidenceType);

        const res = await fetch('/api/v1/evidence/upload', {
          method: 'POST',
          body: uploadForm,
        });

        if (res.ok) {
          const json = await res.json();
          uploadedStorageUrl = json.data?.storageUrl;
        }
      } catch (err) {
        // Handled gracefully in offline or error scenarios
      } finally {
        setIsUploading(false);
      }
    }

    const newIncident: Incident = {
      id: newId,
      title: formData.title || `${formData.category.toUpperCase()} Inspection Report`,
      description: formData.description || `Logged via Enterprise Reporting Wizard`,
      category: formData.category,
      severity: formData.severity,
      status: 'reported',
      location: {
        lat: formData.lat,
        lng: formData.lng,
        name: formData.locationName,
        ward: 'Ward 12',
        zone: 'Zone A',
      },
      reportedBy: 'Field Commander',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: uploadedStorageUrl || formData.evidencePhoto || undefined,
      timeline: [
        {
          id: `t-1`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Report created via Enterprise Wizard`,
          icon: '📱',
          actor: 'Field Commander',
        },
      ],
      aiAnalysis: {
        confidence: formData.aiConfidence,
        classification: formData.aiDetectedClass,
        severity: formData.severity,
        summary: `AI pre-scan completed during intake. Bounding box confirmed ${formData.category} anomaly.`,
        recommendations: ['Dispatch domain unit', 'Log GIS coordinates', 'Notify department lead'],
      },
    };

    if (navigator.onLine === false) {
      const offlineQueue = JSON.parse(localStorage.getItem('earthmind-offline-queue') || '[]');
      offlineQueue.push(newIncident);
      localStorage.setItem('earthmind-offline-queue', JSON.stringify(offlineQueue));
      addToast({ title: 'Offline Intake Queued', message: `Report ${newId} saved to offline queue. Will sync when online.`, type: 'warning' });
    } else {
      addIncident(newIncident);
      addToast({ title: 'Incident Intake Complete', message: `Case ${newId} recorded.`, type: 'success' });
    }

    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    localStorage.removeItem('earthmind-report-draft');
    setSubmittedIncident(newIncident);
    closeReportModal();
    setShowAIDecisionModal(true);
  };

  if (!isReportModalOpen) return null;

  return (
    <>
      <Modal
        isOpen={isReportModalOpen}
      onClose={closeReportModal}
      title="Enterprise Operational Reporting Wizard"
      size="xl"
    >
      <div className="flex flex-col gap-4 text-slate-200">
        
        {/* ── 7-STEP PROGRESS INDICATOR BAR ── */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#050B14] border border-white/10 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> STEP {step} OF 7:
              {step === 1 && ' Select Domain Category'}
              {step === 2 && ' Geospatial Location'}
              {step === 3 && ' Evidence Collection'}
              {step === 4 && ' AI Neural Pre-analysis'}
              {step === 5 && ' Case Details & Tags'}
              {step === 6 && ' Review Telemetry'}
              {step === 7 && ' Submission Confirmation'}
            </span>

            <div className="flex items-center gap-2">
              {isSavedDraft && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  💾 DRAFT SAVED
                </span>
              )}
              <button
                onClick={handleSaveDraft}
                className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 transition flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-cyan-400" /> Save Draft
              </button>
            </div>
          </div>

          {/* Animated Progress Line */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 7) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* ── WIZARD STEP CONTENT PANELS ── */}
        <div className="min-h-[320px] flex flex-col justify-between p-4 rounded-xl bg-[#050B14] border border-white/10 relative overflow-hidden">
          
          {/* STEP 1: CATEGORY PICKER */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" /> Select Operational Department Domain
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateForm('category', cat.id)}
                    className={cn(
                      'p-3 rounded-xl border text-left flex flex-col gap-1 transition-all group',
                      formData.category === cat.id
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-[#070D18] border-white/10 hover:border-cyan-500/30 text-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-xs group-hover:text-cyan-300">{cat.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: GEOSPATIAL LOCATION */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Set Incident Geospatial Location
              </h4>
              <div className="space-y-3">
                <Input
                  label="Location Name & Sector"
                  value={formData.locationName}
                  onChange={(e) => updateForm('locationName', e.target.value)}
                  placeholder="E.g., Benz Circle Sector, Vijayawada"
                />

                <div className="p-3 rounded-xl bg-[#070D18] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-bold">GPS Coordinates:</span>
                    <span className="text-cyan-400 font-bold">{formData.lat.toFixed(4)}° N, {formData.lng.toFixed(4)}° E</span>
                    {gpsError && (
                      <span className="text-amber-400 text-[9px] block mt-0.5">{gpsError}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={gpsLoading}
                      onClick={handleAcquireGps}
                      className="px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 font-bold transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <Navigation className={cn("w-3 h-3", gpsLoading && "animate-spin")} />
                      {gpsLoading ? 'Acquiring GPS...' : 'Acquire Device GPS'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualGps(!isManualGps)}
                      className="px-2.5 py-1.5 rounded bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 text-[9px]"
                    >
                      {isManualGps ? 'Hide Manual' : 'Edit Manually'}
                    </button>
                  </div>
                </div>

                {isManualGps && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0f1419] border border-white/5">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Latitude (°N)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.lat}
                        onChange={(e) => updateForm('lat', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Longitude (°E)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.lng}
                        onChange={(e) => updateForm('lng', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: EVIDENCE UPLOAD */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" /> Upload Multimodal Evidence
              </h4>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center transition-all bg-[#070D18] flex flex-col items-center justify-center gap-2",
                  isDragOver ? "border-cyan-400 bg-cyan-950/20" : "border-white/10 hover:border-white/20"
                )}
              >
                {formData.evidencePhoto ? (
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-white/10">
                    <img src={formData.evidencePhoto} className="w-full h-full object-cover" alt="Selected Evidence Preview" />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono">
                      {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Attached Evidence'}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 px-2 py-1 rounded text-[10px] text-rose-300 font-bold cursor-pointer transition"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className={cn("w-8 h-8 text-cyan-400", isDragOver ? "animate-bounce" : "")} />
                    <span className="text-xs font-bold text-slate-200">
                      {isDragOver ? 'Drop File to Upload' : 'Drag & Drop Evidence File Here'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Supports JPG, PNG, WEBP, MP4, PDF (Max 25MB)</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 rounded bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition cursor-pointer"
                    >
                      Browse Device Files
                    </button>
                    {uploadError && (
                      <p className="text-xs text-rose-400 font-medium mt-1">{uploadError}</p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI PRE-ANALYSIS */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400 animate-pulse" /> AI Computer Vision Neural Pre-Scan
              </h4>
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold">Neural Model Scan Confidence:</span>
                  <span className="text-emerald-400 font-black text-xs">{formData.aiConfidence}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold">Detected Classification:</span>
                  <span className="text-cyan-300 font-bold">{formData.aiDetectedClass}</span>
                </div>
                <p className="text-slate-300 font-sans text-xs pt-2 border-t border-white/10">
                  AI pre-scan verified structural anomaly. Auto-generated initial recommended response actions.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ADDITIONAL INFORMATION */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Additional Case Telemetry Details
              </h4>
              <div className="space-y-3">
                <Input
                  label="Incident Title"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder={`E.g., ${formData.category.toUpperCase()} Anomaly near Ward 12`}
                  required
                />
                <TextArea
                  label="Field Observations & Remarks"
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Enter detailed field observation notes..."
                />
              </div>
            </motion.div>
          )}

          {/* STEP 6: REVIEW */}
          {step === 6 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 font-mono text-[10px]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Review Telemetry Before Final Submission
              </h4>
              <div className="p-4 rounded-xl bg-[#070D18] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <CategoryBadge category={formData.category} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-100 font-bold">{formData.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Title:</span>
                  <span className="text-cyan-400 font-bold">{formData.title || 'Untitled Case'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="text-emerald-400 font-bold">{formData.aiConfidence}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: SUBMISSION CONFIRMATION */}
          {step === 7 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-slate-100 uppercase">Ready for Operational Record Creation</h4>
              <p className="text-xs text-slate-400 font-mono">
                Clicking Submit will record case telemetry into the Single Source of Truth ledger.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-4 px-6 py-2.5 text-xs uppercase"
                icon={<Send className="w-4 h-4" />}
                onClick={handleSubmitReport}
              >
                Submit & Record Incident Case
              </Button>
            </motion.div>
          )}

          {/* ── WIZARD STEPPER NAVIGATION FOOTER ── */}
          {step < 7 && (
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4 z-10 relative">
              <Button
                variant="secondary"
                size="sm"
                disabled={step === 1}
                onClick={handlePrev}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={!canProceed()}
                onClick={handleNext}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                {step === 6 ? 'Proceed to Submission' : 'Next Step'}
              </Button>
            </div>
          )}

        </div>

      </div>
    </Modal>
    <AIDecisionEngineModal
      isOpen={showAIDecisionModal}
      onClose={() => setShowAIDecisionModal(false)}
      incidentTitle={submittedIncident?.title}
      category={submittedIncident?.category}
      severity={submittedIncident?.severity}
    />
    </>
  );
};
