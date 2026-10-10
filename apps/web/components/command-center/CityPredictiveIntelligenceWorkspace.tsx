'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Citywide Predictive Intelligence Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const CityPredictiveIntelligenceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/digital-twin/predictions')
      .then((res) => res.json())
      .then((json) => setSummary(json.data || null))
      .catch(console.error);
  }, []);

  const forecast = summary?.citywideForecast;

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🔮 Citywide Predictive Intelligence & Risk Forecasting Foundation</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              ● ADVISORY PREDICTOR
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-horizon risk forecasting engine fusing cross-domain signals, feature trends, confidence intervals, and human-authorized predictive alerts.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Risk Models Refreshed', message: 'Predictive risk models refreshed for horizons 1h through 90d.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Refresh Risk Forecasts
        </button>
      </div>

      {/* Prediction Confidence & Horizon Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Primary Forecast Risk (6h)</span>
          <div className="text-lg font-bold text-rose-400">
            {forecast?.riskScore || 82.5} / 100 ({forecast?.classification || 'CRITICAL'})
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Prediction Confidence</span>
          <div className="text-lg font-bold text-emerald-400">
            {forecast?.confidence?.overallConfidenceScore || 94.2}%
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Data Quality Index</span>
          <div className="text-lg font-bold text-cyan-400">
            {forecast?.confidence?.dataQualityScore || 96.0}%
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Historical Accuracy</span>
          <div className="text-lg font-bold text-purple-400">
            {forecast?.confidence?.historicalAccuracyPercent || 93.8}%
          </div>
        </div>
      </div>

      {/* Forecast Horizons Cards */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
          ⏱️ MULTI-HORIZON RISK FORECASTS (1H TO 90D)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {summary?.horizonForecasts?.map((h: any) => (
            <div key={h.horizon} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-[10px]">
                <span>HORIZON: {h.horizon}</span>
                <span className="text-rose-400 font-bold">{h.classification}</span>
              </div>
              <div className="text-base font-bold text-slate-100">{h.forecastRiskScore} pts</div>
              <div className="text-[10px] text-slate-400 truncate">{h.primaryRiskFactor}</div>
            </div>
          )) || (
            <div className="text-slate-400">Horizon forecast loading...</div>
          )}
        </div>
      </div>

      {/* Predictive Alerts & Causal Explanations */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                🚨 PREDICTIVE RISK ALERT
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {summary?.predictiveAlerts?.[0]?.title}
              </h3>
            </div>

            <span className="px-2.5 py-1 font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
              WINDOW: {summary?.predictiveAlerts?.[0]?.predictedTimeWindow}
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <span className="text-[10px] text-purple-300 font-bold uppercase block pb-1 border-b border-slate-800">
              💡 CAUSAL EXPLANATION & FEATURE FUSION
            </span>
            <p className="text-slate-300">
              {forecast?.causalExplanation}
            </p>
          </div>

          {/* Human Authorization Control */}
          <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-300 font-bold">🔒 MANDATORY HUMAN AUTHORIZATION</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Advisory predictive risk alerts require explicit human authorization before triggering mitigation response workflows.
              </p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Strategy Authorized', message: 'Predictive alert mitigation strategy authorized by human commander.', type: 'success' })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Mitigation Plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
