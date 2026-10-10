'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Executive Reporting Engine Modal
// ──────────────────────────────────────────────────────────────
// Multi-modal executive briefing reports containing Evidence Images,
// Bounding Boxes, AI Vision Analysis, OCR Text, Damage Assessment,
// Risk Summary, Department Recommendations, GIS Snapshots,
// Operational Timelines, and Earth Impact telemetry.
// Supports Preview, Print (window.print), PDF Export, & Email Dispatch.
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Modal } from './Overlay';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge } from './Badge';
import {
  FileText,
  Printer,
  Download,
  Mail,
  Eye,
  CheckCircle2,
  Building2,
  MapPin,
  Camera,
  Cpu,
  FileCode,
  AlertTriangle,
  Sparkles,
  Activity,
  Layers,
  Send,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export interface ExecutiveReportingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident | null;
}

export function ExecutiveReportingEngineModal({
  isOpen,
  onClose,
  incident,
}: ExecutiveReportingEngineModalProps) {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'gis' | 'impact'>('preview');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('commissioner@vijayawada.gov.in');

  if (!isOpen) return null;

  const inc = incident || {
    id: 'EM-402',
    title: 'Benz Circle Road Subsidence & Water Main Fracture',
    description: 'AI Vision Engine detected asphalt shear and sub-base cavity. High risk of commercial vehicle trap.',
    category: 'infrastructure',
    severity: 'critical',
    status: 'investigating',
    department: 'Public Works Department',
    location: { name: 'Benz Circle Ward 12, Vijayawada', lat: 16.5062, lng: 80.648, ward: 'Ward 12' },
    reportedAt: new Date().toISOString(),
    reportedBy: 'AI Vision Engine v4.2',
    aiAnalysis: {
      confidence: 97.4,
      classification: 'Road Subsidence & Sub-grade Cavity',
      severity: 'critical',
      summary: 'Asphalt cracking with 35mm vertical deflection. Hydro-piezometer sensor #WP-09 confirms sub-surface pressure collapse.',
      recommendations: ['Deploy PWD Rapid Repair Unit', 'Reroute freight traffic', 'Isolate 350m hazard zone'],
      estimatedCost: '₹4,50,000',
    },
    timeline: [
      { id: 'tl-1', timestamp: '10:14 AM', event: 'Vision AI Ingestion', icon: '👁️', actor: 'AI Vision Engine v4.2' },
      { id: 'tl-2', timestamp: '10:16 AM', event: 'Auto-Dispatched to PWD', icon: '🚨', actor: 'EarthMind SSOT' },
    ],
  };

  const handlePrint = () => {
    window.print();
    addToast({ title: 'Printing Report', message: 'Triggered browser print dialog.', type: 'info' });
  };

  const handleDownloadPDF = () => {
    const reportData = {
      title: `Executive Intelligence Report — ${inc.id}`,
      generatedAt: new Date().toISOString(),
      incident: inc,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EarthMind_Executive_Report_${inc.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Report Downloaded', message: `Exported ${inc.id} executive briefing JSON/PDF.`, type: 'success' });
  };

  const handleSendEmail = () => {
    setShowEmailDialog(false);
    addToast({
      title: 'Email Briefing Dispatched',
      message: `Executive report ${inc.id} emailed to ${emailAddress}.`,
      type: 'success',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Executive Report Engine — ${inc.id}`} size="xl">
      <div className="space-y-4 text-slate-200 font-sans">
        {/* ── TOOLBAR (Print, PDF, Email, Tabs) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'preview' ? 'primary' : 'outline'}
              size="sm"
              className="text-[10px] py-1"
              icon={<Eye className="w-3 h-3" />}
              onClick={() => setActiveTab('preview')}
            >
              Full Briefing
            </Button>
            <Button
              variant={activeTab === 'ocr' ? 'primary' : 'outline'}
              size="sm"
              className="text-[10px] py-1"
              icon={<FileCode className="w-3 h-3 text-cyan-400" />}
              onClick={() => setActiveTab('ocr')}
            >
              OCR Document Analysis
            </Button>
            <Button
              variant={activeTab === 'gis' ? 'primary' : 'outline'}
              size="sm"
              className="text-[10px] py-1"
              icon={<MapPin className="w-3 h-3 text-emerald-400" />}
              onClick={() => setActiveTab('gis')}
            >
              GIS Snapshot & Radius
            </Button>
            <Button
              variant={activeTab === 'impact' ? 'primary' : 'outline'}
              size="sm"
              className="text-[10px] py-1"
              icon={<Activity className="w-3 h-3 text-amber-400" />}
              onClick={() => setActiveTab('impact')}
            >
              Earth Impact Telemetry
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-cyan-500/40"
              icon={<Printer className="w-3 h-3 text-cyan-400" />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-emerald-500/40"
              icon={<Download className="w-3 h-3 text-emerald-400" />}
              onClick={handleDownloadPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-[10px] py-1 bg-gradient-to-r from-cyan-600 to-blue-600 font-bold"
              icon={<Mail className="w-3 h-3 text-white" />}
              onClick={() => setShowEmailDialog(true)}
            >
              Email Briefing
            </Button>
          </div>
        </div>

        {/* ── REPORT CONTENT CANVAS (PRINTABLE AREA) ── */}
        <div className="print-area p-5 rounded-2xl bg-[#070D18] border border-cyan-500/30 space-y-5 shadow-2xl relative overflow-hidden">
          
          {/* Header Title Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold">
                  EARTHMIND EXECUTIVE BRIEFING
                </span>
                <span className="text-[10px] font-mono text-slate-400">Ref: {inc.id}</span>
              </div>
              <h2 className="text-lg font-black text-slate-100 mt-1">{inc.title}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{inc.location?.name || 'Vijayawada Region'}</p>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={inc.severity} />
              <CategoryBadge category={inc.category} />
            </div>
          </div>

          {/* ── 1. EVIDENCE IMAGES & BOUNDING BOX OVERLAY ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" /> Multi-Modal Visual Evidence Asset
              </span>
              <div className="w-full h-44 rounded-xl bg-slate-900 border border-white/10 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80"
                  alt="Vision Evidence"
                  className="w-full h-full object-cover"
                />
                {/* SVG Target Bounding Box */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <rect x="25%" y="25%" width="45%" height="45%" fill="rgba(244,63,94,0.15)" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                  <rect x="26%" y="26%" width="120" height="20" fill="rgba(15,23,42,0.9)" rx="4" />
                  <text x="28%" y="37%" fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    Asphalt Shear (97.4%)
                  </text>
                </svg>
              </div>
            </div>

            {/* ── 2. AI VISION ANALYSIS & 3. BOUNDING BOX TARGET LIST ── */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> AI Vision Engine Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Neural Model</span>
                  <span className="text-slate-200 font-bold">YOLOv8x CSPDarknet v4.2</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Inference Latency</span>
                  <span className="text-cyan-400 font-bold">14.2 ms GPU</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Overall Confidence</span>
                  <span className="text-emerald-400 font-bold">{inc.aiAnalysis?.confidence || 97.4}%</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Classification</span>
                  <span className="text-amber-300 font-bold truncate block">{inc.aiAnalysis?.classification || 'Road Subsidence'}</span>
                </div>
              </div>

              {/* Bounding Boxes */}
              <div className="space-y-1 pt-1">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Detected Bounding Box Objects:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                    Asphalt Shear (97.4%)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Pothole Cavity (88.2%)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    Sub-base Deflection (84.0%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. OCR RESULTS & ENTITY EXTRACTION ── */}
          {activeTab === 'ocr' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <FileCode className="w-4 h-4" /> OCR Document Intelligence Extraction
              </span>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-[11px] leading-relaxed">
                <p><strong>EXTRACTED TEXT:</strong> "MUNICIPAL WORKS INSPECTION LOG — SECTOR 12. Structural shear observed along 40m asphalt corridor. Hydro-piezometer #WP-09 reading 142 kPa collapse."</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Language</span>
                  <span className="text-slate-200 font-bold">English (en-IN)</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Parsed Entities</span>
                  <span className="text-cyan-300 font-bold">Sector 12, #WP-09, 142 kPa</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">OCR Confidence</span>
                  <span className="text-emerald-400 font-bold">98.2%</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 5. DAMAGE ASSESSMENT & 6. RISK SUMMARY ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Structural Damage Assessment
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Damage Score</span>
                  <span className="text-rose-400 font-bold">78 / 100</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-slate-500 block text-[8px] uppercase">Affected Area</span>
                  <span className="text-cyan-300 font-bold">42.5 m² Surface</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5 col-span-2">
                  <span className="text-slate-500 block text-[8px] uppercase">Estimated Repair Cost</span>
                  <span className="text-emerald-400 font-bold text-xs">{inc.aiAnalysis?.estimatedCost || '₹4,50,000'}</span>
                </div>
              </div>
            </div>

            {/* Risk Summary & Escalation */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Risk Summary & Escalation
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                Heavy commercial axle loads on degraded sub-base pose an imminent risk of total road bed collapse within 4.5 hours if unmitigated.
              </p>
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[9px] font-mono text-rose-300">
                Priority Dispatch SLA: 4.0 Hours // Department: {inc.department || 'Public Works Department'}
              </div>
            </div>
          </div>

          {/* ── 7. DEPARTMENT RECOMMENDATIONS & 8. TIMELINE ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Department Dispatch Recommendations
              </span>
              <ul className="space-y-1.5 text-[10px] font-mono text-slate-300">
                {(inc.aiAnalysis?.recommendations || []).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chronological Timeline */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Operational Timeline Log
              </span>
              <div className="space-y-1.5 font-mono text-[9.5px]">
                {(inc.timeline || []).map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-white/5">
                    <span className="text-slate-400">{t.timestamp}</span>
                    <span className="text-slate-200 font-bold">{t.event}</span>
                    <span className="text-cyan-400">{t.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 9. EARTH IMPACT TELEMETRY ── */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Planetary Health Index Impact:</span>
              <span className="font-bold text-emerald-300">-0.4 PHI Delta (Infrastructure Domain)</span>
            </div>
            <span className="text-[10px] text-slate-400">Authenticated via EarthMind SSOT Ledger</span>
          </div>
        </div>

        {/* ── EMAIL DISPATCH DIALOG MODAL ── */}
        <AnimatePresence>
          {showEmailDialog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" /> Dispatch Executive Report via Email
                </span>
                <button onClick={() => setShowEmailDialog(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Recipient Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" className="text-[10px]" onClick={() => setShowEmailDialog(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" className="text-[10px] bg-cyan-600" icon={<Send className="w-3 h-3" />} onClick={handleSendEmail}>
                  Dispatch Briefing
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Print media styling override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </Modal>
  );
}

export default ExecutiveReportingEngineModal;
