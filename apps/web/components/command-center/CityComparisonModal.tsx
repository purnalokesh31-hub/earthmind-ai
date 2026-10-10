'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-City Comparison Modal Component
// Side-by-side Comparative Analytics for Regional Command
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CityComparisonItem {
  cityId: string;
  cityName: string;
  incidents: number;
  criticalIncidents: number;
  averageResponseTimeMinutes: number;
  slaComplianceRate: number;
  dispatchWorkload: number;
  aiDetections: number;
  resolvedIncidents: number;
  riskScore: number;
}

interface CityComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityComparisonModal: React.FC<CityComparisonModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<CityComparisonItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/v1/regional/compare')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0B1528] border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📊 Multi-City Regional Comparison Matrix</span>
            </h2>
            <p className="text-xs text-slate-400">Side-by-side workload, SLA compliance, & risk performance across municipal sectors</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg">
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050B14] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Metric Dimension</th>
                {data.map((c) => (
                  <th key={c.cityId} className="py-2.5 px-3 text-cyan-400 font-bold">
                    {c.cityName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Active Incidents</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono font-bold text-slate-100">
                    {c.incidents}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Critical P1 Hazards</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono font-bold text-red-400">
                    {c.criticalIncidents}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">SLA Compliance Rate</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    {c.slaComplianceRate}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Avg Response Time</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono text-amber-300">
                    {c.averageResponseTimeMinutes} mins
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Dispatch Workload Index</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                    {c.dispatchWorkload}/100
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Regional Risk Score</td>
                {data.map((c) => (
                  <td key={c.cityId} className="py-2.5 px-3 font-mono font-bold text-purple-400">
                    {c.riskScore}/100
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs"
          >
            Close Matrix
          </button>
        </div>
      </motion.div>
    </div>
  );
};
