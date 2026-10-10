'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility Intelligence Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const UtilityIntelligenceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [utilityData, setUtilityData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/digital-twin/utilities')
      .then((res) => res.json())
      .then((json) => setUtilityData(json.data))
      .catch(console.error);

    fetch('/api/v1/digital-twin/utilities/events')
      .then((res) => res.json())
      .then((json) => setEvents(json.data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚡ Smart Utility Infrastructure Digital Twin Platform</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              ● SIMULATION TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Monitors power substations, distribution transformers, water pump stations, pipelines, and utility sector health.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Diagnostic Completed', message: 'Utility health evaluation & telemetry diagnostic completed.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Grid Diagnostics
        </button>
      </div>

      {/* Grid Health Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Electricity Grid Health</span>
          <div className="text-lg font-bold text-amber-400">
            {utilityData?.electricityHealthScore || 55}%
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Water Network Health</span>
          <div className="text-lg font-bold text-cyan-400">
            {utilityData?.waterHealthScore || 65}%
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Critical Assets</span>
          <div className="text-lg font-bold text-rose-400">
            {utilityData?.criticalAssetsCount || 2}
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Offline Assets</span>
          <div className="text-lg font-bold text-slate-400">
            {utilityData?.offlineAssetsCount || 0}
          </div>
        </div>
      </div>

      {/* Recent Utility Event Anomaly Alert */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-rose-500/40 rounded-xl p-4 space-y-2 text-xs shadow-lg"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
              ⚠️ CRITICAL UTILITY TELEMETRY ANOMALY DETECTED
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {events[0]?.timestamp}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-100">{events[0]?.assetName}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{events[0]?.description}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
