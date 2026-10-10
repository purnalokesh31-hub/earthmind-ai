'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Citywide Resilience Readiness & Operational Preparedness Workspace
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
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

type PreparednessTab =
  | 'OVERVIEW'
  | 'DOMAINS'
  | 'RESOURCE_READINESS'
  | 'CAPABILITY_GAPS'
  | 'PREPAREDNESS_OPTIONS'
  | 'COMPARISON_MATRIX'
  | 'RECOMMENDATIONS'
  | 'AUTHORIZATION_PANEL'
  | 'AUDIT_TIMELINE';

export function CityResilienceReadinessWorkspace() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<PreparednessTab>('OVERVIEW');
  const [selectedReadinessId, setSelectedReadinessId] = useState<string>('res-readiness-101');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authorizedDecision, setAuthorizedDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const handleApproveStrategy = async (decision: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/digital-twin/resilience/readiness/${selectedReadinessId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          operatorNotes: `Operator recorded decision '${decision}' for balanced resilience readiness strategy.`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setAuthorizedDecision(decision);
        const msg = `Balanced resilience readiness strategy ${decision.toLowerCase()} by human operator. Recorded in immutable resilience audit log.`;
        setStatusMessage(msg);
        addToast({
          title: `Resilience Plan ${decision}`,
          message: msg,
          type: 'success',
        });
      } else {
        const errorMsg = json.error || `Server rejected request with status ${res.status}`;
        addToast({
          title: 'Authorization Failed',
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Network Error',
        message: err.message || 'Failed to submit resilience authorization to server.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 gap-6 font-sans">
      {/* Safety & Governance Banner */}
      <div className="flex items-center justify-between bg-amber-950/60 border border-amber-500/40 rounded-lg p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-md text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide text-white text-base">CITY RESILIENCE READINESS</span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                RESILIENCE PREPAREDNESS MODE
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                SIMULATION DATA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Advisory preparedness & capability gap intelligence — Physical deployment, emergency activation, or crew dispatch is NEVER executed automatically.
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
            <Activity className="w-7 h-7 text-amber-400" />
            Citywide Preparedness & Resilience Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluates domain readiness scores, detects resource gaps, generates advisory preparedness strategies, and compares population protection metrics.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('AUTHORIZATION_PANEL')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 transition"
          >
            <UserCheck className="w-4 h-4" />
            Authorize Preparedness Plan
          </button>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs p-3 rounded flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs">
        {(
          [
            ['OVERVIEW', 'Readiness Overview'],
            ['DOMAINS', 'Domain Preparedness (6)'],
            ['RESOURCE_READINESS', 'Resource Readiness'],
            ['CAPABILITY_GAPS', 'Capability Gaps (2)'],
            ['PREPAREDNESS_OPTIONS', 'Preparedness Options'],
            ['COMPARISON_MATRIX', 'Comparison Matrix'],
            ['RECOMMENDATIONS', 'Advisory Recommendation'],
            ['AUTHORIZATION_PANEL', 'Human Authorization'],
            ['AUDIT_TIMELINE', 'Audit Timeline'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-t-md font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Overall City Readiness Score</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-1">74%</div>
                <p className="text-slate-400 mt-2">MODERATE Preparedness State</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Critical Domain Readiness</span>
                <div className="text-3xl font-extrabold text-rose-400 mt-1">68%</div>
                <p className="text-slate-400 mt-2">Climate & Utility gaps detected</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Resource Readiness</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">72%</div>
                <p className="text-slate-400 mt-2">2 Crew Shortages, 1 UNKNOWN status</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <span className="text-slate-400 font-semibold">Response Capability</span>
                <div className="text-3xl font-extrabold text-blue-400 mt-1">82%</div>
                <p className="text-slate-400 mt-2">Emergency teams on standby</p>
              </div>
            </div>

            {/* 6 Preparedness Domain Cards */}
            <div>
              <h2 className="text-sm font-bold text-white mb-3">Preparedness Domains Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-blue-400" /> CLIMATE
                    </span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 font-bold rounded">VULNERABLE (65%)</span>
                  </div>
                  <p className="text-slate-400">Monsoon flood basin accumulation vulnerability.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> UTILITY
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold rounded">MODERATE (72%)</span>
                  </div>
                  <p className="text-slate-400">Substation 4B pump readiness adequate.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-400" /> EMERGENCY RESPONSE
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded">HIGH (82%)</span>
                  </div>
                  <p className="text-slate-400">Rapid evacuation teams standby optimal.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" /> MOBILITY
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold rounded">MODERATE (78%)</span>
                  </div>
                  <p className="text-slate-400">Traffic bypass corridor readiness validated.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Bus className="w-4 h-4 text-teal-400" /> TRANSIT
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded">HIGH (80%)</span>
                  </div>
                  <p className="text-slate-400">Rerouting schedule readiness optimal.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-400" /> CITIZEN INTELLIGENCE
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded">HIGH (82%)</span>
                  </div>
                  <p className="text-slate-400">Early warning notification system ready.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'COMPARISON_MATRIX' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Preparedness Strategy Option Comparison Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-3">Strategy</th>
                    <th className="p-3">Risk Reduction</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Preparation Time</th>
                    <th className="p-3">Population Protection</th>
                    <th className="p-3">Recommendation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  <tr className="bg-emerald-950/20">
                    <td className="p-3 font-bold text-emerald-400">BALANCED_READINESS</td>
                    <td className="p-3">High (68%)</td>
                    <td className="p-3">Medium ($18,500)</td>
                    <td className="p-3">Low (90m)</td>
                    <td className="p-3">High (78%)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">RECOMMENDED</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">MAXIMIZE_RESPONSE_CAPABILITY</td>
                    <td className="p-3">Very High (88%)</td>
                    <td className="p-3">High ($42,000)</td>
                    <td className="p-3">Medium (150m)</td>
                    <td className="p-3">Very High (92%)</td>
                    <td className="p-3 text-slate-500">ADVISORY OPTION</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-400">MINIMIZE_PREPAREDNESS_COST</td>
                    <td className="p-3">Medium (45%)</td>
                    <td className="p-3">Low ($8,500)</td>
                    <td className="p-3">Low (45m)</td>
                    <td className="p-3">Moderate (60%)</td>
                    <td className="p-3 text-slate-500">ADVISORY OPTION</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'AUTHORIZATION_PANEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Human Operator Authorization Gateway
            </h2>
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded space-y-2 text-amber-300">
              <p className="font-semibold">
                Authorization of the Recommended Preparedness Plan (BALANCED_READINESS) records an auditable human decision in the PIOS ledger. Real-world crew movement remains under manual operator control.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                disabled={isSubmitting}
                      onClick={() => handleApproveStrategy('APPROVED')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {authorizedDecision === 'APPROVED' ? 'Strategy Authorized' : 'Authorize Balanced Strategy'}
              </button>
              <button
                disabled={isSubmitting}
                      onClick={() => handleApproveStrategy('REJECTED')}
                className="px-6 py-2.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {authorizedDecision === 'REJECTED' ? 'Recommendation Rejected' : 'Reject Recommendation'}
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'OVERVIEW' && activeTab !== 'COMPARISON_MATRIX' && activeTab !== 'AUTHORIZATION_PANEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-slate-300 text-xs">
            <h2 className="text-base font-bold text-white mb-2">{activeTab.replace('_', ' ')} Section</h2>
            <p className="text-slate-400">
              Displaying active resilience preparedness data for assessment <span className="font-mono text-amber-400">{selectedReadinessId}</span>. All recommendations require explicit human operator authorization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
