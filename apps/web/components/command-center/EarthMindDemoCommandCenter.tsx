'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Final Expo Command Center Experience Component
// High-Impact Projector-Ready Dashboard for Evaluator Presentations
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  RotateCcw,
  FileText,
  Activity,
  TrendingDown,
  Users,
  DollarSign,
  Layers,
  ArrowRight,
  Server,
  Radio,
} from 'lucide-react';

export function EarthMindDemoCommandCenter() {
  const [demoState, setDemoState] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'RESET'>('IDLE');
  const [loading, setLoading] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [approvalToken, setApprovalToken] = useState<string>('tok-demo-confirm-001');
  const [approvalReason, setApprovalReason] = useState<string>('Approved Benz Circle flood mitigation plan.');
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const handleRunDemo = async () => {
    setLoading(true);
    setDemoState('RUNNING');
    setApprovalStatus(null);

    try {
      const res = await fetch('/api/v1/demo/city-crisis', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setDemoData(json.demo);
        setDemoState('COMPLETED');
      }
    } catch (e) {
      console.error('Failed to run demo:', e);
      setDemoState('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async () => {
    handleRunDemo();
  };

  const handleReset = () => {
    setDemoState('RESET');
    setDemoData(null);
    setApprovalStatus(null);
  };

  const handleApprove = () => {
    if (!approvalReason) return;
    setApprovalStatus('APPROVED');
  };

  const handleReject = () => {
    setApprovalStatus('REJECTED');
  };

  const pipelineStages = [
    { name: 'SIGNALS', status: demoState === 'COMPLETED' ? 'COMPLETED' : demoState === 'RUNNING' ? 'ACTIVE' : 'PENDING' },
    { name: 'PREDICTION', status: demoState === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { name: 'SIMULATION', status: demoState === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { name: 'DECISION', status: demoState === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { name: 'INTERVENTION', status: demoState === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { name: 'COMMAND', status: demoState === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { name: 'AUTHORIZATION', status: approvalStatus ? 'COMPLETED' : demoState === 'COMPLETED' ? 'BLOCKED' : 'PENDING' },
    { name: 'AUDIT', status: approvalStatus ? 'COMPLETED' : 'PENDING' },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 p-5 space-y-5 rounded-2xl border border-slate-800 font-sans shadow-2xl overflow-x-hidden">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-cyan-400 font-mono">
            EARTHMIND PIOS
          </h1>
          <h2 className="text-xs md:text-sm font-bold text-slate-300 tracking-widest uppercase">
            CITYWIDE INTELLIGENCE COMMAND CENTER
          </h2>
        </div>

        {/* PROMINENT SAFETY BANNER */}
        <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-amber-950/90 border border-amber-500/80 rounded-lg text-amber-200 text-xs font-bold shadow-inner">
          <Shield className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>SIMULATION MODE</span>
          <span>•</span>
          <span>ADVISORY ONLY</span>
          <span>•</span>
          <span>NO AUTONOMOUS EXECUTION</span>
          <span>•</span>
          <span className="text-amber-300 underline underline-offset-2">HUMAN AUTHORIZATION REQUIRED</span>
        </div>
      </div>

      {/* TOP STATUS KPIS (6 CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">CITY RISK</span>
          <span className="text-xl font-black text-rose-400">88.5 / 100</span>
          <span className="text-[9px] text-rose-500 font-semibold">CRITICAL INUNDATION</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE INCIDENTS</span>
          <span className="text-xl font-black text-amber-400">4 CASCADING</span>
          <span className="text-[9px] text-amber-500 font-semibold">MULTIMODAL IMPACT</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">PREDICTIVE ALERTS</span>
          <span className="text-xl font-black text-cyan-400">3 ACTIVE</span>
          <span className="text-[9px] text-cyan-500 font-semibold">145 mm/hr PRECIPITATION</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">SIMULATIONS</span>
          <span className="text-xl font-black text-indigo-400">6h HORIZON</span>
          <span className="text-[9px] text-indigo-400/80 font-semibold">PUMP CASCADE MODEL</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">PRIORITY ACTIONS</span>
          <span className="text-xl font-black text-emerald-400">4 EVALUATED</span>
          <span className="text-[9px] text-emerald-500 font-semibold">PARETO OPTIMIZED</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">PENDING APPROVALS</span>
          <span className="text-xl font-black text-amber-300">1 CASE</span>
          <span className="text-[9px] text-amber-400 font-semibold">COMMANDER LEVEL</span>
        </div>
      </div>

      {/* MAIN PIPELINE CARDS (8 STAGES) */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Pipeline Execution Chain</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">STATUS: {demoState}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {pipelineStages.map((stg, idx) => {
            const isCompleted = stg.status === 'COMPLETED';
            const isActive = stg.status === 'ACTIVE';
            const isBlocked = stg.status === 'BLOCKED';

            return (
              <div
                key={stg.name}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center transition ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : isActive
                    ? 'bg-cyan-950/50 border-cyan-400 animate-pulse text-cyan-200'
                    : isBlocked
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[9px] font-mono opacity-70 mb-0.5">0{idx + 1}</span>
                <span className="text-xs font-black tracking-tight">{stg.name}</span>
                <span className="text-[9px] mt-1 font-semibold">
                  {isCompleted ? '✓ DONE' : isActive ? '⏳ RUN' : isBlocked ? '🔒 AUTH' : '⚪ WAIT'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CITY CRISIS DEMO CONTROL PANEL */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 rounded-xl gap-3">
        <div className="flex items-center space-x-3">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-slate-200">CITY CRISIS DEMO PANEL (DEMO_CITY_CRISIS_001)</div>
            <div className="text-xs text-slate-400">Vijayawada Benz Circle Heavy Rainfall & Multimodal Flood Cascade</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunDemo}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase rounded-lg shadow-lg flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'RUNNING DEMO...' : 'RUN CITY CRISIS DEMO'}</span>
          </button>

          <button
            onClick={handleReplay}
            disabled={loading || demoState !== 'COMPLETED'}
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs uppercase rounded-lg shadow flex items-center space-x-1.5 transition disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET DEMO</span>
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            disabled={!demoData}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs uppercase rounded-lg border border-emerald-600/50 flex items-center space-x-1.5 transition disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>VIEW AUDIT</span>
          </button>
        </div>
      </div>

      {/* 10 CORE VISUAL DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Risk Gauge */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">1. Citywide Risk Gauge</span>
          <div className="my-3 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-8 border-rose-500 border-t-transparent flex items-center justify-center animate-spin-slow">
              <span className="text-2xl font-black text-rose-400">88.5%</span>
            </div>
          </div>
          <span className="text-[10px] text-rose-400 text-center font-bold uppercase">CRITICAL FLOOD THREAT</span>
        </div>

        {/* Card 2: Risk Trend */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">2. Risk Trend Forecast</span>
          <div className="my-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Base Risk:</span>
              <span className="text-rose-400 font-bold">88.5</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[88%]" />
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Post-Mitigation:</span>
              <span className="text-emerald-400 font-bold">46.0 (-42.5)</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[46%]" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
            <TrendingDown className="w-3 h-3" />
            <span>42.5 Point Risk Reduction Expected</span>
          </span>
        </div>

        {/* Card 3: Affected Zones */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">3. Affected Zones</span>
          <div className="my-2 space-y-1.5 text-xs">
            <div className="p-2 bg-slate-950 rounded border border-rose-900/60 text-rose-300 font-semibold">
              📍 Benz Circle Catchment (Zone 4)
            </div>
            <div className="p-2 bg-slate-950 rounded border border-amber-900/60 text-amber-300 font-semibold">
              📍 NH-9 Transit Corridor
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Vijayawada Metro District</span>
        </div>

        {/* Card 4: Cross-Domain Cascade */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">4. Cascade Visualization</span>
          <div className="my-2 text-xs space-y-1">
            <div className="text-cyan-400 font-bold">Rainfall (145mm/hr)</div>
            <div className="text-slate-500 text-[10px]">↓ Causal Cascade</div>
            <div className="text-amber-400 font-bold">Road Inundation (92.4%)</div>
            <div className="text-slate-500 text-[10px]">↓ Multimodal Impact</div>
            <div className="text-rose-400 font-bold">Hospital Dispatch Delay (22m)</div>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold">4 Domains Correlated</span>
        </div>

        {/* Card 5: Predicted Impact */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">5. Predicted Impact</span>
          <div className="my-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Population:</span>
              <span className="font-bold text-amber-300">34,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service Impact:</span>
              <span className="font-bold text-rose-300">2,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Financial Expos:</span>
              <span className="font-bold text-emerald-300">$45,000</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">6h Horizon Prediction</span>
        </div>

        {/* Card 6: Decision Priority */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">6. Decision Priority</span>
          <div className="my-2 text-xs p-2 bg-slate-950 rounded border border-cyan-900/60">
            <div className="font-bold text-cyan-300">Option Beta (Recommended)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mobile Pumping + Transit Reroute</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">PARETO OPTIMAL #1</span>
        </div>

        {/* Card 7: Recommended Intervention */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">7. Intervention Plan</span>
          <div className="my-2 text-xs space-y-1">
            <div className="font-bold text-slate-200">Deploy 4 High-Cap Pumps</div>
            <div className="text-[10px] text-slate-400">Est. Cost: $12,500</div>
            <div className="text-[10px] text-slate-400">Duration: 3 Hours</div>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold">Dependency Validated</span>
        </div>

        {/* Card 8: Resource Allocation */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">8. Resource Allocation</span>
          <div className="my-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Mobile Pumps:</span>
              <span className="font-bold text-emerald-400">4 / 4 Deployed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Traffic Crews:</span>
              <span className="font-bold text-emerald-400">6 / 6 Assigned</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Resource Feasible</span>
        </div>
      </div>

      {/* CARD 9 & 10: HUMAN AUTHORIZATION PANEL & AUDIT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 9: Human Authorization Panel */}
        <div className="lg:col-span-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 p-5 rounded-xl border-2 border-amber-500/70 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-800/60 pb-2">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                9. HUMAN AUTHORIZATION PANEL
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded">
              HUMAN AUTHORIZATION REQUIRED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Decision Reason / Rationale:</label>
              <textarea
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirmation Token:</label>
              <input
                type="text"
                value={approvalToken}
                onChange={(e) => setApprovalToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded flex items-center justify-center space-x-1 shadow transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>APPROVE</span>
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-2 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs uppercase rounded flex items-center justify-center space-x-1 shadow transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>REJECT</span>
                </button>
              </div>
            </div>
          </div>

          {approvalStatus && (
            <div className={`p-2.5 rounded text-xs font-bold text-center border ${
              approvalStatus === 'APPROVED' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}>
              Operator Sign-off Status: {approvalStatus} (Case Authorization Updated)
            </div>
          )}

          {/* MANDATORY GOVERNANCE TAGLINE */}
          <div className="pt-2 text-center text-xs font-serif italic text-amber-300/90 border-t border-slate-800">
            {"\"EarthMind recommends. Human operators decide.\""}
          </div>
        </div>

        {/* Card 10: Audit Timeline */}
        <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">10. Audit Timeline</span>
            <span className="text-[10px] text-emerald-400 font-mono">SHA-256</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[10px]">
              <div className="text-cyan-400 font-bold">17:12:00 Z — CASE CREATED</div>
              <div>Ref: case-cmd-vja-001</div>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[10px]">
              <div className="text-emerald-400 font-bold">17:12:05 Z — DECISION RECORDED</div>
              <div>Hash: 8f3a...b921</div>
            </div>
          </div>

          <button
            onClick={() => setShowAuditModal(true)}
            disabled={!demoData}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded border border-slate-700 transition disabled:opacity-40"
          >
            Expand Audit Details
          </button>
        </div>
      </div>

      {/* AUDIT MODAL */}
      {showAuditModal && demoData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400">📜 Immutable Operator Audit Log</h3>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>
            <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3.5 rounded border border-slate-800 text-slate-300">
              <div>Case: {demoData.pipelineChain?.stage9_auditLog?.caseId}</div>
              <div>Decision ID: {demoData.pipelineChain?.stage9_auditLog?.decisionId}</div>
              <div>Operator: {demoData.pipelineChain?.stage9_auditLog?.decidedBy}</div>
              <div>Status: {demoData.pipelineChain?.stage9_auditLog?.status}</div>
              <div>Provenance: SIMULATION</div>
            </div>
            <button onClick={() => setShowAuditModal(false)} className="w-full py-2 bg-slate-800 text-slate-200 text-xs rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EarthMindDemoCommandCenter;
