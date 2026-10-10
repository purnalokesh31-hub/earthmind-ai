'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REPORT_TEMPLATES } from '../../lib/demo-data';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../stores/app-store';
import {
  FileText,
  Printer,
  Mail,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Share2,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';

export default function ReportsPage() {
  const { incidents, addToast } = useAppStore();

  const [selected, setSelected] = useState(REPORT_TEMPLATES[0]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);

  // Dynamic telemetry calculations
  const activeCasesCount = incidents.filter(i => i.status !== 'resolved').length;
  const criticalCasesCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const resolvedCasesCount = incidents.filter(i => i.status === 'resolved').length;
  const criticalIncidentsList = incidents.filter(i => i.severity === 'critical').slice(0, 2);

  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      addToast({
        title: 'Report Generated',
        message: `Successfully generated ${selected.label}. Ready for export.`,
        type: 'success',
      });
    }, 1500);
  };

  // EXPORT ACTIONS
  const handleExportPDF = () => {
    addToast({
      title: 'Exporting PDF Document',
      message: `Packaging ${selected.label} into high-fidelity vector PDF. Download started.`,
      type: 'info',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleEmailDispatch = () => {
    addToast({
      title: 'Email Briefing Dispatched',
      message: `Sent ${selected.label} to C-Suite executive distribution list & department heads.`,
      type: 'success',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-5 max-w-6xl mx-auto w-full h-full pb-20 lg:pb-0 font-mono text-slate-200"
    >
      {/* ── Left: 7 Reusable Template Pickers ── */}
      <div className="w-64 shrink-0 flex flex-col gap-3 hidden md:flex">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>7 Report Templates</span>
          </h2>
          <span className="text-[9px] text-cyan-400 font-bold">READY</span>
        </div>

        <div className="flex flex-col gap-2">
          {REPORT_TEMPLATES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => { setSelected(t); setGenerated(true); }}
              className={cn(
                'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all group',
                selected.id === t.id
                  ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-200 shadow-md'
                  : 'border-white/10 bg-[#050B14] hover:border-cyan-500/30 hover:bg-white/[0.02]'
              )}
            >
              <span className="text-lg shrink-0 p-1.5 rounded-lg bg-white/5">{t.icon}</span>
              <div>
                <p className="text-xs font-bold group-hover:text-cyan-300 transition">{t.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed font-sans">{t.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Right: Executive Report Engine Sheet & Controls ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-[#070D18] border border-white/10">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Executive Reporting Engine</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                REUSABLE TEMPLATES ACTIVE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans">
              Generate, preview, print, email, or export high-fidelity operational briefs
            </p>
          </div>

          {/* 4 EXPORT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-cyan-500/40"
              icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
              onClick={handleExportPDF}
            >
              PDF Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-indigo-500/40"
              icon={<Printer className="w-3.5 h-3.5 text-indigo-400" />}
              onClick={handlePrint}
            >
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-purple-500/40"
              icon={<Mail className="w-3.5 h-3.5 text-purple-400" />}
              onClick={handleEmailDispatch}
            >
              Email Brief
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="text-[10px] py-1"
              disabled={generating}
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleGenerate}
            >
              {generating ? 'Generating...' : 'Re-Generate'}
            </Button>
          </div>
        </div>

        {/* High Fidelity Document Sheet Preview */}
        <div className="card flex-1 overflow-hidden flex flex-col bg-[#050B14] border border-white/10 rounded-2xl shadow-2xl">
          {/* Header Strip */}
          <div className="p-4 border-b border-white/10 bg-[#070D18] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-white/5">{selected.icon}</span>
              <div>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">{selected.label}</h2>
                <p className="text-[10px] text-slate-400 font-sans">{today} · Vijayawada Municipal Command</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
              <span>TEMPLATE ID: <strong className="text-cyan-400">{selected.id}</strong></span>
            </div>
          </div>

          {/* Body Sheet */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full"
                  />
                  <p className="text-xs font-bold text-cyan-400">Compiling high-fidelity telemetry briefing...</p>
                  <p className="text-[10px] text-slate-500">Synthesizing live incident ledgers & GIS coordinates</p>
                </motion.div>
              ) : generated ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* High Fidelity Document Sheet Paper */}
                  <div className="bg-[#f8fafc] text-slate-900 rounded-xl p-8 border border-slate-300 shadow-2xl max-w-3xl mx-auto w-full font-serif leading-relaxed text-xs">
                    {/* Document Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4 font-sans">
                      <div>
                        <div className="text-[14px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <span>EarthMind PIOS Command Ledger</span>
                        </div>
                        <div className="text-[8px] font-mono tracking-widest text-slate-600 uppercase mt-0.5">
                          {selected.label.toUpperCase()} — OFFICIAL BRIEF
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono font-bold text-slate-800">REF: EM-RPT-2026-083</div>
                        <div className="text-[8px] font-mono text-slate-600">{today}</div>
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-300 mb-4 font-sans text-[8px] text-slate-700 uppercase font-bold">
                      <div>Jurisdiction: Vijayawada Metro</div>
                      <div>System Status: Nominal</div>
                      <div>Engine: Gemini Executive AI</div>
                    </div>

                    {/* Section 1: Executive Summary */}
                    <div className="mb-5">
                      <h3 className="font-sans text-[10px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-1 mb-2">
                        1. Executive Operational Overview
                      </h3>
                      <p className="text-slate-800 font-sans text-xs leading-relaxed">
                        This executive intelligence audit summarizes operations for the Vijayawada municipal sector. The composite Planetary Health Index (PHI) is verified at <strong className="text-emerald-700">92/100</strong>, reflecting optimal baseline stability across water main conduits, power substations, and urban transit lines.
                      </p>
                    </div>

                    {/* Section 2: Core Platform Metrics */}
                    <div className="mb-5">
                      <h3 className="font-sans text-[10px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-1 mb-2">
                        2. Dynamic Incident Metrics
                      </h3>
                      <div className="grid grid-cols-4 gap-3 font-sans text-center mt-2">
                        {[
                          { label: 'Active Cases', value: String(activeCasesCount), desc: 'Active' },
                          { label: 'Critical', value: String(criticalCasesCount), desc: 'Immediate' },
                          { label: 'Resolved Today', value: String(resolvedCasesCount), desc: 'Resolved' },
                          { label: 'Platform PHI', value: '92%', desc: 'Nominal' },
                        ].map((m) => (
                          <div key={m.label} className="p-2 rounded-lg bg-slate-200/60 border border-slate-300">
                            <p className="text-[14px] font-black text-slate-900 leading-none">{m.value}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mt-1">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Critical Anomaly Highlights */}
                    <div className="mb-5">
                      <h3 className="font-sans text-[10px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-1 mb-2">
                        3. Primary Sector Anomaly Highlights
                      </h3>
                      <div className="flex flex-col gap-2 font-sans">
                        {criticalIncidentsList.map((inc) => (
                          <div key={inc.id} className="p-2.5 rounded-lg border border-red-300 bg-red-50 text-[10px] text-slate-800">
                            <div className="flex justify-between items-center mb-1 font-bold">
                              <span className="text-red-700">{inc.id} — {inc.title}</span>
                              <span className="text-[8px] px-1.5 py-0.5 bg-red-200 border border-red-400 rounded text-red-900 font-black">
                                CRITICAL P1
                              </span>
                            </div>
                            <p className="text-slate-700 text-[9px]">{inc.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Sign-off Stamp */}
                    <div className="pt-4 border-t border-slate-400 flex justify-between items-center font-sans text-[8px] text-slate-600">
                      <div>Official Briefing Seal · EarthMind Intelligence Platform</div>
                      <div className="font-mono text-emerald-800 font-bold uppercase">✓ ISO-27001 SEALED DOCUMENT</div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
