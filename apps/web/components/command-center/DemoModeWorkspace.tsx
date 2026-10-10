'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dedicated Demo Mode Command Center Workspace
// Interactive expo-ready demonstration interface with safety badges
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export interface DemoModeWorkspaceProps {
  onExitDemo?: () => void;
}

export const DemoModeWorkspace: React.FC<DemoModeWorkspaceProps> = ({ onExitDemo }) => {
  const [selectedScenario, setSelectedScenario] = useState('CITY_FLOOD_CASCADE_DEMO');
  const [demoState, setDemoState] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'RESET'>('IDLE');
  const [loading, setLoading] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);

  const handleRunDemo = async () => {
    setLoading(true);
    setDemoState('RUNNING');
    try {
      const res = await fetch('/api/v1/demo/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', scenarioId: selectedScenario }),
      });
      const json = await res.json();
      if (json.success) {
        setDemoData(json.demo);
        setDemoState('COMPLETED');
      }
    } catch (e) {
      console.error('Demo execution error:', e);
      setDemoState('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async () => {
    setLoading(true);
    setDemoState('RUNNING');
    try {
      const res = await fetch('/api/v1/demo/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REPLAY', scenarioId: selectedScenario }),
      });
      const json = await res.json();
      if (json.success) {
        setDemoData(json.demo);
        setDemoState('COMPLETED');
      }
    } catch (e) {
      console.error('Demo replay error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/v1/demo/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
    } catch (e) {}
    setDemoState('RESET');
    setDemoData(null);
  };

  const stages = [
    { id: 'SIGNAL_DETECTED', step: 1, label: 'SIGNAL DETECTED', desc: 'Climate Telemetry (145.0 mm/hr)' },
    { id: 'CROSS_DOMAIN_CORRELATION', step: 2, label: 'CROSS-DOMAIN CORRELATION', desc: '4-Domain Cascade Fusion' },
    { id: 'RISK_PREDICTION', step: 3, label: 'RISK PREDICTION', desc: 'Spatial Flood Index 88.5/100' },
    { id: 'WHAT_IF_SIMULATION', step: 4, label: 'WHAT-IF SIMULATION', desc: '6h Pump Mitigation Cascade' },
    { id: 'DECISION_PRIORITY', step: 5, label: 'DECISION PRIORITY', desc: 'Pareto Multi-Objective Optimization' },
    { id: 'INTERVENTION_PLAN', step: 6, label: 'INTERVENTION PLAN', desc: 'Benz Circle Reroute & Pumps' },
    { id: 'COMMAND_ESCALATION', step: 7, label: 'COMMAND ESCALATION', desc: 'Escalated to Emergency Commander' },
    { id: 'HUMAN_AUTHORIZATION', step: 8, label: 'HUMAN AUTHORIZATION', desc: 'Signed-off by Commander Patel' },
    { id: 'AUDIT_COMPLETE', step: 9, label: 'AUDIT COMPLETE', desc: 'Immutable SHA-256 Audit Recorded' },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 p-6 space-y-6 rounded-xl border border-slate-800 shadow-2xl">
      {/* 1. Mandatory Safety Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-amber-950/80 border-2 border-amber-500/80 rounded-lg text-amber-200">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-sm rounded shadow">
            ⚠️ DEMO MODE
          </span>
          <span className="font-bold text-sm tracking-wide">
            SIMULATION DATA — NO LIVE INFRASTRUCTURE CONTROL — HUMAN AUTHORIZATION REQUIRED
          </span>
        </div>
        <span className="text-xs bg-amber-900/60 px-2.5 py-1 rounded text-amber-300 font-mono">
          dataSource: "SIMULATION"
        </span>
      </div>

      {/* 2. Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scenario:</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            disabled={loading}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="CITY_FLOOD_CASCADE_DEMO">Vijayawada Benz Circle City Flood Cascade Demo</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunDemo}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded shadow transition disabled:opacity-50"
          >
            {loading ? 'Running Pipeline...' : '🚀 Run Demo'}
          </button>

          <button
            onClick={handleReplay}
            disabled={loading || demoState !== 'COMPLETED'}
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-sm rounded transition disabled:opacity-40"
          >
            🔄 Replay Scenario
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded transition border border-slate-700"
          >
            🧹 Reset Demo
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            disabled={!demoData}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold text-sm rounded transition disabled:opacity-40"
          >
            📜 View Audit Trail
          </button>

          {onExitDemo && (
            <button
              onClick={onExitDemo}
              className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-semibold text-sm rounded transition border border-rose-700/60"
            >
              🚪 Exit Demo Mode
            </button>
          )}
        </div>
      </div>

      {/* 3. 9-Stage Pipeline Stepper */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Complete System Intelligence Pipeline Progression (9 Stages)</span>
          <span className="text-xs font-mono text-cyan-400">
            State: <strong className="uppercase">{demoState}</strong>
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {stages.map((stg) => {
            const isDone = demoState === 'COMPLETED';
            const isActive = demoState === 'RUNNING';
            return (
              <div
                key={stg.id}
                className={`flex flex-col p-3 rounded-lg border text-xs transition ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                    : isActive
                    ? 'bg-cyan-950/40 border-cyan-500 animate-pulse text-cyan-200'
                    : stg.id === 'HUMAN_AUTHORIZATION'
                    ? 'bg-amber-950/20 border-amber-700/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[10px] opacity-75">STEP 0{stg.step}</span>
                  <span>{isDone ? '✓' : isActive ? '⏳' : stg.id === 'HUMAN_AUTHORIZATION' ? '🔒' : '⚪'}</span>
                </div>
                <div className="font-bold text-[11px] mb-1 line-clamp-2">{stg.label}</div>
                <div className="text-[10px] opacity-80 leading-tight">{stg.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Scenario Metrics Display (When Completed) */}
      {demoData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Rainfall Accumulation</div>
            <div className="text-xl font-bold text-cyan-400">{demoData.metrics?.rainfallAccumulationMmHr} mm/hr</div>
            <div className="text-[10px] text-slate-500 mt-1">HEAVY_RAINFALL (Climate)</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Predicted Flood Risk</div>
            <div className="text-xl font-bold text-rose-400">{demoData.metrics?.predictedFloodRiskScore} / 100</div>
            <div className="text-[10px] text-rose-500/80 mt-1">CRITICAL Risk Index</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Population Exposure</div>
            <div className="text-xl font-bold text-amber-400">{demoData.metrics?.populationExposureCount?.toLocaleString()}</div>
            <div className="text-[10px] text-amber-500/80 mt-1">Benz Circle Catchment</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400">Human Authorization</div>
            <div className="text-xl font-bold text-emerald-400">APPROVED</div>
            <div className="text-[10px] text-emerald-500/80 mt-1">Commander Patel</div>
          </div>
        </div>
      )}

      {/* 5. Audit Modal */}
      {showAuditModal && demoData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-400 flex items-center space-x-2">
                <span>📜 Immutable Operator Audit Log Record</span>
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded border border-slate-800 text-slate-300">
              <div><strong>Case ID:</strong> {demoData.pipelineChain?.stage9_auditLog?.caseId}</div>
              <div><strong>Decision ID:</strong> {demoData.pipelineChain?.stage9_auditLog?.decisionId}</div>
              <div><strong>Decided By:</strong> {demoData.pipelineChain?.stage9_auditLog?.decidedBy}</div>
              <div><strong>Decided At:</strong> {demoData.pipelineChain?.stage9_auditLog?.decidedAt}</div>
              <div><strong>Decision:</strong> {demoData.pipelineChain?.stage9_auditLog?.decision}</div>
              <div><strong>Status:</strong> {demoData.pipelineChain?.stage9_auditLog?.status}</div>
              <div><strong>Provenance:</strong> SIMULATION</div>
            </div>
            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded"
            >
              Close Audit Trail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoModeWorkspace;
