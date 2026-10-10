'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge } from './Badge';
import {
  Brain,
  Layers,
  MapPin,
  GitMerge,
  EyeOff,
  AlertTriangle,
  FileText,
  Sparkles,
  Zap,
  Clock,
  Activity,
  ShieldCheck,
  Building2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { computeRelatedIntelligence, type IncidentIntelligenceResult } from '../../lib/services/ai.service';
import type { Incident } from '../../types';

export const IncidentIntelligenceEngine: React.FC<{ incident?: Incident }> = ({ incident: propIncident }) => {
  const { selectedIncident, incidents, addToast, openReportModal, updateIncident } = useAppStore();

  const activeInc = propIncident || selectedIncident || incidents[0] || null;

  const [intelligence, setIntelligence] = useState<IncidentIntelligenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'duplicates' | 'nearby' | 'historical' | 'infrastructure' | 'merge'>('duplicates');
  const [mergedIds, setMergedIds] = useState<string[]>([]);

  // Auto-compute intelligence whenever active incident changes
  useEffect(() => {
    if (!activeInc) return;
    setLoading(true);
    computeRelatedIntelligence(activeInc, incidents)
      .then((res) => setIntelligence(res))

      .finally(() => setLoading(false));
  }, [activeInc, incidents]);

  // 1-Click AI Merge Action
  const handleMergeAction = (sourceId: string, title: string) => {
    setMergedIds((prev) => [...prev, sourceId]);

    // Update state to mark duplicate case as archived / merged
    updateIncident(sourceId, { status: 'archived' });

    addToast({
      title: 'Incidents Merged via AI Engine',
      message: `Merged case ${sourceId} into primary record ${activeInc?.id}. State updated in SSOT.`,
      type: 'success',
    });
  };

  const handleGenerateRegionalReport = () => {
    if (!activeInc) return;
    openReportModal(
      activeInc.category,
      `Regional Multi-Sector Hazard Intelligence Audit — ${activeInc.location?.name || 'Vijayawada'}`
    );
  };

  if (!activeInc) return null;

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-indigo-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Incident Intelligence & Correlation Engine</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                  ML CORRELATION ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Automated computing of duplicates, spatial proximity, historical cases & shared infrastructure
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] py-1 border-white/10 text-slate-200 hover:border-indigo-500/40"
            icon={<FileText className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={handleGenerateRegionalReport}
          >
            Generate Regional Report
          </Button>
        </div>

        {/* ── 6 AUTOMATED COMPUTATION INDICATORS ── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4 z-10 relative text-[10px]">
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Related Cases</span>
            <span className="text-cyan-400 font-bold">{intelligence?.relatedIncidents.length || 0} Computed</span>
          </div>
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Duplicate Detection</span>
            <span className="text-amber-400 font-bold">{intelligence?.duplicateDetection.length || 0} Flags</span>
          </div>
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Nearby Cluster</span>
            <span className="text-indigo-400 font-bold">
              {intelligence?.nearbyIncidents[0] ? `${intelligence.nearbyIncidents[0].distanceMeters}m away` : 'None'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Similar Historical</span>
            <span className="text-rose-400 font-bold">{intelligence?.similarHistoricalCases.length || 0} Matches</span>
          </div>
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Shared Assets</span>
            <span className="text-emerald-400 font-bold">{intelligence?.sharedInfrastructure.length || 0} Grids</span>
          </div>
          <div className="p-2 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">AI Merge Suggestions</span>
            <span className="text-teal-400 font-bold">{intelligence?.aiMergeSuggestions.length || 0} Suggested</span>
          </div>
        </div>

        {/* ── INTELLIGENCE DIMENSION TABS ── */}
        <div className="flex items-center gap-1 p-1 bg-[#050B14] rounded-xl border border-white/10 mb-3 overflow-x-auto text-[10px]">
          {(['duplicates', 'nearby', 'historical', 'infrastructure', 'merge'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold capitalize transition flex items-center gap-1.5 whitespace-nowrap',
                activeTab === tab
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              {tab === 'duplicates' && <GitMerge className="w-3 h-3 text-amber-400" />}
              {tab === 'nearby' && <MapPin className="w-3 h-3 text-cyan-400" />}
              {tab === 'historical' && <Clock className="w-3 h-3 text-purple-400" />}
              {tab === 'infrastructure' && <Building2 className="w-3 h-3 text-emerald-400" />}
              {tab === 'merge' && <Sparkles className="w-3 h-3 text-teal-400" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT DISPLAY ── */}
        <div className="space-y-3 z-10 relative text-[10px] min-h-[140px]">
          {/* TAB 1: DUPLICATES */}
          {activeTab === 'duplicates' && (
            <div className="space-y-2">
              {intelligence?.duplicateDetection.map((item) => {
                const isMerged = mergedIds.includes(item.incident.id);
                return (
                  <div key={item.incident.id} className="p-3 rounded-xl bg-[#050B14] border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{item.incident.title}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[9px]">
                          {item.confidence}% Match
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">{item.recommendation}</p>
                    </div>

                    {isMerged ? (
                      <span className="text-emerald-400 font-bold text-[9px] shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> MERGED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMergeAction(item.incident.id, item.incident.title)}
                        className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold transition border border-cyan-500/30 shrink-0 flex items-center gap-1"
                      >
                        <GitMerge className="w-3 h-3" /> Merge
                      </button>
                    )}
                  </div>
                );
              })}
              {intelligence?.duplicateDetection.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">No duplicate intake records detected for this incident.</div>
              )}
            </div>
          )}

          {/* TAB 2: NEARBY INCIDENTS */}
          {activeTab === 'nearby' && (
            <div className="space-y-2">
              {intelligence?.nearbyIncidents.map((item) => (
                <div key={item.incident.id} className="p-3 rounded-xl bg-[#050B14] border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-slate-100">{item.incident.title}</h5>
                    <span className="text-[9px] text-slate-400">Sector: {item.incident.location?.name || 'Vijayawada'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-cyan-400 font-bold block text-xs">📍 {item.distanceMeters}m away</span>
                    <span className="text-slate-500 text-[9px]">{item.incident.severity.toUpperCase()}</span>
                  </div>
                </div>
              ))}
              {intelligence?.nearbyIncidents.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">No active incidents within 5000m radius.</div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORICAL CASES */}
          {activeTab === 'historical' && (
            <div className="space-y-2">
              {intelligence?.similarHistoricalCases.map((item) => (
                <div key={item.incident.id} className="p-3 rounded-xl bg-[#050B14] border border-white/10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-100">{item.incident.title}</h5>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[9px]">
                      {item.matchScore}% Similarity
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-sans">{item.historicalOutcome}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SHARED INFRASTRUCTURE */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-2">
              {intelligence?.sharedInfrastructure.map((asset, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#050B14] border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      {asset.assetName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[9px]">
                      {asset.riskLevel}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">
                    Linked Active Cases: {asset.affectedIncidents.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AI MERGE SUGGESTIONS */}
          {activeTab === 'merge' && (
            <div className="space-y-2">
              {intelligence?.aiMergeSuggestions.map((sug) => {
                const isMerged = mergedIds.includes(sug.sourceId);
                return (
                  <div key={sug.sourceId} className="p-3.5 rounded-xl bg-[#050B14] border border-teal-500/30 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">Merge Case {sug.sourceId} → {sug.targetId}</span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 text-[9px]">
                          {sug.confidence}% AI Confidence
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 font-sans">{sug.justification}</p>
                    </div>

                    {isMerged ? (
                      <span className="text-emerald-400 font-bold text-[9px] shrink-0">✓ MERGED</span>
                    ) : (
                      <button
                        onClick={() => handleMergeAction(sug.sourceId, sug.sourceId)}
                        className="px-3 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold transition border border-teal-500/30 shrink-0 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto Merge
                      </button>
                    )}
                  </div>
                );
              })}
              {intelligence?.aiMergeSuggestions.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">No pending AI merge suggestions. All records distinct.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between z-10 relative">
        <span>Cross-incident ML neural similarity matrix online. Architecture ready for REST API.</span>
        <span className="text-emerald-400 font-bold">CORRELATION ACTIVE</span>
      </div>
    </Card>
  );
};

export default IncidentIntelligenceEngine;
