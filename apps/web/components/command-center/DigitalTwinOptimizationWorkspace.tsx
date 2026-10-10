'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Optimization Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OptimizationRecommendationDto, OptimizationCandidatePlanDto } from '../../lib/server/domain/digital-twin/optimization.domain';

export const DigitalTwinOptimizationWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [objective, setObjective] = useState<string>('BALANCED_MULTI_OBJECTIVE');
  const [budget, setBudget] = useState<number>(1500000);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [recommendation, setRecommendation] = useState<OptimizationRecommendationDto | null>(null);

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      // 1. Create scenario
      const createRes = await fetch('/api/v1/digital-twin/optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Vijayawada Central Infrastructure Optimization',
          cityId: 'city-vja',
          totalBudgetInr: budget,
          objectives: {
            type: objective,
            riskWeight: 0.4,
            costWeight: 0.2,
            responseTimeWeight: 0.2,
            availabilityWeight: 0.2,
          },
        }),
      });

      const createData = await createRes.json();
      if (createData.data) {
        // 2. Run optimization
        const runRes = await fetch(`/api/v1/digital-twin/optimizations/${createData.data.scenarioId}/run`, {
          method: 'POST',
        });
        const runData = await runRes.json();
        if (runData.data) setRecommendation(runData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚡ Autonomous Infrastructure Optimization & Resource Planning</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              ● HUMAN GOVERNED
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-objective optimization engine scoring risk reduction, SLA response times, resource utilization, and budget limits.
          </p>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing}
          className="px-4 py-2 font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg transition shadow-md"
        >
          {isOptimizing ? 'Optimizing Plan...' : '⚙ Calculate Optimal Strategy'}
        </button>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Optimization Objective</label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-emerald-500"
          >
            <option value="BALANCED_MULTI_OBJECTIVE">Balanced Strategy (Multi-Objective)</option>
            <option value="MINIMIZE_RISK">Risk First (Suppress Max Risk)</option>
            <option value="MINIMIZE_COST">Cost First (Capital Efficiency)</option>
            <option value="MINIMIZE_RESPONSE_TIME">Speed First (SLA Acceleration)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Capital Budget Ceiling (INR ₹)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-mono font-medium focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Recommendation Results */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050B14] border border-emerald-500/40 rounded-xl p-5 space-y-5 text-xs shadow-lg"
        >
          {/* Header & Scoring */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                RECOMMENDATION ID: {recommendation.recommendationId}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{recommendation.title}</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">{recommendation.description}</p>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400">Composite Score</span>
              <div className="text-xl font-bold text-emerald-400">
                {recommendation.scoringFactors.finalScore} / 100
              </div>
            </div>
          </div>

          {/* Candidate Strategy Matrix */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              Candidate Strategy Comparison (Top Feasible Option Recommended)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Selected Recommended Plan */}
              <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">RECOMMENDED: {recommendation.selectedPlan.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold rounded">
                    SCORE: {recommendation.selectedPlan.normalizedScore}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400">Risk Red.</span>
                    <div className="font-bold text-emerald-400">{recommendation.selectedPlan.riskReductionPercent}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Est. Cost</span>
                    <div className="font-bold text-slate-200">₹{recommendation.selectedPlan.estimatedCostInr.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Resp. Time</span>
                    <div className="font-bold text-cyan-400">{recommendation.selectedPlan.estimatedResponseTimeMinutes} mins</div>
                  </div>
                </div>
              </div>

              {/* Alternative Plans */}
              {recommendation.alternativePlans.map((alt) => (
                <div key={alt.planId} className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">{alt.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 font-bold rounded">
                      SCORE: {alt.normalizedScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400">Risk Red.</span>
                      <div className="font-bold text-amber-400">{alt.riskReductionPercent}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Est. Cost</span>
                      <div className="font-bold text-slate-300">₹{alt.estimatedCostInr.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Resp. Time</span>
                      <div className="font-bold text-slate-300">{alt.estimatedResponseTimeMinutes} mins</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Authorization Controls */}
          <div className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-300 font-bold">⚠️ HUMAN-IN-THE-LOOP SAFETY MANDATE</span>
              <p className="text-[11px] text-slate-300">
                Consequential dispatch & resource reallocation requires explicit, authenticated operator authorization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => useAppStore.getState().addToast({ title: 'Optimization Approved', message: 'Optimization recommendation approved for human dispatch authorization.', type: 'success' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                ✓ Authorize Plan B
              </button>
              <button
                onClick={() => useAppStore.getState().addToast({ title: 'Plan Rejected', message: 'Optimization plan rejected.', type: 'info' })}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
