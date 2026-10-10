'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Unified City Intelligence View
// End-to-End Pipeline View: LIVE OBSERVATION -> RISK -> FORECAST -> WHAT-IF -> DECISION -> GOVERNANCE
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export interface PipelineStageUI {
  stageId: string;
  stageName: string;
  provenanceTag: 'LIVE OBSERVATION' | 'PREDICTION' | 'SIMULATION' | 'RECOMMENDATION' | 'HUMAN DECISION';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DEGRADED';
  summary: string;
}

const STAGES: PipelineStageUI[] = [
  {
    stageId: 'stg-1',
    stageName: 'Stage 1: Real-World Data Ingestion',
    provenanceTag: 'LIVE OBSERVATION',
    status: 'COMPLETED',
    summary: '14 active sensors (Rainfall 120mm/hr, Traffic Congestion 88%, Grid Load 92%)',
  },
  {
    stageId: 'stg-2',
    stageName: 'Stage 2: Cross-Domain Correlation',
    provenanceTag: 'LIVE OBSERVATION',
    status: 'COMPLETED',
    summary: 'Cross-domain causal chain identified: Climate Rainfall ➔ Inundation ➔ Transit Delay',
  },
  {
    stageId: 'stg-3',
    stageName: 'Stage 3: Predictive Risk Assessment',
    provenanceTag: 'PREDICTION',
    status: 'COMPLETED',
    summary: 'Predictive alert issued: Critical inundation risk at Benz Circle (Risk Score: 78/100)',
  },
  {
    stageId: 'stg-4',
    stageName: 'Stage 4: What-If Scenario Simulation',
    provenanceTag: 'SIMULATION',
    status: 'COMPLETED',
    summary: 'Simulation "City Flood Cascade": Auxiliary pumping reduces peak inundation depth by 42%',
  },
  {
    stageId: 'stg-5',
    stageName: 'Stage 5: Decision Intelligence',
    provenanceTag: 'RECOMMENDATION',
    status: 'COMPLETED',
    summary: 'Decision Option Alpha selected: Isolate Sector 4 Micro-Grid & Deploy Auxiliary Pumps',
  },
  {
    stageId: 'stg-6',
    stageName: 'Stage 6: Intervention Planning',
    provenanceTag: 'RECOMMENDATION',
    status: 'COMPLETED',
    summary: '4 action steps generated ($15,000 budget, 2.5h duration, zero resource conflicts)',
  },
  {
    stageId: 'stg-7',
    stageName: 'Stage 7: Human Command Governance',
    provenanceTag: 'HUMAN DECISION',
    status: 'PENDING_APPROVAL',
    summary: 'MANDATORY HUMAN AUTHORIZATION REQUIRED (Authorized Role: EMERGENCY_COMMANDER)',
  },
];

export const UnifiedCommandCenterWorkspace: React.FC = () => {
  const [mode, setMode] = useState<'LIVE_READ_ONLY' | 'DEMO' | 'SIMULATION'>('LIVE_READ_ONLY');

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* ── SAFETY MANDATE BANNER ── */}
      <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="font-bold text-amber-200 text-sm">EARTHMIND LIVE CITY INTELLIGENCE RUNTIME — PHASE 8.5</h4>
            <p className="text-xs text-amber-300/80">
              Live Read-Only Telemetry Active. Autonomous physical execution is disabled. Human approval mandatory.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('LIVE_READ_ONLY')}
            className={`text-xs px-2.5 py-1 rounded font-mono font-bold transition-all ${
              mode === 'LIVE_READ_ONLY'
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            LIVE READ-ONLY
          </button>
          <button
            onClick={() => setMode('DEMO')}
            className={`text-xs px-2.5 py-1 rounded font-mono font-bold transition-all ${
              mode === 'DEMO'
                ? 'bg-blue-600 text-white border border-blue-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            DEMO
          </button>
          <button
            onClick={() => setMode('SIMULATION')}
            className={`text-xs px-2.5 py-1 rounded font-mono font-bold transition-all ${
              mode === 'SIMULATION'
                ? 'bg-purple-600 text-white border border-purple-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            SIMULATION
          </button>
        </div>
      </div>

      {/* ── HEADER & RUNTIME STATE ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400">Unified City Intelligence Pipeline</h2>
          <p className="text-sm text-slate-400">End-to-End Orchestration from Live Telemetry to Governance</p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            <span className="text-slate-400">Runtime Status: </span>
            <span className="text-emerald-400 font-bold">● HEALTHY</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            <span className="text-slate-400">Mode: </span>
            <span className="text-amber-300 font-bold">{mode}</span>
          </div>
        </div>
      </div>

      {/* ── PIPELINE FLOW CARDS ── */}
      <div className="space-y-3">
        {STAGES.map((s, idx) => (
          <div key={s.stageId} className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-200">{s.stageName}</span>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    s.provenanceTag === 'LIVE OBSERVATION'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : s.provenanceTag === 'PREDICTION'
                      ? 'bg-blue-950 text-blue-300 border border-blue-700'
                      : s.provenanceTag === 'SIMULATION'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700'
                      : s.provenanceTag === 'RECOMMENDATION'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}
                >
                  [{s.provenanceTag}]
                </span>
              </div>
              <p className="text-xs text-slate-400">{s.summary}</p>
            </div>
            <div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                  s.status === 'COMPLETED'
                    ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60'
                    : 'bg-amber-900/40 text-amber-300 border border-amber-800/60 animate-pulse'
                }`}
              >
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
