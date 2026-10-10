'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Loader2 } from 'lucide-react';

export function CityOperationalIntelligenceWorkspace() {
  const { addToast } = useAppStore();
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [decisionState, setDecisionState] = useState<'IDLE' | 'APPROVED' | 'REJECTED'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      const endpoint = decision === 'APPROVED' ? 'approve' : 'reject';
      const res = await fetch(`/api/v1/digital-twin/operational-intelligence/op-intel-01/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorNotes: `Human operator recorded decision '${decision}' for operational strategy.`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setDecisionState(decision);
        addToast({
          title: `Strategy ${decision}`,
          message: `Operational intelligence decision '${decision}' recorded in audit ledger.`,
          type: 'success',
        });
      } else {
        const errorMsg = json.error || `Server rejected decision with status ${res.status}`;
        addToast({
          title: 'Decision Rejected',
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Network Error',
        message: err.message || 'Failed to submit operational decision.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resilienceScore = 80;
  const classification = 'GUARDED';

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-sans space-y-6">
      {/* Header & Safety Badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Citywide Operational Intelligence Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Closed Operational Intelligence Loop: Prediction → Simulation → Decision → Readiness → Monitoring → Feedback
          </p>
        </div>

        {/* Mandatory Safety Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md">
            HUMAN AUTHORIZATION REQUIRED
          </span>
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md">
            ADVISORY ONLY
          </span>
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
            NO AUTONOMOUS EXECUTION
          </span>
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-md">
            PROVENANCE VERIFIED
          </span>
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
            AUDIT LOG ENABLED
          </span>
        </div>
      </div>

      {/* Time Window Selector */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historical Time Horizon:</span>
        <div className="flex gap-1.5">
          {(['1h', '6h', '24h', '7d', '30d', '90d'] as const).map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeWindow === tw
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tw.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION A: CITY RESILIENCE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            City Resilience Score
            <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
              {classification}
            </span>
          </h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white">{resilienceScore}</span>
            <span className="text-sm text-slate-400">/ 100 (Guarded Status)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${resilienceScore}%` }}></div>
          </div>
          <p className="text-xs text-slate-400">
            Resilience index aggregated across power, water, mobility, and stormwater drainage systems.
          </p>
        </div>

        {/* SECTION B: CLOSED-LOOP KPI SUMMARY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Closed-Loop Operational KPIs</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px]">Active Interventions</div>
              <div className="text-lg font-bold text-white mt-1">4 Plans</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px]">Human Approvals</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">100% Rate</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px]">Readiness Checks</div>
              <div className="text-lg font-bold text-blue-400 mt-1">94% Passed</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px]">Outcome Accuracy</div>
              <div className="text-lg font-bold text-purple-400 mt-1">87.5% Match</div>
            </div>
          </div>
        </div>

        {/* SECTION C: ACTIVE ESCALATIONS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            Operational Escalations
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full font-bold">1 Active</span>
          </h2>
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs space-y-1.5">
            <div className="font-semibold text-amber-300">Stormwater Drainage Delay</div>
            <div className="text-slate-400 text-[11px]">Sector 4 pump response deviated by +35 min from expected timeline.</div>
          </div>
        </div>
      </div>

      {/* Row 2: Expected vs Observed & Deviation Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION D: EXPECTED VS OBSERVED */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Expected vs Observed Outcome Comparison</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">Risk Reduction Points</div>
                <div className="text-slate-400 text-[11px]">Predicted: 31 points | Observed: 25 points</div>
              </div>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded font-mono text-xs font-bold">-6 Delta</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">Service Recovery Time</div>
                <div className="text-slate-400 text-[11px]">Predicted: 90 min | Observed: 125 min</div>
              </div>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded font-mono text-xs font-bold">+35 min</span>
            </div>
          </div>
        </div>

        {/* SECTION E: DEVIATION MONITOR & ESCALATION CENTER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex justify-between">
            Deviation & Escalation Monitor
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded font-bold">MODERATE DEVIATION</span>
          </h2>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="text-slate-300"><span className="text-slate-400 font-semibold">Recommended Role:</span> EMERGENCY_COMMANDER</div>
            <div className="text-slate-300"><span className="text-slate-400 font-semibold">Escalation Reason:</span> Substation 4B flood recovery time exceeded buffer by 35 minutes due to mobile generator unverified telemetry.</div>
          </div>

          {/* Authorization Actions */}
          <div className="pt-2 flex gap-3">
            <button
              disabled={decisionState !== 'IDLE' || isSubmitting}
              onClick={() => handleDecision('APPROVED')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                decisionState === 'APPROVED'
                  ? 'bg-emerald-600 text-white'
                  : decisionState === 'REJECTED'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {decisionState === 'APPROVED' ? '✓ STRATEGY AUTHORIZED' : 'AUTHORIZE STRATEGY'}
            </button>
            <button
              disabled={decisionState !== 'IDLE' || isSubmitting}
              onClick={() => handleDecision('REJECTED')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                decisionState === 'REJECTED'
                  ? 'bg-rose-600 text-white'
                  : decisionState === 'APPROVED'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {decisionState === 'REJECTED' ? '✕ STRATEGY REJECTED' : 'REJECT STRATEGY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
