'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Agent Operations Workspace Component
// Natural Language Queries, Reasoning & Human Authorization Controls
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentTaskEntity, EmergencyBriefingDto } from '../../lib/server/domain/ai-agent.domain';

export const AIAssistantWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<AgentTaskEntity | null>(null);
  const [briefing, setBriefing] = useState<EmergencyBriefingDto | null>(null);

  const handleQuerySubmit = async (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (data.data) {
        setCurrentTask(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      const res = await fetch('/api/v1/ai/briefings?type=CITY');
      const data = await res.json();
      if (data.data) setBriefing(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🤖 Enterprise AI Operations Assistant & Knowledge Intelligence</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              ● EXPLAINABLE AI
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Natural language operational query engine with citations, structured reasoning, & mandatory human authorization.
          </p>
        </div>

        <button
          onClick={handleGenerateBriefing}
          className="px-3 py-1.5 font-mono text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-lg transition"
        >
          📄 Generate Emergency Briefing
        </button>
      </div>

      {/* Natural Language Query Box */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask EarthMind AI about incidents, risk forecasts, responder workloads, or SLA breaches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit()}
            className="w-full pl-4 pr-24 py-3 bg-[#050B14] border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 shadow-inner"
          />
          <button
            onClick={() => handleQuerySubmit()}
            disabled={isProcessing}
            className="absolute right-2 top-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition"
          >
            {isProcessing ? 'Thinking...' : 'Query AI'}
          </button>
        </div>

        {/* Preset Quick Questions */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-400">Quick Queries:</span>
          {[
            'What requires attention right now?',
            'Show highest-risk incidents in Vijayawada',
            'Which departments are overloaded?',
            'What flood risks are predicted for the next 24 hours?',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleQuerySubmit(q);
              }}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Briefing Card Overlay */}
      {briefing && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-indigo-300 text-xs">📄 {briefing.title}</h3>
            <span className="font-mono text-[10px] text-slate-400">{briefing.generatedAt}</span>
          </div>
          <p className="text-slate-300">{briefing.currentSituation}</p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-indigo-300">
            <span>Critical Incidents: {briefing.criticalIncidentsCount}</span>
            <span>Active Warnings: {briefing.activeWarningsCount}</span>
            <span>Predicted Risks: {briefing.predictedRisksCount}</span>
          </div>
        </motion.div>
      )}

      {/* Reasoning & Recommendation Card Output */}
      {currentTask && currentTask.reasoningOutput && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#050B14] border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-lg"
        >
          {/* Situation & Confidence Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                TASK ID: {currentTask.taskId}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                {currentTask.recommendation?.title || currentTask.reasoningOutput.recommendedOption}
              </h3>
            </div>

            <div className="text-right">
              <div className="text-lg font-mono font-bold text-cyan-400">
                {currentTask.reasoningOutput.confidenceScore}%
              </div>
              <div className="text-[10px] font-mono text-slate-400">AI Confidence</div>
            </div>
          </div>

          <p className="text-xs text-slate-300">{currentTask.reasoningOutput.situationSummary}</p>

          {/* Evidence Citations */}
          <div className="bg-[#0B1528] p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              📌 Verified Knowledge Citations ({currentTask.reasoningOutput.evidenceCitations.length} Sources):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTask.reasoningOutput.evidenceCitations.map((c, i) => (
                <div key={i} className="p-2 bg-[#050B14] rounded border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{c.sourceType}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{c.relevanceScore}% Relevance</span>
                  </div>
                  <div className="text-slate-300 truncate mt-0.5">{c.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Authorization Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-amber-400">
              ⚠️ Requires Explicit Human Authorization Before Execution
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTask(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs"
              >
                ✕ Dismiss
              </button>
              <button
                onClick={() => useAppStore.getState().addToast({ title: 'Action Authorized', message: 'Action authorized by Duty Officer.', type: 'success' })}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs shadow-md"
              >
                ✓ Authorize Recommendation
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
