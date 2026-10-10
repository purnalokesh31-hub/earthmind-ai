'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Predictive Intelligence Workspace Component
// Forecast & Early Warning Dashboard for Regional Command
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PredictionEntity, EarlyWarningEntity, PredictionWindow } from '../../lib/server/domain/prediction.domain';

export const PredictiveWorkspace: React.FC = () => {
  const [activeWindow, setActiveWindow] = useState<PredictionWindow>('NEXT_24_HOURS');
  const [predictions, setPredictions] = useState<PredictionEntity[]>([]);
  const [warnings, setWarnings] = useState<EarlyWarningEntity[]>([]);

  useEffect(() => {
    fetch('/api/v1/predictions')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setPredictions(res.data);
      })
      .catch(() => {});

    fetch('/api/v1/warnings/active')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setWarnings(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header & Forecast Window Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🔮 Predictive Risk Intelligence & Early Warning System</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              ● PROBABILITY FORECAST
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Weighted multi-factor hazard forecasts based on historical recurrence, telemetry, and regional risk propagation.
          </p>
        </div>

        {/* Prediction Window Switcher */}
        <div className="flex items-center gap-1 bg-[#050B14] p-1 border border-slate-800 rounded-lg">
          {[
            { win: 'NEXT_6_HOURS', label: '6 Hours' },
            { win: 'NEXT_24_HOURS', label: '24 Hours' },
            { win: 'NEXT_72_HOURS', label: '72 Hours' },
            { win: 'NEXT_7_DAYS', label: '7 Days' },
          ].map((w) => (
            <button
              key={w.win}
              onClick={() => setActiveWindow(w.win as any)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition ${
                activeWindow === w.win
                  ? 'bg-purple-600/30 text-purple-200 font-bold border border-purple-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Early Warning Banner Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <div
              key={w.id}
              className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 text-red-300 rounded border border-red-500/40">
                    ⚠️ {w.warningLevel} EARLY WARNING
                  </span>
                  <span className="text-slate-300 font-medium">{w.geographicScopeName}</span>
                </div>
                <p className="text-slate-300">{w.message}</p>
              </div>

              <div className="text-right whitespace-nowrap font-mono text-[11px] text-red-400 font-bold">
                {w.confidenceScore}% Confidence
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Predictive Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050B14] border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 space-y-3 shadow-md"
          >
            {/* Top Risk Score Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {p.type.replace('_', ' ')}
                </span>
                <h3 className="text-xs font-bold text-slate-100 mt-1">{p.title}</h3>
              </div>

              <div className="text-right">
                <div className="text-lg font-mono font-bold text-purple-400">{p.riskScore}</div>
                <div className="text-[10px] font-mono text-slate-400">Risk Score</div>
              </div>
            </div>

            <p className="text-xs text-slate-400">{p.description}</p>

            {/* Contributing Factors Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[11px] font-mono text-slate-400 font-semibold">Contributing Factors:</span>
              <div className="grid grid-cols-2 gap-2">
                {p.contributingFactors.map((f, i) => (
                  <div key={i} className="bg-[#0B1528] p-1.5 rounded border border-slate-800 text-[11px]">
                    <div className="flex justify-between font-mono text-slate-300">
                      <span>{f.name}</span>
                      <span className="font-bold text-purple-300">{f.weightPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Recommended Actions */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-2.5 space-y-1 text-xs">
              <span className="text-[11px] font-mono font-bold text-purple-300">💡 Recommended Preventive Actions:</span>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                {p.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
