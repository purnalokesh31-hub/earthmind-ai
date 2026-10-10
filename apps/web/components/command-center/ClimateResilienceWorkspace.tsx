'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Climate Resilience Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const ClimateResilienceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [hazardType, setHazardType] = useState<string>('FLOOD');
  const [intensity, setIntensity] = useState<string>('SEVERE');
  const [horizon, setHorizon] = useState<string>('NEXT_30_DAYS');
  const [resilienceData, setResilienceData] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/digital-twin/climate', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!controller.signal.aborted) setResilienceData(json.data);
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
            <span>🌍 Climate Resilience & Infrastructure Adaptation Platform</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              ● SIMULATION PROVIDER
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Assesses multi-hazard climate exposure, infrastructure vulnerabilities, impact propagation chains, and advisory adaptation priorities.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Simulation Initiated', message: 'Climate hazard scenario simulation initiated.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Hazard Scenario
        </button>
      </div>

      {/* Hazard Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Rainfall Intensity</span>
          <div className="text-lg font-bold text-cyan-400">84.5 mm/h</div>
          <span className="text-[9px] text-slate-500">SIMULATION DATA</span>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Temp Anomaly</span>
          <div className="text-lg font-bold text-amber-400">+3.2 °C</div>
          <span className="text-[9px] text-slate-500">SIMULATION DATA</span>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Wind Intensity</span>
          <div className="text-lg font-bold text-slate-200">68 km/h</div>
          <span className="text-[9px] text-slate-500">SIMULATION DATA</span>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Flood Risk Index</span>
          <div className="text-lg font-bold text-rose-400">88.0 %</div>
          <span className="text-[9px] text-slate-500">SIMULATION DATA</span>
        </div>
      </div>

      {/* Scenario Builder Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Climate Hazard Type</label>
          <select
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-cyan-500"
          >
            <option value="FLOOD">Monsoon Hydro-Surge Flood</option>
            <option value="EXTREME_HEAT">Extreme Heatwave & Grid Load</option>
            <option value="CYCLONE">Severe Tropical Cyclone & Wind</option>
            <option value="MULTI_HAZARD">Multi-Hazard Cascading Failure</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Intensity Level</label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-cyan-500"
          >
            <option value="SEVERE">Severe (50-Year Event)</option>
            <option value="EXTREME">Extreme (100-Year Historic Event)</option>
            <option value="HISTORIC_MAX">Historic Max Stress</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Scenario Time Horizon</label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-cyan-500"
          >
            <option value="NEXT_24_HOURS">Next 24 Hours</option>
            <option value="NEXT_7_DAYS">Next 7 Days</option>
            <option value="NEXT_30_DAYS">Next 30 Days</option>
            <option value="NEXT_5_YEARS">Next 5 Years (Medium Term)</option>
          </select>
        </div>
      </div>

      {/* Resilience Overview Card */}
      {resilienceData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="font-mono text-[10px] text-cyan-400 font-bold">
                MUNICIPAL RESILIENCE METRIC — {resilienceData.cityId}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                City Composite Climate Resilience Index
              </h3>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-amber-400 uppercase font-bold">
                {resilienceData.resilienceScore.resilienceCategory}
              </span>
              <div className="text-xl font-bold text-amber-400">
                {resilienceData.resilienceScore.overallResilienceScore} / 100
              </div>
            </div>
          </div>

          {/* Adaptation Advisory Card */}
          <div className="bg-cyan-950/20 border border-cyan-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">💡 ADVISORY ADAPTATION RECOMMENDATION</span>
              <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                {resilienceData.recommendedAdaptations[0]?.title}
              </h4>
              <p className="text-[11px] text-slate-300">
                {resilienceData.recommendedAdaptations[0]?.description} (Est. Cost: ₹
                {resilienceData.recommendedAdaptations[0]?.estimatedCostInr.toLocaleString()})
              </p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Adaptation Plan Approved', message: 'Adaptation plan approved for human capital investment authorization.', type: 'success' })}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Adaptation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
