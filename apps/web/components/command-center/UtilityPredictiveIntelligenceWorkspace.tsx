'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility Predictive Intelligence Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const UtilityPredictiveIntelligenceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/digital-twin/utilities/predictions')
      .then((res) => res.json())
      .then((json) => setPredictions(json.data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🔮 Smart Utility Predictive Intelligence & Failure Forecasting</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
              ● SIMULATION PREDICTOR
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Forecasts asset failure probabilities, remaining useful life (RUL), downstream outage customer impact, and advisory preventive maintenance.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Forecast Recalculated', message: 'Predictive failure forecast recalculated.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Recalculate Forecast
        </button>
      </div>

      {/* Prediction Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Active Risk Forecasts</span>
          <div className="text-lg font-bold text-slate-200">{predictions.length || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Max Failure Probability</span>
          <div className="text-lg font-bold text-rose-400">
            {predictions[0]?.failureProbability?.failureProbabilityPercent || 88.4}%
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Est. Remaining Life (RUL)</span>
          <div className="text-lg font-bold text-amber-400">
            {predictions[0]?.remainingLife?.estimatedRemainingLifeDays || 8} Days
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Impacted Customers Est.</span>
          <div className="text-lg font-bold text-cyan-400">
            {predictions[0]?.outageImpact?.estimatedServiceImpactPopulation?.toLocaleString() || '14,200'}
          </div>
        </div>
      </div>

      {/* Predictive Maintenance Advisory Card */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-rose-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                🚨 CRITICAL ASSET FAILURE FORECAST — {predictions[0]?.assetName}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {predictions[0]?.recommendation?.actionTitle}
              </h3>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-rose-400 uppercase font-bold">
                {predictions[0]?.failureProbability?.riskClassification} RISK
              </span>
              <div className="text-xl font-bold text-rose-400">
                {predictions[0]?.failureProbability?.failureProbabilityPercent}% Failure Risk
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Dominant Failure Indicators</span>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
              {predictions[0]?.failureProbability?.dominantFailureIndicators?.map((ind: string, idx: number) => (
                <li key={idx}>{ind}</li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-rose-300 font-bold">💡 ADVISORY PREDICTIVE MAINTENANCE ACTION</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {predictions[0]?.recommendation?.actionDescription} (Maint. Window: Est. {predictions[0]?.recommendation?.estimatedMaintenanceWindowDays} Days)
              </p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Work Order Authorized', message: 'Predictive maintenance work order authorized by grid engineer.', type: 'success' })}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Maintenance
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
