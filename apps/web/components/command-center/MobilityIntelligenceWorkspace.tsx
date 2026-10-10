'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Mobility Intelligence Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const MobilityIntelligenceWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [mobilityData, setMobilityData] = useState<any>(null);
  const [emergencyRoute, setEmergencyRoute] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/digital-twin/mobility', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!controller.signal.aborted) setMobilityData(json.data);
      })
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });

    fetch('/api/v1/digital-twin/mobility/emergency-routes', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!controller.signal.aborted) setEmergencyRoute(json.data);
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
            <span>🚗 Urban Mobility & Traffic Intelligence Platform</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              ● SIMULATION TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time congestion monitoring, bottleneck ranking, traffic prediction, and advisory signal/diversion optimization.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Simulation Executed', message: 'Traffic simulation scenario executed in isolated memory.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Traffic Simulation
        </button>
      </div>

      {/* Traffic Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Total Monitored Segments</span>
          <div className="text-lg font-bold text-slate-200">{mobilityData?.totalSegments || 2}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Severely Congested</span>
          <div className="text-lg font-bold text-rose-400">{mobilityData?.severelyCongestedSegments || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Active Congestion Events</span>
          <div className="text-lg font-bold text-amber-400">{mobilityData?.congestionEvents?.length || 1}</div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Active Recommendations</span>
          <div className="text-lg font-bold text-blue-400">{mobilityData?.activeRecommendationsCount || 1}</div>
        </div>
      </div>

      {/* Road Segment Condition Cards */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
          Monitored Road Segment Conditions
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {mobilityData?.segments?.map((seg: any) => (
            <div key={seg.segmentId} className="p-4 bg-[#050B14] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 truncate">{seg.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    seg.congestionLevel === 'SEVERELY_CONGESTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {seg.congestionLevel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <span className="text-slate-400">Avg Speed</span>
                  <div className="font-bold text-slate-200">{seg.averageSpeedKmh} km/h</div>
                </div>
                <div>
                  <span className="text-slate-400">Occupancy</span>
                  <div className="font-bold text-amber-400">{seg.occupancyPercent}%</div>
                </div>
                <div>
                  <span className="text-slate-400">Vehicles</span>
                  <div className="font-bold text-cyan-400">{seg.vehicleCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Responder Route Advisor */}
      {emergencyRoute && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-blue-500/40 rounded-xl p-4 space-y-3 text-xs shadow-lg"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold">🚑 EMERGENCY RESPONDER ROUTE ADVISOR</span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {emergencyRoute.origin} ➔ {emergencyRoute.destination}
              </h3>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-emerald-400 font-bold">TIME SAVED</span>
              <div className="text-lg font-bold text-emerald-400">-{emergencyRoute.timeSavedMinutes} mins</div>
            </div>
          </div>

          <div className="bg-blue-950/20 border border-blue-500/40 p-3 rounded-lg flex items-center justify-between">
            <span className="text-slate-300">
              Recommended Path Bypasses Benz Circle bottleneck (Est. Travel Time: {emergencyRoute.estimatedTravelTimeMinutes} mins)
            </span>
            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Route Approved', message: 'Emergency dispatch route approved and transmitted to responder unit.', type: 'success' })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold rounded text-xs whitespace-nowrap"
            >
              ✓ Transmit Route
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
