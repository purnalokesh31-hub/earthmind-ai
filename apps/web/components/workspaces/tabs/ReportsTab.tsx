'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useAppStore } from '../../../stores/app-store';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Mail,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Incident } from '../../../types';

// ── Available report types ──
const REPORT_TYPES = [
  { id: 'situation', label: 'Situation Report', icon: '📋', description: 'Real-time status of the incident with all telemetry data.', format: 'PDF' },
  { id: 'executive', label: 'Executive Briefing', icon: '📊', description: 'C-Suite summary with risk assessment and financial impact.', format: 'PDF' },
  { id: 'analytics', label: 'Analytics Report', icon: '📈', description: 'Detailed analytics with trends, SLA, and performance metrics.', format: 'Excel' },
  { id: 'evidence', label: 'Evidence Dossier', icon: '📸', description: 'Complete evidence repository with metadata and chain of custody.', format: 'PDF' },
  { id: 'audit', label: 'Audit Trail Report', icon: '🔒', description: 'Immutable audit log with all state transitions and operator actions.', format: 'PDF' },
  { id: 'earth', label: 'Earth Impact Report', icon: '🌍', description: 'Planetary health impact assessment and recovery projections.', format: 'PDF' },
];

// ── Mock generated reports ──
const MOCK_HISTORY = [
  { id: 'rpt-001', title: 'Daily Situation Report', generatedAt: '2 hours ago', format: 'PDF', status: 'ready', size: '1.2 MB' },
  { id: 'rpt-002', title: 'Executive Briefing', generatedAt: '5 hours ago', format: 'PDF', status: 'ready', size: '840 KB' },
  { id: 'rpt-003', title: 'Weekly Analytics', generatedAt: '1 day ago', format: 'Excel', status: 'ready', size: '2.8 MB' },
];

const ReportsTab: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { addToast, openReportModal } = useAppStore();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    // Simulate generation
    await new Promise((r) => setTimeout(r, 1200));
    setGenerating(null);
    addToast({ title: 'Report Generated', message: `Report ready for download.`, type: 'success' });
  };

  return (
    <div className="space-y-4">
      {/* Generate Report */}
      <Card className="p-4 bg-[#0A1220]/95 border-white/10">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-cyan-400" /> Generate Incident Report
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map((rpt, idx) => (
            <motion.div
              key={rpt.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-3 rounded-xl bg-[#050B14] border border-white/5 hover:border-cyan-500/20 transition group cursor-pointer"
              onClick={() => handleGenerate(rpt.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{rpt.icon}</span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                  {rpt.format}
                </span>
              </div>
              <h5 className="text-[10px] font-bold text-slate-200 mb-1 group-hover:text-cyan-300 transition">{rpt.label}</h5>
              <p className="text-[9px] text-slate-500 leading-relaxed">{rpt.description}</p>

              {generating === rpt.id && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-mono text-cyan-400">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Report History */}
      <Card className="p-4 bg-[#0A1220]/95 border-white/10">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-indigo-400" /> Recent Reports
        </h4>

        <div className="space-y-2">
          {MOCK_HISTORY.map((rpt, idx) => (
            <motion.div
              key={rpt.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-3 rounded-xl bg-[#050B14] border border-white/5 flex items-center justify-between hover:border-cyan-500/20 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-200 block">{rpt.title}</span>
                  <span className="text-[9px] font-mono text-slate-500">{rpt.generatedAt} · {rpt.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {rpt.status.toUpperCase()}
                </span>
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReportsTab;
