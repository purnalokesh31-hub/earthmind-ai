'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Urban Digital Twin Command Center Workspace
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InfrastructureAssetEntity, DigitalTwinOverviewDto } from '../../lib/server/domain/digital-twin/digital-twin.domain';

export const DigitalTwinWorkspace: React.FC = () => {
  const [overview, setOverview] = useState<DigitalTwinOverviewDto | null>(null);
  const [assets, setAssets] = useState<InfrastructureAssetEntity[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAssetEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchTwinData(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchTwinData = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const [ovRes, astRes] = await Promise.all([
        fetch('/api/v1/digital-twin?cityId=city-vja', { signal }),
        fetch('/api/v1/digital-twin/assets?cityId=city-vja', { signal }),
      ]);

      const ovData = await ovRes.json();
      const astData = await astRes.json();

      if (!signal?.aborted) {
        if (ovData.data) setOverview(ovData.data);
        if (astData.data) setAssets(astData.data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🏙️ Urban Digital Twin Infrastructure Command Center</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              ● REAL-TIME TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Continuously updated digital representation of Vijayawada municipal assets & sensor telemetry.
          </p>
        </div>

        <button
          onClick={() => fetchTwinData()}
          className="px-3 py-1.5 font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
        >
          🔄 Refresh Telemetry
        </button>
      </div>

      {/* Metric Cards Overview */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#050B14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">Total Infrastructure Assets</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">{overview.totalAssetsCount}</div>
            <span className="text-[10px] text-slate-400">Across 12 Municipal Zones</span>
          </div>

          <div className="bg-[#050B14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-emerald-400">Operational Assets</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{overview.operationalAssetsCount}</div>
            <span className="text-[10px] text-slate-400">Healthy Telemetry</span>
          </div>

          <div className="bg-[#050B14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-amber-400">Degraded / Repair Due</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">{overview.degradedAssetsCount}</div>
            <span className="text-[10px] text-slate-400">Condition Score &lt; 70%</span>
          </div>

          <div className="bg-[#050B14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-rose-400">Critical Hazards</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">{overview.criticalAssetsCount}</div>
            <span className="text-[10px] text-slate-400">Linked P1 Incidents</span>
          </div>
        </div>
      )}

      {/* Infrastructure Asset Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
          Infrastructure Asset Registry & Condition Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <th className="p-3">Asset ID / Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((ast) => (
                <tr key={ast.assetId} className="hover:bg-slate-900/40 transition text-slate-200">
                  <td className="p-3">
                    <div className="font-bold text-slate-100">{ast.name}</div>
                    <div className="font-mono text-[10px] text-cyan-400">{ast.assetId}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{ast.assetType}</td>
                  <td className="p-3 text-slate-300 text-[11px]">{ast.locationName}</td>
                  <td className="p-3 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        ast.operationalStatus === 'OPERATIONAL'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ast.operationalStatus === 'DEGRADED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {ast.operationalStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">{ast.conditionScore}%</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{ast.riskScore}/100</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedAsset(ast)}
                      className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-mono"
                    >
                      Inspect Twin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Drawer Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1528] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{selectedAsset.name}</h3>
                <span className="font-mono text-[10px] text-cyan-400">{selectedAsset.assetId} ● {selectedAsset.assetType}</span>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-100 text-lg">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="bg-[#050B14] p-3 rounded border border-slate-800">
                <span className="text-slate-400">Department:</span>
                <div className="text-slate-200 font-bold mt-0.5">{selectedAsset.responsibleDepartment}</div>
              </div>
              <div className="bg-[#050B14] p-3 rounded border border-slate-800">
                <span className="text-slate-400">Maintenance Status:</span>
                <div className="text-amber-300 font-bold mt-0.5">{selectedAsset.maintenanceStatus}</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-1">
              <span className="font-mono text-cyan-400 font-bold text-[11px]">📡 Sensor Telemetry Readings:</span>
              <p className="text-[11px] text-slate-300">Water Level Sensor (sns-wtr-101): 4.8m (Warning Threshold: 4.5m)</p>
            </div>

            <button
              onClick={() => setSelectedAsset(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs"
            >
              Close Asset Inspector
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
