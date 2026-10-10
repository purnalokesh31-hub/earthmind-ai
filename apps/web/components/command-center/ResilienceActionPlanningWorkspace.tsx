'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Resilience Action Planning Workspace
// Advisory Command Center Interface
// Mandatory Human Governance Controls
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export function ResilienceActionPlanningWorkspace() {
  const [selectedObjective, setSelectedObjective] = useState<string>('BALANCED');
  const [activeTab, setActiveTab] = useState<'candidates' | 'graph' | 'comparison' | 'timeline' | 'conflicts'>('comparison');

  return (
    <div className="flex flex-col space-y-6 p-6 bg-slate-950 text-slate-100 min-h-screen border border-slate-800 rounded-xl" role="region" aria-label="Resilience Action Planning Workspace">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>CITYWIDE RESILIENCE ACTION PLANNER</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              PHASE 7.10
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cross-Domain Dependency-Aware Resilience Planning & Action Prioritization Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ADVISORY PLANNING MODE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HUMAN AUTHORIZATION REQUIRED
          </span>
        </div>
      </div>

      {/* Resilience State Dashboard Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Overall Resilience</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-amber-400">48.5</span>
            <span className="text-xs text-emerald-400 font-mono">→ 82.0 (+33.5)</span>
          </div>
          <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1 inline-block">
            VULNERABLE STATE
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Population Exposure</span>
          <div className="text-2xl font-mono font-bold text-slate-100 mt-1">34,200</div>
          <span className="text-[10px] text-slate-400">Citizens in Ward 12 & Benz Circle</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Service Disruption</span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">72.5 / 100</div>
          <span className="text-[10px] text-rose-400/80">Power & Traffic Signal Risk</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Vulnerabilities</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">3 Critical</div>
          <span className="text-[10px] text-slate-400">Substation 4B & Underpass</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Cascade Vector</span>
          <div className="text-xs font-mono font-semibold text-sky-400 mt-2 truncate">
            CLIMATE → UTILITY → MOBILITY
          </div>
          <span className="text-[10px] text-slate-400">4 Cross-Domain Hops</span>
        </div>
      </div>

      {/* Strategy Profile Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold uppercase">Objective Strategy:</span>
          {['BALANCED', 'MINIMIZE_RISK', 'MINIMIZE_DOWNTIME', 'MINIMIZE_COST', 'MAXIMIZE_SERVICE_CONTINUITY'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedObjective(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                selectedObjective === mode
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              aria-pressed={selectedObjective === mode}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          {(['comparison', 'candidates', 'graph', 'timeline', 'conflicts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Panels */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Plan Comparison Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Candidate Plan Comparison Matrix</h2>
              <span className="text-xs text-slate-400 font-mono">3 Candidate Plans Evaluated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300" aria-label="Plan Comparison Matrix">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Plan Title</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Risk Reduction</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Downtime</th>
                    <th className="p-3">Pop. Protected</th>
                    <th className="p-3">Resilience Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr className="bg-emerald-950/20 hover:bg-emerald-950/40">
                    <td className="p-3 font-bold text-emerald-400">Plan A: Life-Safety & Rapid Power Isolation</td>
                    <td className="p-3 text-emerald-300 font-bold">88.5 / 100</td>
                    <td className="p-3"><span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">OPTIMAL</span></td>
                    <td className="p-3 text-emerald-400">+78.4%</td>
                    <td className="p-3">$14,300</td>
                    <td className="p-3">1.5 hrs</td>
                    <td className="p-3 text-white font-bold">34,200</td>
                    <td className="p-3 text-emerald-400 font-bold">+33.5 pts</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">Plan B: Service Continuity & Balanced Resource</td>
                    <td className="p-3 text-slate-200 font-semibold">82.0 / 100</td>
                    <td className="p-3"><span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px]">RECOMMENDED</span></td>
                    <td className="p-3 text-sky-400">+68.0%</td>
                    <td className="p-3">$9,800</td>
                    <td className="p-3">2.0 hrs</td>
                    <td className="p-3">33,000</td>
                    <td className="p-3 text-sky-400">+26.0 pts</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">Plan C: Economy & Minimal Expenditure Strategy</td>
                    <td className="p-3 text-slate-400">65.0 / 100</td>
                    <td className="p-3"><span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[10px]">ACCEPTABLE</span></td>
                    <td className="p-3 text-slate-400">+48.0%</td>
                    <td className="p-3">$4,200</td>
                    <td className="p-3">3.5 hrs</td>
                    <td className="p-3">29,700</td>
                    <td className="p-3 text-slate-400">+16.5 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Recommendation Highlight Card */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/40 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">TOP ADVISORY RECOMMENDATION</span>
                <h3 className="text-xl font-bold text-white mt-1">Plan A: Life-Safety & Rapid Power Isolation Strategy</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
                SCORE 88.5 / 100 (OPTIMAL)
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Why This Plan:</strong> Achieves maximum population protection (34,200 citizens) with minimal emergency downtime (1.5 hours) and 78.4% risk reduction. Safely isolates Substation 4B sub-bus before mobile generator deployment, eliminating ground-fault hazard while preserving arterial ambulance SLA.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono pt-2 border-t border-emerald-500/20">
              <div>
                <span className="text-slate-400 block">EXPECTED COST</span>
                <span className="text-slate-200 font-bold">$14,300 USD</span>
              </div>
              <div>
                <span className="text-slate-400 block">ESTIMATED DOWNTIME</span>
                <span className="text-slate-200 font-bold">1.5 Hours</span>
              </div>
              <div>
                <span className="text-slate-400 block">POPULATION PROTECTED</span>
                <span className="text-emerald-400 font-bold">34,200 Citizens</span>
              </div>
              <div>
                <span className="text-slate-400 block">REMAINING RISK</span>
                <span className="text-amber-400 font-bold">Low (Fuel Tanker Swap Needed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'act-util-iso-1', title: 'Isolate Flood-Exposed Substation 4B Sub-Bus', domain: 'UTILITY', cost: '$1,200', dur: '0.5h', risk: '+34 pts', conf: '96%' },
            { id: 'act-gen-dep-1', title: 'Deploy Mobile Generators to Ward 12 Pump Station', domain: 'UTILITY', cost: '$3,500', dur: '1.0h', risk: '+28 pts', conf: '94%' },
            { id: 'act-fld-rsp-1', title: 'Mobilize De-watering Pumps at Benz Circle', domain: 'CLIMATE', cost: '$4,800', dur: '1.5h', risk: '+26 pts', conf: '92%' },
            { id: 'act-rd-cls-1', title: 'Close Flooded Benz Circle Eastbound Lane', domain: 'MOBILITY', cost: '$800', dur: '0.5h', risk: '+22 pts', conf: '98%' },
            { id: 'act-trns-rerout-1', title: 'Reroute BRT Line 3 Buses to Elevated Corridor', domain: 'TRANSIT', cost: '$1,500', dur: '0.75h', risk: '+18 pts', conf: '95%' },
            { id: 'act-emg-stg-1', title: 'Stage Rescue Ambulances at High-Ground Hub B', domain: 'EMERGENCY', cost: '$2,200', dur: '0.5h', risk: '+30 pts', conf: '97%' },
          ].map((c) => (
            <div key={c.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">{c.domain}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">CONF: {c.conf}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{c.title}</h3>
              <div className="flex justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Cost: {c.cost}</span>
                <span>Duration: {c.dur}</span>
                <span className="text-emerald-400 font-bold">Risk Red: {c.risk}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Human Governance Footer Banner */}
      <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-rose-400 text-lg">⚠️</span>
          <div>
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">MANDATORY HUMAN AUTHORIZATION CONTROL</h4>
            <p className="text-xs text-slate-400">
              Autonomous physical grid switching, emergency vehicle dispatch, or public command execution is strictly forbidden. Human operator authorization required.
            </p>
          </div>
        </div>
        <button
          className="bg-slate-800 text-slate-500 font-bold px-4 py-2 rounded-md text-xs cursor-not-allowed border border-slate-700"
          disabled
          aria-disabled="true"
        >
          WAITING FOR AUTHORIZATION
        </button>
      </div>
    </div>
  );
}
