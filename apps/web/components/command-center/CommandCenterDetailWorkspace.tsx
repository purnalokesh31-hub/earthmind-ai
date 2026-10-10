'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Advanced Command Center Incident Detail Workspace
// Complete Incident Workspace: AI summary, Evidence, SLA, Dispatch & Escalations
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandCenterWorkspaceDetailDto } from '../../lib/server/dto/command-center.dto';
import { AiIntelligencePanel } from './AiIntelligencePanel';
import { EvidenceIntelligencePanel } from './EvidenceIntelligencePanel';
import { MultiAgencyPanel } from './MultiAgencyPanel';
import { CommandNotificationCenter } from './CommandNotificationCenter';

interface CommandCenterDetailWorkspaceProps {
  detail: CommandCenterWorkspaceDetailDto;
  onClose?: () => void;
  onAcknowledge?: (dispatchId: string) => void;
  onEscalate?: (dispatchId: string) => void;
}

export const CommandCenterDetailWorkspace: React.FC<CommandCenterDetailWorkspaceProps> = ({
  detail,
  onClose,
  onAcknowledge,
  onEscalate,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI' | 'EVIDENCE' | 'DISPATCH' | 'MULTI_AGENCY' | 'TIMELINE' | 'NOTIFS'>('OVERVIEW');
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  const { incident, description, aiSummary, riskAssessment, evidenceItems, dispatch, sla, escalation, timelineEvents, multiAgency } = detail;

  const confirmAction = (action: string) => {
    if (action === 'ESCALATE' && dispatch && onEscalate) {
      onEscalate(dispatch.id);
    } else if (action === 'ACKNOWLEDGE' && dispatch && onAcknowledge) {
      onAcknowledge(dispatch.id);
    }
    setShowConfirmModal(null);
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-full relative">
      {/* Workspace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400">{incident.incidentCode}</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 rounded uppercase">
              {incident.severity}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded">
              {incident.status}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-1">{incident.title}</h1>
          <p className="text-xs text-slate-400">📍 {incident.locationName}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 my-3 text-xs overflow-x-auto">
        {[
          { key: 'OVERVIEW', label: '📊 Overview' },
          { key: 'AI', label: '🤖 AI Intelligence' },
          { key: 'EVIDENCE', label: `📁 Evidence (${evidenceItems.length})` },
          { key: 'DISPATCH', label: '🛰️ Dispatch & SLA' },
          { key: 'MULTI_AGENCY', label: `🏛️ Multi-Agency (${multiAgency.participatingAgenciesCount})` },
          { key: 'NOTIFS', label: '🔔 Alerts' },
          { key: 'TIMELINE', label: `⏳ Audit (${timelineEvents.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2 px-2.5 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-300 space-y-4">
        {activeTab === 'OVERVIEW' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
              <h3 className="font-semibold text-slate-200 mb-1">Description</h3>
              <p className="text-slate-300">{description}</p>
            </div>

            {aiSummary && (
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                <h3 className="font-semibold text-cyan-300 mb-1">🤖 AI Summary</h3>
                <p className="text-slate-200">{aiSummary}</p>
              </div>
            )}

            {riskAssessment && (
              <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-2">⚡ Risk Score Breakdown ({riskAssessment.overallRiskScore}/100)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Public Safety</span>
                    <span className="text-sm font-bold text-red-400">{riskAssessment.publicSafetyRisk}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Environmental</span>
                    <span className="text-sm font-bold text-emerald-400">{riskAssessment.environmentalRisk}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Financial</span>
                    <span className="text-sm font-bold text-amber-400">{riskAssessment.financialRisk}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Operational</span>
                    <span className="text-sm font-bold text-cyan-400">{riskAssessment.operationalRisk}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'AI' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AiIntelligencePanel
              aiSummary={aiSummary}
              confidence={96.4}
              overallRiskScore={riskAssessment?.overallRiskScore}
            />
          </motion.div>
        )}

        {activeTab === 'EVIDENCE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EvidenceIntelligencePanel items={evidenceItems} />
          </motion.div>
        )}

        {activeTab === 'DISPATCH' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">Phase 6.7 Autonomous Dispatch</h3>
                <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  {dispatch?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-slate-400">{dispatch?.dispatchReason || 'Awaiting autonomous officer assignment'}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ack Deadline</span>
                  <span className="font-mono text-slate-200">{new Date(sla.acknowledgementDeadline).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Response Deadline</span>
                  <span className="font-mono text-slate-200">{new Date(sla.responseDeadline).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {dispatch && onAcknowledge && (
                <button
                  onClick={() => setShowConfirmModal('ACKNOWLEDGE')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
                >
                  ✓ Acknowledge Dispatch
                </button>
              )}
              {dispatch && onEscalate && (
                <button
                  onClick={() => setShowConfirmModal('ESCALATE')}
                  className="py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white font-medium rounded-lg transition"
                >
                  ⬆️ Escalate (L{escalation.level + 1})
                </button>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'MULTI_AGENCY' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MultiAgencyPanel
              primaryDepartmentName={multiAgency.primaryDepartmentName}
              participatingAgenciesCount={multiAgency.participatingAgenciesCount}
              isCoordinated={multiAgency.isCoordinated}
            />
          </motion.div>
        )}

        {activeTab === 'NOTIFS' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CommandNotificationCenter />
          </motion.div>
        )}

        {activeTab === 'TIMELINE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="p-2.5 bg-[#050B14] border border-slate-800/80 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-cyan-400 text-[11px] block">{evt.action}</span>
                  <span className="text-slate-300">{evt.note}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{new Date(evt.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Command Action Confirmation Safety Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0B1528] border border-slate-700 rounded-xl p-5 max-w-sm w-full space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">
                ⚠️ Confirm Command Action: {showConfirmModal}
              </h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to execute {showConfirmModal} for incident{' '}
                <span className="font-mono text-cyan-400">{incident.incidentCode}</span>? This action will create an immutable audit record and dispatch notifications.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction(showConfirmModal)}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-xs"
                >
                  Confirm Execute
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
