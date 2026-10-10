'use client';
import { useAppStore } from '../../stores/app-store';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Simulation Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SimulationScenarioEntity, SimulationResultDto } from '../../lib/server/domain/digital-twin/simulation.domain';

export const DigitalTwinSimulationWorkspace: React.FC = () => {
  const { addToast } = useAppStore();
  const [scenarioType, setScenarioType] = useState<string>('FLOOD_SIMULATION');
  const [targetAssetId, setTargetAssetId] = useState<string>('ast-drn-102');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResultDto | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      // 1. Create scenario
      const createRes = await fetch('/api/v1/digital-twin/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Custom What-If Infrastructure Simulation',
          type: scenarioType,
          cityId: 'city-vja',
          inputs: [
            {
              inputId: `inp-${Date.now()}`,
              assetId: targetAssetId,
              inputType: 'PUMP_FAILURE',
              severity,
              magnitude: 100,
              durationHours: 4,
              assumptions: ['Peak monsoon rainfall rate', 'Benz Circle traffic density'],
            },
          ],
        }),
      });

      const createData = await createRes.json();
      if (createData.data) {
        // 2. Run simulation
        const runRes = await fetch(`/api/v1/digital-twin/simulations/${createData.data.scenarioId}/run`, {
          method: 'POST',
        });
        const runData = await runRes.json();
        if (runData.data) setSimulationResult(runData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🧪 Digital Twin What-If Scenario Simulation Engine</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              ● ISOLATED ENVIRONMENT
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate hypothetical infrastructure failures & evaluate propagated risk deltas in isolated memory without affecting live operations.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-4 py-2 font-mono text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-slate-950 rounded-lg transition shadow-md"
        >
          {isSimulating ? 'Running Simulation...' : '▶ Run Simulation'}
        </button>
      </div>

      {/* Scenario Builder Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Scenario Hazard Type</label>
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-indigo-500"
          >
            <option value="FLOOD_SIMULATION">Monsoon Hydro-Surge Flood</option>
            <option value="POWER_FAILURE">Grid Power & Substation Outage</option>
            <option value="ROAD_CLOSURE">Arterial Road Closure</option>
            <option value="INFRASTRUCTURE_FAILURE">Underground Culvert Pump Failure</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Target Asset</label>
          <select
            value={targetAssetId}
            onChange={(e) => setTargetAssetId(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-indigo-500"
          >
            <option value="ast-drn-102">Ward 12 Underground Drainage Culvert</option>
            <option value="ast-rd-101">Benz Circle School Arterial Segment</option>
            <option value="ast-trf-103">Central Grid Transformer 33kV</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Hypothetical Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-slate-200 font-medium focus:border-indigo-500"
          >
            <option value="CRITICAL">P1 Critical Hardware Outage (100%)</option>
            <option value="HIGH">P2 Severe Capacity Degradation (60%)</option>
            <option value="MEDIUM">P3 Moderate Stress (30%)</option>
          </select>
        </div>
      </div>

      {/* Simulation Result Output */}
      {simulationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#050B14] border border-indigo-500/40 rounded-xl p-5 space-y-4 shadow-lg text-xs"
        >
          {/* Baseline vs Scenario Matrix */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="font-mono text-[10px] text-indigo-400 font-bold">
                SIMULATION RESULT ID: {simulationResult.resultId}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                Baseline vs Simulated Impact Matrix
              </h3>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Baseline Risk</span>
                <div className="text-base font-bold text-slate-200">{simulationResult.comparison.baselineRiskScore}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-400">Simulated Risk</span>
                <div className="text-base font-bold text-amber-400">
                  {simulationResult.comparison.simulatedRiskScore} (+{simulationResult.comparison.riskDelta} pts)
                </div>
              </div>
            </div>
          </div>

          {/* Impact Propagation Chain */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              Impact Propagation Chain ({simulationResult.impacts.length} Affected Assets)
            </span>
            <div className="space-y-2">
              {simulationResult.impacts.map((imp, idx) => (
                <div key={idx} className="p-3 bg-[#0B1528] rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{imp.targetAssetName}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{imp.explanation}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                      imp.impactType === 'DIRECT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {imp.impactType}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Recommendation & Human Control */}
          <div className="bg-indigo-950/30 border border-indigo-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold">💡 ADVISORY RECOMMENDATION</span>
              <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                {simulationResult.recommendation.title}
              </h4>
              <p className="text-[11px] text-slate-300">{simulationResult.recommendation.description}</p>
            </div>

            <button
              onClick={() => useAppStore.getState().addToast({ title: 'Simulation Approved', message: 'Simulation recommendation approved for human dispatch authorization.', type: 'success' })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
            >
              ✓ Authorize Mitigation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
