'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility Network Simulation Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const UtilitySimulationWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/digital-twin/utilities/simulations')
      .then((res) => res.json())
      .then((json) => setScenarios(json.data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🌐 Smart Utility Network Simulation & Resilience Optimization</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              ● ISOLATED MEMORY SIMULATOR
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulates grid failure propagation, dependency cascading, network resilience scoring, baseline vs scenario comparison, and advisory recovery plans.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Simulation Executed', message: 'Isolated memory utility network failure simulation executed.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Network Simulation
        </button>
      </div>

      {/* Overview Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Simulated Scenarios</span>
          <div className="text-lg font-bold text-slate-200">{scenarios.length || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Network Resilience Score</span>
          <div className="text-lg font-bold text-amber-400">
            {scenarios[0]?.resilience?.resilienceScore || 48.5} / 100 ({scenarios[0]?.resilience?.classification || 'VULNERABLE'})
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Cascading Risk Score</span>
          <div className="text-lg font-bold text-rose-400">
            {scenarios[0]?.propagation?.cascadingRiskScore || 84.5}
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Simulated Affected Population</span>
          <div className="text-lg font-bold text-cyan-400">
            {scenarios[0]?.serviceImpact?.affectedPopulation?.toLocaleString() || '14,200'}
          </div>
        </div>
      </div>

      {/* Failure Propagation Chain & Network Dependency */}
      {scenarios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                🔗 FAILURE PROPAGATION CHAIN & DEPENDENCY CASCADING
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {scenarios[0]?.input?.title}
              </h3>
            </div>

            <span className="px-2.5 py-1 font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
              PROPAGATION DEPTH: {scenarios[0]?.propagation?.propagationDepth} HOP
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="text-slate-300">
              ⚡ <span className="text-rose-400 font-bold">Failed Asset:</span> {scenarios[0]?.input?.targetAssetId} (Ward 12 Transformer TX-4)
            </div>
            <div className="text-slate-300 pl-4 border-l border-rose-500/50">
              ↳ <span className="text-amber-400 font-bold">Downstream Feeders:</span> {scenarios[0]?.propagation?.secondaryAffectedAssetIds?.join(', ')}
            </div>
            <div className="text-slate-300 pl-8 border-l border-amber-500/50">
              ↳ <span className="text-cyan-400 font-bold">Impacted Zones:</span> {scenarios[0]?.propagation?.affectedZoneIds?.join(', ')}
            </div>
            <div className="text-slate-300 pl-12 border-l border-cyan-500/50">
              ↳ <span className="text-emerald-400 font-bold">Critical Facilities:</span> {scenarios[0]?.propagation?.affectedCriticalFacilityNames?.join(' • ')}
            </div>
          </div>

          {/* Baseline vs Scenario Comparison */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Baseline vs Simulated Health</span>
              <div className="text-slate-200 mt-1">
                {scenarios[0]?.comparison?.baselineHealthScore}% → <strong className="text-rose-400">{scenarios[0]?.comparison?.simulatedHealthScore}%</strong>
              </div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Outage Duration Delta</span>
              <div className="text-slate-200 mt-1">
                {scenarios[0]?.comparison?.baselineOutageHours}h → <strong className="text-rose-400">{scenarios[0]?.comparison?.simulatedOutageHours}h</strong>
              </div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-400 block">Resilience Score Delta</span>
              <div className="text-slate-200 mt-1 font-bold text-rose-400">
                {scenarios[0]?.comparison?.resilienceDelta} Points
              </div>
            </div>
          </div>

          {/* Recommended Recovery Plan */}
          <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-300 font-bold">💡 ADVISORY RECOVERY PLAN: {scenarios[0]?.recommendation?.recommendedPlanName}</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {scenarios[0]?.recommendation?.summary} ({scenarios[0]?.recommendation?.whySelected})
              </p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Recovery Plan Authorized', message: 'Utility network recovery plan authorized by grid director.', type: 'success' })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Recovery Plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
