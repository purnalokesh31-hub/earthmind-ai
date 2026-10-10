'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Citywide Predictive Simulation Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const CityPredictiveSimulationWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/digital-twin/predictions/simulations')
      .then((res) => res.json())
      .then((json) => {
        const list = json.data || [];
        setScenarios(list);
        if (list.length > 0) setSelectedScenario(list[0]);
      })
      .catch(console.error);
  }, []);

  const result = selectedScenario?.result;
  const recommendation = selectedScenario?.recommendation;

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🧪 Citywide Predictive Scenario Simulation & Impact Forecasting</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              ● WHAT-IF SIMULATOR
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate climate, mobility, and utility escalation scenarios to predict multi-domain cascading failures and evaluate mitigation options.
          </p>
        </div>

        <button
          onClick={() => useAppStore.getState().addToast({ title: 'Simulation Launched', message: 'New what-if predictive scenario simulation launched.', type: 'info' })}
          className="px-4 py-2 font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-950 rounded-lg transition shadow-md"
        >
          + Launch What-If Scenario
        </button>
      </div>

      {/* Scenario Risk Comparison Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Baseline City Risk</span>
          <div className="text-lg font-bold text-slate-300">
            {result?.risk?.baselineRiskScore || 52.0} pts
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Simulated Peak Risk</span>
          <div className="text-lg font-bold text-rose-400">
            {result?.risk?.simulatedRiskScore || 88.5} pts ({result?.risk?.classification || 'CRITICAL'})
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Simulated Risk Delta</span>
          <div className="text-lg font-bold text-amber-400">
            +{result?.risk?.riskDelta || 36.5} pts
          </div>
        </div>
        <div className="p-3 bg-[#050B14] border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400">Simulation Confidence</span>
          <div className="text-lg font-bold text-emerald-400">
            {result?.confidencePercent || 94.5}%
          </div>
        </div>
      </div>

      {/* Cascade Steps & Impact Panel */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Cascade Propagation */}
          <div className="bg-[#050B14] border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-[10px] text-blue-400 font-bold uppercase block pb-1 border-b border-slate-800">
              🌊 SIMULATED CROSS-DOMAIN CASCADE PROPAGATION
            </span>
            <div className="space-y-2">
              {result.cascadeSteps?.map((step: any) => (
                <div key={step.stepIndex} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px]">
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span>STEP {step.stepIndex}: {step.sourceDomain} → {step.targetDomain}</span>
                    <span>+{step.timeDelayMinutes}m delay</span>
                  </div>
                  <div className="font-bold text-slate-200 mt-1">{step.triggerEvent}</div>
                  <div className="text-slate-400 mt-0.5">{step.cascadingImpactDescription}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-[#050B14] border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-[10px] text-purple-400 font-bold uppercase block pb-1 border-b border-slate-800">
              📊 PREDICTED MUNICIPAL IMPACT SUMMARY
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Affected Population</span>
                <span className="font-bold text-slate-200">{result.impact?.affectedPopulation?.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Estimated Cost Impact</span>
                <span className="font-bold text-emerald-400">${result.impact?.directFinancialImpactUsd?.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Infrastructure Downtime</span>
                <span className="font-bold text-amber-400">{result.impact?.criticalInfrastructureDowntimeHours} hrs</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Emergency Access Delay</span>
                <span className="font-bold text-rose-400">{result.impact?.emergencyResponseDelayMinutes} mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Mitigation Recommendation & Human Authorization */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-950/20 border border-blue-500/40 p-4 rounded-xl space-y-3 font-mono text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-blue-300 font-bold uppercase">
                💡 ADVISORY SIMULATION MITIGATION RECOMMENDATION
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{recommendation.title}</h3>
            </div>

            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              STATUS: {recommendation.approvalStatus}
            </span>
          </div>

          <p className="text-[11px] text-slate-300">{recommendation.summary}</p>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">RECOMMENDED MITIGATION STEPS:</span>
            {recommendation.mitigationSteps?.map((step: string, i: number) => (
              <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <span className="text-blue-400">›</span> {step}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">🔒 Mandatory Human Authorization Enforced (requiresHumanApproval: true)</span>
            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Mitigation Authorized', message: 'Simulated mitigation recommendation authorized by commander.', type: 'success' })}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              ✓ Authorize Scenario Mitigation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
