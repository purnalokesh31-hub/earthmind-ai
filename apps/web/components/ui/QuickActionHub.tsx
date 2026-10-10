'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import {
  Zap,
  AlertTriangle,
  MapPin,
  FileText,
  UserCheck,
  Bell,
  BarChart2,
  Download,
  Search,
  Command,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QuickActionItem {
  id: string;
  icon: string;
  lucideIcon: React.ReactNode;
  title: string;
  description: string;
  shortcut: string;
  action: () => void;
  accentColor: string;
}

export const QuickActionHub: React.FC = () => {
  const {
    setActiveTab,
    openReportModal,
    setCommandPaletteOpen,
    addToast,
    openConfirmDialog,
    incidents,
  } = useAppStore();

  const actions: QuickActionItem[] = [
    {
      id: 'report-incident',
      icon: '🚨',
      lucideIcon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      title: 'Report Incident',
      description: 'Intake form with automated AI pre-scan',
      shortcut: 'Ctrl+N',
      action: () => openReportModal(),
      accentColor: 'hover:border-rose-500/40 hover:bg-rose-950/20',
    },
    {
      id: 'open-digital-twin',
      icon: '🛰️',
      lucideIcon: <MapPin className="w-4 h-4 text-cyan-400" />,
      title: 'Open Digital Twin',
      description: 'Live 3D satellite GIS map & sensor feeds',
      shortcut: 'Ctrl+M',
      action: () => setActiveTab('map'),
      accentColor: 'hover:border-cyan-500/40 hover:bg-cyan-950/20',
    },
    {
      id: 'assign-officer',
      icon: '👮',
      lucideIcon: <UserCheck className="w-4 h-4 text-emerald-400" />,
      title: 'Assign Officer',
      description: 'Roster officer to active field incident',
      shortcut: 'Ctrl+O',
      action: () => {
        const targetInc = incidents[0];
        if (targetInc) {
          openConfirmDialog({
            title: `Assign Officer to ${targetInc.id}`,
            message: `Dispatch Officer Lokesh to case "${targetInc.title}"?`,
            confirmLabel: 'Assign Officer Lokesh',
            onConfirm: () => {
              addToast({ title: 'Officer Assigned', message: `Officer Lokesh assigned to ${targetInc.id}.`, type: 'success' });
            },
          });
        }
      },
      accentColor: 'hover:border-emerald-500/40 hover:bg-emerald-950/20',
    },
    {
      id: 'generate-report',
      icon: '📄',
      lucideIcon: <FileText className="w-4 h-4 text-indigo-400" />,
      title: 'Generate Report',
      description: 'Synthesize 24h metrics into PDF executive briefing',
      shortcut: 'Ctrl+R',
      action: () => openReportModal('infrastructure', 'Executive Briefing Report'),
      accentColor: 'hover:border-indigo-500/40 hover:bg-indigo-950/20',
    },
    {
      id: 'notify-department',
      icon: '🔔',
      lucideIcon: <Bell className="w-4 h-4 text-purple-400" />,
      title: 'Notify Department',
      description: 'Broadcast urgent telemetry alert to domain Leads',
      shortcut: 'Ctrl+B',
      action: () => {
        addToast({ title: 'Department Broadcast', message: 'Dispatched broadcast alert to 9 Domain Leads.', type: 'info' });
      },
      accentColor: 'hover:border-purple-500/40 hover:bg-purple-950/20',
    },
    {
      id: 'view-analytics',
      icon: '📊',
      lucideIcon: <BarChart2 className="w-4 h-4 text-teal-400" />,
      title: 'View Analytics',
      description: 'Cross-domain sector health & trend graphs',
      shortcut: 'Ctrl+I',
      action: () => setActiveTab('insights'),
      accentColor: 'hover:border-teal-500/40 hover:bg-teal-950/20',
    },
    {
      id: 'export-data',
      icon: '💾',
      lucideIcon: <Download className="w-4 h-4 text-blue-400" />,
      title: 'Export Data',
      description: 'Export raw JSON / CSV telemetry package',
      shortcut: 'Ctrl+E',
      action: () => {
        addToast({ title: 'Telemetry Exported', message: 'Downloaded raw JSON case ledger.', type: 'success' });
      },
      accentColor: 'hover:border-blue-500/40 hover:bg-blue-950/20',
    },
    {
      id: 'search-records',
      icon: '🔍',
      lucideIcon: <Search className="w-4 h-4 text-amber-400" />,
      title: 'Search Records',
      description: 'Global search across all 9 domain operations',
      shortcut: 'Ctrl+K',
      action: () => setCommandPaletteOpen(true),
      accentColor: 'hover:border-amber-500/40 hover:bg-amber-950/20',
    },
  ];

  // Global Keyboard Listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'n') {
          e.preventDefault();
          actions[0].action();
        } else if (key === 'm') {
          e.preventDefault();
          actions[1].action();
        } else if (key === 'o') {
          e.preventDefault();
          actions[2].action();
        } else if (key === 'r') {
          e.preventDefault();
          actions[3].action();
        } else if (key === 'b') {
          e.preventDefault();
          actions[4].action();
        } else if (key === 'i') {
          e.preventDefault();
          actions[5].action();
        } else if (key === 'e') {
          e.preventDefault();
          actions[6].action();
        } else if (key === 'k') {
          e.preventDefault();
          actions[7].action();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-amber-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HUB HEADER ── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Reusable Quick Operations Shortcuts Hub</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  8 SHORTCUTS
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Instant operational execution controls with keyboard shortcuts</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-cyan-400" /> SHORTCUTS ACTIVE
          </span>
        </div>

        {/* ── 8 SHORTCUT CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 z-10">
          {actions.map((act) => (
            <motion.button
              key={act.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={act.action}
              className={cn(
                'p-3.5 rounded-xl bg-[#050B14] border border-white/10 text-left flex flex-col justify-between gap-2.5 transition-all duration-200 group cursor-pointer shadow-md',
                act.accentColor
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{act.icon}</span>
                  <span className="p-1 rounded-md bg-white/5 border border-white/5">
                    {act.lucideIcon}
                  </span>
                </div>

                <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono font-bold text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition">
                  {act.shortcut}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                  {act.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="text-[9px] font-mono text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pt-1 border-t border-white/5">
                EXECUTE SHORTCUT →
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-3 border-t border-white/10 text-[10px] font-mono text-slate-500 flex items-center justify-between z-10">
        <span>Press shortcut keys anywhere on the dashboard for instant execution.</span>
        <span className="text-amber-400 font-bold">1-TAP COMMAND HUB</span>
      </div>
    </Card>
  );
};
