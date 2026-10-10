'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Operational Analytics & Performance Panel
// Time-based Metrics, SLA Compliance Rates, & Workload Distribution
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OperationalAnalyticsDto } from '../../lib/server/services/command-center-analytics.service';

export const OperationalAnalyticsPanel: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'TODAY' | '7_DAYS' | '30_DAYS'>('7_DAYS');
  const [data, setData] = useState<OperationalAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/command-center/analytics?timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [timeframe]);

  if (loading || !data) {
    return (
      <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-6 shadow-xl animate-pulse flex items-center justify-center text-slate-400 text-xs">
        <span>Loading Operational Analytics...</span>
      </div>
    );
  }

  return (
    <section aria-label="Operational Analytics Panel" className="bg-[#0B1528] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5 text-xs">
      {/* Panel Header & Timeframe Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>📊 Operational Analytics & Performance Metrics</span>
          </h2>
          <p className="text-[11px] text-slate-400">SLA compliance, workload distribution & AI detection volume</p>
        </div>

        <div className="flex items-center gap-1 bg-[#050B14] p-1 border border-slate-800 rounded-lg" role="radiogroup" aria-label="Analytics Timeframe">
          {[
            { key: 'TODAY', label: 'Today' },
            { key: '7_DAYS', label: '7 Days' },
            { key: '30_DAYS', label: '30 Days' },
          ].map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key as any)}
              className={`px-3 py-1 font-mono text-[11px] rounded transition ${
                timeframe === tf.key ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wide">SLA Compliance Rate</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{data.slaComplianceRate}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${data.slaComplianceRate}%` }} />
          </div>
        </div>

        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Avg Ack Time</span>
          <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{data.averageAckTimeMinutes} mins</span>
          <span className="text-[10px] text-slate-500 block mt-1">Target: &lt; 15 mins</span>
        </div>

        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Avg Response Time</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{data.averageResponseTimeMinutes} mins</span>
          <span className="text-[10px] text-slate-500 block mt-1">Target: &lt; 30 mins</span>
        </div>

        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Resolution Rate</span>
          <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">{data.resolutionRate}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">Escalation: {data.escalationRate}%</span>
        </div>
      </div>

      {/* Grid: Severity Distribution & Department Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Severity Breakdown */}
        <div className="p-4 bg-[#050B14] border border-slate-800 rounded-lg space-y-3">
          <h3 className="font-bold text-slate-200 text-xs">Incident Severity Distribution</h3>
          <div className="space-y-2">
            {data.incidentsBySeverity.map((item) => (
              <div key={item.severity} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-300 font-bold">{item.severity}</span>
                  <span className="font-mono text-slate-400">{item.count} cases ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      item.severity === 'CRITICAL'
                        ? 'bg-red-500'
                        : item.severity === 'HIGH'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Workload Table */}
        <div className="p-4 bg-[#050B14] border border-slate-800 rounded-lg space-y-3">
          <h3 className="font-bold text-slate-200 text-xs">Department Workload Distribution</h3>
          <div className="space-y-2">
            {data.incidentsByDepartment.map((dept) => (
              <div key={dept.departmentName} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-200 block">{dept.departmentName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Active Dispatches: {dept.activeDispatches}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  {dept.count} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
