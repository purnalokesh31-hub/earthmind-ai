'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 City Decision Intelligence Workspace
// Enterprise Command Center Workspace
// Mandatory Human Governance (Approve / Reject / Defer)
// Zero Autonomous Physical Execution
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Loader2 } from 'lucide-react';

export function CityDecisionIntelligenceWorkspace() {
  const { addToast } = useAppStore();
  const [selectedObjective, setSelectedObjective] = useState<string>('BALANCED');
  const [authorizationState, setAuthorizationState] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW'>('PENDING');
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVIEW') => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/digital-twin/decisions/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineExecutionId: 'pipe-exec-101',
          decision: status,
          strategyId: selectedObjective,
          reason: operatorNotes || `Human operator recorded action '${status}'`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        const confirmed = json.data?.approvalStatus || status;
        setAuthorizationState(confirmed);
        addToast({
          title: `Decision ${confirmed}`,
          message: `Operational decision successfully recorded: ${confirmed}`,
          type: confirmed === 'APPROVED' ? 'success' : confirmed === 'REJECTED' ? 'warning' : 'info',
        });
      } else {
        const errorMsg = json.error || `Server rejected request with status ${res.status}`;
        addToast({
          title: 'Authorization Rejected',
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Network Error',
        message: err.message || 'Failed to submit decision authorization.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 bg-slate-950 text-slate-100 min-h-screen border border-slate-800 rounded-xl" role="region" aria-label="City Decision Intelligence Workspace">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>CITY DECISION INTELLIGENCE</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              PHASE 7.10 FUSION
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-Domain Signal Fusion & Constraint-Aware Multi-Objective Decision Support
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SIGNAL FUSION ACTIVE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HUMAN AUTHORIZATION REQUIRED
          </span>
        </div>
      </div>

      {/* Decision Context Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">City Risk Level</span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">78.5 / 100</div>
          <span className="text-[10px] text-rose-400/80">CRITICAL URBAN RISK</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Incidents</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">5 High Severity</div>
          <span className="text-[10px] text-slate-400">Ward 12 & Benz Circle</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Affected Population</span>
          <div className="text-2xl font-mono font-bold text-white mt-1">34,200</div>
          <span className="text-[10px] text-slate-400">Exposed Citizens</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Critical Services</span>
          <div className="text-2xl font-mono font-bold text-sky-400 mt-1">Substation 4B</div>
          <span className="text-[10px] text-sky-400/80">Inundation Exposure</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Optimization Profile</span>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-2 uppercase">{selectedObjective}</div>
          <span className="text-[10px] text-slate-400">6 Weighted Dimensions</span>
        </div>
      </div>

      {/* Signal Fusion Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Multi-Domain Fused Intelligence Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            { domain: 'CLIMATE', title: 'Underpass Flood Warning', sev: 'CRITICAL', conf: '94%', src: 'SIMULATION' },
            { domain: 'UTILITY', title: 'Substation 4B Inundation', sev: 'CRITICAL', conf: '96.5%', src: 'LIVE' },
            { domain: 'MOBILITY', title: 'Benz Circle Bottleneck', sev: 'HIGH', conf: '91%', src: 'LIVE' },
            { domain: 'TRANSIT', title: 'BRT Line 3 Delay', sev: 'MODERATE', conf: '88%', src: 'HISTORICAL' },
            { domain: 'EMERGENCY', title: 'Ambulance SLA Risk', sev: 'HIGH', conf: '95%', src: 'SIMULATION' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-sky-400 font-bold">{s.domain}</span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{s.src}</span>
              </div>
              <p className="font-semibold text-white text-xs">{s.title}</p>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span className={s.sev === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-amber-400'}>{s.sev}</span>
                <span>CONF: {s.conf}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Decision Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidates & Multi-Objective Profiles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidates Comparison Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Generated Decision Candidates</h2>
              <span className="text-[10px] font-mono text-slate-400">RANKED BY MULTI-OBJECTIVE UTILITY</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">RANK</th>
                    <th className="pb-2">STRATEGY</th>
                    <th className="pb-2">TARGET DOMAINS</th>
                    <th className="pb-2">EST. COST</th>
                    <th className="pb-2">POP. BENEFIT</th>
                    <th className="pb-2">UTILITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { rank: '#1', name: 'Option Beta (Recommended)', domain: 'Utility & Transit', cost: '$18,500', pop: '34,200', util: '0.941', rec: true },
                    { rank: '#2', name: 'Option Alpha (Aggressive)', domain: 'Mobility & Utility', cost: '$42,000', pop: '38,000', util: '0.884', rec: false },
                    { rank: '#3', name: 'Option Gamma (Conservative)', domain: 'Transit & Drainage', cost: '$6,200', pop: '19,500', util: '0.762', rec: false },
                  ].map((c, i) => (
                    <tr key={i} className={c.rec ? 'bg-emerald-500/10' : ''}>
                      <td className="py-2.5 font-bold">{c.rank}</td>
                      <td className="py-2.5 text-white font-semibold">{c.name}</td>
                      <td className="py-2.5 text-slate-300">{c.domain}</td>
                      <td className="py-2.5">{c.cost}</td>
                      <td className="py-2.5">{c.pop}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">{c.util}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade-Off Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Multi-Objective Trade-off Matrix</h2>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">RISK MITIGATION</span>
                <div className="text-lg font-mono font-bold text-emerald-400">92.4%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[92.4%]" />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">RESOURCE EFFICIENCY</span>
                <div className="text-lg font-mono font-bold text-sky-400">86.0%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full w-[86%]" />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">RECOVERY ACCELERATION</span>
                <div className="text-lg font-mono font-bold text-amber-400">79.5%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[79.5%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Plan Detail & Authorization Gateway */}
        <div className="space-y-6">
          {/* Recommendation Detail Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-emerald-400 uppercase">Recommended Strategy</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">UTILITY 0.941</span>
            </div>

            <h3 className="text-sm font-bold text-white">Controlled Substation 4B Vault Isolation & Heavy Pump Staging</h3>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block font-mono">ACTION SUMMARY:</span>
                <p className="text-slate-200 mt-0.5">
                  Isolate underground electrical vault 4B, transfer critical feeder load to Substation 2 East via automated inter-tie, and stage high-capacity mobile dewatering pump at Underpass 2.
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-mono">WHY NOW:</span>
                <p className="text-slate-200 mt-0.5">
                  Substation 4B vault thermal degradation (98.4°C) requires immediate isolation before submerged short circuit causes catastrophic transformer damage.
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Human Authorization Control Panel */}
          <div className="bg-slate-900 border border-rose-500/40 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-rose-400">MANDATORY HUMAN AUTHORIZATION</h3>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded">STATUS: {authorizationState}</span>
            </div>

            <p className="text-[11px] text-slate-400">
              The system is purely advisory. Authorized operator decision must be explicitly recorded before action state transition.
            </p>

            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Operator authorization notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              rows={2}
            />

            <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold">
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('APPROVED')}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                APPROVE
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('REJECTED')}
                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-2 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                REJECT
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('REQUESTED_REVIEW')}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 py-2 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                REQUEST REVIEW
              </button>
            </div>
          </div>

          {/* Audit Trail Panel */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Chronological Decision Audit Trail</span>
            <div className="space-y-1 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between"><span>DECISION_CREATED</span><span>10:14:02 AM</span></div>
              <div className="flex justify-between text-sky-400"><span>SIGNALS_FUSED (5)</span><span>10:14:03 AM</span></div>
              <div className="flex justify-between text-emerald-400"><span>RECOMMENDATION_GENERATED</span><span>10:14:05 AM</span></div>
              {authorizationState !== 'PENDING' && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>DECISION_{authorizationState}</span><span>NOW</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
