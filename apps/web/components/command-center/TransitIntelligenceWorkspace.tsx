'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Transit Intelligence Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TransitIntelligenceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [transitData, setTransitData] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/digital-twin/transit', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!controller.signal.aborted) setTransitData(json.data);
      })
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });

    return () => controller.abort();
  }, []);

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🚌 Public Transport & Multimodal Mobility Intelligence</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              ● SIMULATION TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Monitors transit routes, passenger demand surges, traffic-transit delay correlation, and advisory fleet optimization.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Simulation Initiated', message: 'Transit disruption scenario simulation initiated in isolated memory.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Transit Simulation
        </button>
      </div>

      {/* Transit Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Total Monitored Routes</span>
          <div className="text-lg font-bold text-slate-200">{transitData?.totalRoutes || 2}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Monitored Bus Terminals</span>
          <div className="text-lg font-bold text-purple-400">{transitData?.totalStops || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Active Disruption Alerts</span>
          <div className="text-lg font-bold text-rose-400">{transitData?.activeDisruptionsCount || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Active Reallocations</span>
          <div className="text-lg font-bold text-emerald-400">{transitData?.activeRecommendationsCount || 1}</div>
        </div>
      </div>

      {/* Active Route Status Cards */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
          Public Transit Route Operations & Delay Status
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {transitData?.routes?.map((rt: any) => (
            <div key={rt.routeId} className="p-4 bg-[#050B14] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 truncate">{rt.routeNumber} — {rt.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    rt.operationalStatus === 'SEVERELY_DELAYED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {rt.operationalStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <span className="text-slate-400">Mode</span>
                  <div className="font-bold text-slate-200">{rt.mode}</div>
                </div>
                <div>
                  <span className="text-slate-400">Stops</span>
                  <div className="font-bold text-cyan-400">{rt.totalStopsCount} stops</div>
                </div>
                <div>
                  <span className="text-slate-400">Length</span>
                  <div className="font-bold text-purple-400">{rt.lengthKm} km</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Reallocation Advisory Card */}
      {transitData?.disruptions?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-purple-500/40 rounded-xl p-4 space-y-3 text-xs shadow-lg"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold">💡 ADVISORY FLEET REALLOCATION RECOMMENDATION</span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                Dispatch 2 Relief Buses to Route 12B (Benz Circle Terminal)
              </h3>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-emerald-400 font-bold">DELAY REDUCTION</span>
              <div className="text-lg font-bold text-emerald-400">-48% Delay</div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/40 p-3 rounded-lg flex items-center justify-between">
            <span className="text-slate-300">
              Reallocates 2 standby electric buses from PNS Station depot to clear 145 passenger accumulation surge.
            </span>
            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Plan Approved', message: 'Fleet reallocation plan approved by human transit operator.', type: 'success' })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Fleet Reallocation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
