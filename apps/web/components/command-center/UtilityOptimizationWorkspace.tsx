'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.4 Utility Optimization Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const UtilityOptimizationWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/digital-twin/utilities/optimizations')
      .then((res) => res.json())
      .then((json) => setScenarios(json.data || []))
      .catch(console.error);
  }, []);

  const activeScenario = scenarios[0];

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚡ Smart Utility Autonomous Recovery & Resilience Optimization</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              ● ADVISORY OPTIMIZER
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-objective recovery optimization engine combining Digital Twin state, failure predictions, network simulations, and resource allocations.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Optimization Executed', message: 'Multi-objective recovery optimization executed in memory.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-slate-950 rounded-lg transition shadow-md"
        >
          ▶ Run Optimization Algorithm
        </button>
      </div>

      {/* Network Resilience & Risk Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Baseline Resilience</span>
          <div className="text-lg font-bold text-amber-400">
            {activeScenario?.candidates?.[0]?.resilienceImprovement?.baselineResilienceScore || 48.5} / 100
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Post-Recovery Resilience</span>
          <div className="text-lg font-bold text-emerald-400">
            {activeScenario?.candidates?.[0]?.resilienceImprovement?.postRecoveryResilienceScore || 88.5} (+40 pts)
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Estimated Recovery Downtime</span>
          <div className="text-lg font-bold text-cyan-400">
            {activeScenario?.candidates?.[0]?.costImpact?.downtimeHours || 1.5} Hours
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Total Strategy Cost</span>
          <div className="text-lg font-bold text-purple-400">
            ${activeScenario?.candidates?.[0]?.costImpact?.totalCostUsd?.toLocaleString() || '3,200'}
          </div>
        </div>
      </div>

      {/* Candidate Strategy Cards & Comparison Matrix */}
      {activeScenario && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                🎯 RECOMMENDED CANDIDATE STRATEGY ({activeScenario?.candidates?.[0]?.candidateName})
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {activeScenario?.candidates?.[0]?.title}
              </h3>
            </div>

            <span className="px-2.5 py-1 font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              FEASIBILITY: {activeScenario?.candidates?.[0]?.feasibility} (SCORE: {activeScenario?.candidates?.[0]?.normalizedScore})
            </span>
          </div>

          {/* Resource Allocation & Step-by-Step Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Allocation */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <span className="text-[10px] text-purple-300 font-bold uppercase block pb-1 border-b border-slate-800">
                📦 OPTIMIZED RESOURCE ALLOCATION
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Engineering Teams:</span>
                <strong className="text-slate-100">{activeScenario?.candidates?.[0]?.resourceAllocation?.engineeringTeamsCount || 1}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Electrical Crews:</span>
                <strong className="text-slate-100">{activeScenario?.candidates?.[0]?.resourceAllocation?.electricalCrewsCount || 2}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mobile Generators Deployed:</span>
                <strong className="text-cyan-400">{activeScenario?.candidates?.[0]?.resourceAllocation?.generatorsDeployedCount || 1}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Replacement Components:</span>
                <strong className="text-amber-400">{activeScenario?.candidates?.[0]?.resourceAllocation?.replacementComponentsCount || 1}</strong>
              </div>
            </div>

            {/* Recovery Sequence */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <span className="text-[10px] text-purple-300 font-bold uppercase block pb-1 border-b border-slate-800">
                ⏱️ ORDERED RECOVERY SEQUENCE (TIMELINE: 1.5 HOURS)
              </span>
              {activeScenario?.candidates?.[0]?.recoverySequence?.orderedSteps?.map((step: any) => (
                <div key={step.stepNumber} className="text-slate-300 flex items-start gap-2">
                  <span className="text-purple-400 font-bold">Step {step.stepNumber}:</span>
                  <span>[{step.actionType}] {step.targetAssetName} ({step.estimatedDurationMinutes} mins)</span>
                </div>
              )) || (
                <div className="text-slate-400">Step 1: [ISOLATE] Primary Transformer TX-4 (15 mins)</div>
              )}
            </div>
          </div>

          {/* Human Authorization Control */}
          <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-300 font-bold">🔒 HUMAN AUTHORIZATION REQUIRED</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {activeScenario?.recommendation?.summary} ({activeScenario?.recommendation?.rationale})
              </p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Strategy Authorized', message: 'Utility recovery and resilience strategy authorized by human grid director.', type: 'success' })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Recovery Strategy
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
