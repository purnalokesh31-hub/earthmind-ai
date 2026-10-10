'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Decision Support & Human Control Panel
// Human-in-the-Loop Operational Authorization Interface
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecisionSupportRecommendationDto } from '../../lib/server/dto/situation-awareness.dto';

export const DecisionSupportPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<DecisionSupportRecommendationDto[]>([]);

  const fetchRecommendations = () => {
    fetch('/api/v1/operations/recommendations')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setRecommendations(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApprove = (id: string) => {
    fetch(`/api/v1/operations/recommendations/${id}/approve`, { method: 'POST' })
      .then(() => fetchRecommendations())
      .catch(() => {});
  };

  const handleReject = (id: string) => {
    fetch(`/api/v1/operations/recommendations/${id}/reject`, { method: 'POST' })
      .then(() => fetchRecommendations())
      .catch(() => {});
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🛡️ Decision Support & Human Control Center</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              ● HUMAN APPROVAL REQUIRED
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Advisory operational recommendations generated from incident, risk & prediction telemetry.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-400">
          {recommendations.length} Pending Actions
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {recommendations.map((r) => (
            <motion.div
              key={r.recommendationId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#050B14] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      ⚡ {r.priority} PRIORITY
                    </span>
                    <span className="text-xs font-bold text-slate-100">{r.title}</span>
                  </div>
                  <p className="text-xs text-slate-300">{r.reason}</p>
                </div>

                <div className="text-right whitespace-nowrap font-mono text-[11px] text-cyan-400 font-bold">
                  {r.confidence}% Confidence
                </div>
              </div>

              {/* Supporting Factors List */}
              <div className="bg-[#0B1528] p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">Supporting Evidence & Signals:</span>
                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                  {r.supportingFactors.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* Action Authorization Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleReject(r.recommendationId)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                >
                  ✕ Reject Action
                </button>
                <button
                  onClick={() => handleApprove(r.recommendationId)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
                >
                  ✓ Authorize Execution
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recommendations.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs font-mono">
            ✓ All operational decision support recommendations evaluated and authorized.
          </div>
        )}
      </div>
    </div>
  );
};
