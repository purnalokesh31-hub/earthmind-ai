'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Citywide Response Execution Readiness, Monitoring & Outcome Intelligence Workspace
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Zap,
  BarChart3,
  Building2,
  Bus,
  CloudRain,
  Radio,
  Users,
  Eye,
  TrendingDown,
  Clock,
  FileText,
} from 'lucide-react';

type ResponseTab =
  | 'RESPONSE_READINESS'
  | 'READINESS_CHECKS'
  | 'MONITORING_PANEL'
  | 'EXPECTED_VS_OBSERVED'
  | 'DEVIATION_PANEL'
  | 'ESCALATION_PANEL'
  | 'AUDIT_TIMELINE';

import { useAppStore } from '../../stores/app-store';
import { Loader2 } from 'lucide-react';

export function CityResponseReadinessWorkspace() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<ResponseTab>('RESPONSE_READINESS');
  const [selectedReadinessId, setSelectedReadinessId] = useState<string>('resp-readiness-101');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authorizedDecision, setAuthorizedDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const handleAuthorizeExecution = async (decision: 'APPROVED' | 'REJECTED' = 'APPROVED') => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/digital-twin/response-readiness/${selectedReadinessId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          operatorNotes: `Human operator recorded decision '${decision}' for response readiness plan.`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setAuthorizedDecision(decision);
        const msg = `Execution readiness plan ${decision.toLowerCase()} by human operator. Recorded in immutable PIOS audit ledger.`;
        setStatusMessage(msg);
        addToast({
          title: `Readiness Plan ${decision}`,
          message: msg,
          type: 'success',
        });
      } else {
        const errorMsg = json.error || `Server rejected authorization request with status ${res.status}`;
        addToast({
          title: 'Authorization Failed',
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Network Error',
        message: err.message || 'Failed to submit response readiness authorization.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 gap-6 font-sans">
      {/* Governance & Safety Banner */}
      <div className="flex items-center justify-between bg-blue-950/60 border border-blue-500/40 rounded-lg p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-md text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide text-white text-base">RESPONSE EXECUTION READINESS & MONITORING</span>
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                EXECUTION READINESS MODE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                PROVENANCE VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Advisory execution readiness, monitoring & outcome intelligence — Autonomous physical, municipal, or infrastructure execution is STRICTLY FORBIDDEN.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-3 py-1 rounded font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            HUMAN AUTHORIZATION REQUIRED
          </span>
          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded font-semibold">
            ADVISORY — NO AUTONOMOUS EXECUTION
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-400" />
            Execution Readiness & Outcome Monitoring Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluates readiness checks, monitors live signals, compares expected vs observed outcomes, classifies deviations, and generates operator escalation recommendations.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ESCALATION_PANEL')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 transition"
          >
            <UserCheck className="w-4 h-4" />
            Operator Authorization Gateway
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs p-3 rounded flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs">
        {(
          [
            ['RESPONSE_READINESS', 'Section A: Response Readiness'],
            ['READINESS_CHECKS', 'Section B: Readiness Checks'],
            ['MONITORING_PANEL', 'Section C: Monitoring Panel'],
            ['EXPECTED_VS_OBSERVED', 'Section D: Expected vs Observed'],
            ['DEVIATION_PANEL', 'Section E: Deviation Panel'],
            ['ESCALATION_PANEL', 'Section F: Escalation Panel'],
            ['AUDIT_TIMELINE', 'Section G: Audit Timeline'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-t-md font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Section A: Response Readiness */}
        {activeTab === 'RESPONSE_READINESS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Readiness Score</span>
                <div className="text-3xl font-extrabold text-blue-400 mt-1">85 / 100</div>
                <p className="text-slate-400 mt-2">CONDITIONALLY_READY Classification</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Authorization Status</span>
                <div className="text-lg font-bold text-amber-400 mt-2 flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5" /> AWAITING_AUTHORIZATION
                </div>
                <p className="text-slate-400 mt-2">Human operator review required</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Provenance Verified</span>
                <div className="text-lg font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5" /> EXECUTION_READINESS
                </div>
                <p className="text-slate-400 mt-2">Verified telemetry stream</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Active Monitoring State</span>
                <div className="text-lg font-bold text-teal-400 mt-2 flex items-center gap-1.5">
                  <Eye className="w-5 h-5" /> MONITORING
                </div>
                <p className="text-slate-400 mt-2">3 Live signal feeds active</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-3">
              <h2 className="text-sm font-bold text-white">Readiness Score Dimension Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Resource Readiness</span>
                  <div className="text-lg font-bold text-blue-400 mt-1">80%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Dependency Readiness</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">90%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Safety Readiness</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">85%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Budget Readiness</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">100%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Data Availability</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">70% (DATA_UNAVAILABLE)</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold">Authorization State</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">100% (GOVERNED)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Readiness Checks */}
        {activeTab === 'READINESS_CHECKS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Execution Readiness Checks Summary</h2>
            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Resource Allocation Check</span>
                  <p className="text-slate-400">Engineering standby crew assigned (4/4 staff)</p>
                </div>
                <span className="px-2 py-1 bg-emerald-950 text-emerald-300 font-bold rounded">RESOURCE_READY (PASSED)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Generator Telemetry Check</span>
                  <p className="text-slate-400">Mobile generator inventory status unverified</p>
                </div>
                <span className="px-2 py-1 bg-amber-950 text-amber-300 font-bold rounded">DATA_UNAVAILABLE</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Prerequisite Action Dependency Check</span>
                  <p className="text-slate-400">Substation 4B main switch gear isolation confirmed</p>
                </div>
                <span className="px-2 py-1 bg-emerald-950 text-emerald-300 font-bold rounded">DEPENDENCY_READY (PASSED)</span>
              </div>
            </div>
          </div>
        )}

        {/* Section C: Monitoring Panel */}
        {activeTab === 'MONITORING_PANEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Active Response Monitoring Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-400">FLOOD_REDUCTION</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-bold rounded">LIVE_TELEMETRY</span>
                </div>
                <div className="text-2xl font-extrabold text-white">25 / 31 <span className="text-xs text-slate-400 font-normal">POINTS</span></div>
                <p className="text-slate-400">Confidence: 88%</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">ROAD_REOPENING</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold rounded">SIMULATION</span>
                </div>
                <div className="text-2xl font-extrabold text-white">80 / 100 <span className="text-xs text-slate-400 font-normal">%</span></div>
                <p className="text-slate-400">Confidence: 90%</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-400">POPULATION_IMPACT</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold rounded">ESTIMATION</span>
                </div>
                <div className="text-2xl font-extrabold text-white">10,500 / 12,000 <span className="text-xs text-slate-400 font-normal">CITIZENS</span></div>
                <p className="text-slate-400">Confidence: 85%</p>
              </div>
            </div>
          </div>
        )}

        {/* Section D: Expected vs Observed */}
        {activeTab === 'EXPECTED_VS_OBSERVED' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Expected vs Observed Outcome Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-3">Metric</th>
                    <th className="p-3">Expected Target</th>
                    <th className="p-3">Observed Telemetry</th>
                    <th className="p-3">Deviation Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-white">Risk Reduction</td>
                    <td className="p-3">31 points</td>
                    <td className="p-3">25 points</td>
                    <td className="p-3 font-bold text-amber-400">-6 points</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">Population Benefit</td>
                    <td className="p-3">12,000 citizens</td>
                    <td className="p-3">10,500 citizens</td>
                    <td className="p-3 font-bold text-amber-400">-1,500 citizens</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">Service Recovery Time</td>
                    <td className="p-3">90 minutes</td>
                    <td className="p-3">125 minutes</td>
                    <td className="p-3 font-bold text-rose-400">+35 minutes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">Infrastructure Downtime</td>
                    <td className="p-3">45 minutes</td>
                    <td className="p-3">60 minutes</td>
                    <td className="p-3 font-bold text-rose-400">+15 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section E: Deviation Panel */}
        {activeTab === 'DEVIATION_PANEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Outcome Deviation Intelligence</h2>
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400 text-sm">MODERATE DEVIATION DETECTED</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">UTILITY DOMAIN</span>
              </div>
              <p className="text-slate-300">
                Observed risk reduction is 6 points lower than target (31 pts expected vs 25 pts observed). Service recovery delayed by 35 minutes due to elevated stormwater inflow.
              </p>
            </div>
          </div>
        )}

        {/* Section F: Escalation Panel */}
        {activeTab === 'ESCALATION_PANEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Advisory Escalation & Authorization Gateway</h2>
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded space-y-2 text-rose-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-400 text-sm">ESCALATION LEVEL: MEDIUM</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded">OPERATOR REVIEW REQUIRED</span>
              </div>
              <p>
                Reason: Service recovery time exceeded expected target by 35 minutes. Operator review required for auxiliary pump deployment authorization.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleAuthorizeExecution('APPROVED')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {authorizedDecision === 'APPROVED' ? 'Readiness Plan Authorized' : 'Authorize Readiness Plan'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleAuthorizeExecution('REJECTED')}
                className="px-6 py-2.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {authorizedDecision === 'REJECTED' ? 'Readiness Plan Rejected' : 'Reject Plan'}
              </button>
            </div>
          </div>
        )}

        {/* Section G: Audit Timeline */}
        {activeTab === 'AUDIT_TIMELINE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-xs space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Immutable Accountability Audit Ledger</h2>
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold">STATUS_MONITORING</span>
                  <p className="text-slate-400">User: usr-op-1 | Assessment: resp-readiness-101</p>
                </div>
                <span className="text-slate-500">2026-08-17 17:30:00</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-blue-400 font-bold">READINESS_ASSESSMENT_CREATED</span>
                  <p className="text-slate-400">User: SYSTEM_ORCHESTRATOR | Title: Substation 4B Response</p>
                </div>
                <span className="text-slate-500">2026-08-17 17:28:00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
