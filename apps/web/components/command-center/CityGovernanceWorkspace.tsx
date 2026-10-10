'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// Command Center City Governance Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  Settings,
  Scale,
  Zap,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

type GovernanceTab =
  | 'OVERVIEW'
  | 'POLICIES'
  | 'RISK_THRESHOLDS'
  | 'CONFIDENCE'
  | 'VIOLATIONS'
  | 'ESCALATIONS'
  | 'AUTHORIZATION'
  | 'PROVENANCE'
  | 'EVALUATIONS'
  | 'AUDIT'
  | 'OVERRIDES';

export function CityGovernanceWorkspace() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<GovernanceTab>('OVERVIEW');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('pol-gov-human-auth');
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  const handleConfirmOverride = async () => {
    setIsSubmittingOverride(true);
    try {
      const res = await fetch('/api/v1/digital-twin/governance/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: selectedPolicyId, reason: overrideReason }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        addToast({
          title: 'Override Recorded',
          message: `Override ${json.data?.overrideId || ''} recorded for policy ${selectedPolicyId}.`,
          type: 'success',
        });
        setShowOverrideModal(false);
        setOverrideReason('');
      } else {
        addToast({
          title: 'Override Not Recorded',
          message: json.error || 'The server rejected this override request.',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({ title: 'Network Error', message: err.message || 'Failed to submit override.', type: 'error' });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 gap-6 font-sans">
      {/* Permanent Enterprise Safety Banner */}
      <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-md text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide text-white text-base">GOVERNANCE MODE</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                POLICY ENFORCEMENT ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              EarthMind PIOS Intelligence Governance Engine — Mandatory Human Authorization & Safety Boundary Policy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            HUMAN AUTHORIZATION REQUIRED
          </span>
          <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs px-3 py-1 rounded font-semibold">
            ADVISORY — NO AUTONOMOUS EXECUTION
          </span>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-emerald-400" />
            Citywide Intelligence Governance & Policy Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise policy validation, risk threshold classification, confidence guardrails, human authorization mapping, and advisory escalation.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOverrideModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            Controlled Policy Override
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs">
        {(
          [
            ['OVERVIEW', 'Governance Overview'],
            ['POLICIES', 'Active Policies'],
            ['RISK_THRESHOLDS', 'Risk Thresholds'],
            ['CONFIDENCE', 'Confidence Status'],
            ['VIOLATIONS', 'Policy Violations'],
            ['ESCALATIONS', 'Escalation Queue'],
            ['AUTHORIZATION', 'Authorization Rules'],
            ['PROVENANCE', 'Provenance Chain'],
            ['EVALUATIONS', 'Policy Evaluations'],
            ['AUDIT', 'Audit Timeline'],
            ['OVERRIDES', 'Override Panel'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-t-md font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-xs font-semibold">Governance System Health</span>
                <span className="text-emerald-400 text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">HEALTHY</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">2 Active Policies</div>
              <p className="text-xs text-slate-400">100% policy enforcement compliance. Mandatory human authorization enforced across all operational paths.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-xs font-semibold">Active Violations</span>
                <span className="text-emerald-400 text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">0 BLOCKING</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">0 Violations</div>
              <p className="text-xs text-slate-400">No active policy violations blocking intelligence progression or intervention planning.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-xs font-semibold">Advisory Escalation Queue</span>
                <span className="text-blue-400 text-xs bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">ACTIVE</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">1 Escalation</div>
              <p className="text-xs text-slate-400">1 high-risk intervention plan awaiting City Commander review & authorization.</p>
            </div>
          </div>
        )}

        {activeTab === 'POLICIES' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-3">Enforced Governance Policies</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Mandatory Human Authorization Safety Policy</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded">ACTIVE (v1)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Requires human operator sign-off for all intervention recommendations.</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">ID: pol-gov-human-auth</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Enterprise Risk Threshold & Classification Policy</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded">ACTIVE (v1)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Classifies multi-domain score risk tiers (Low, Guarded, Elevated, High, Critical).</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">ID: pol-gov-risk-tiering</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'RISK_THRESHOLDS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">Risk Threshold & Role Mapping Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded">
                <span className="font-bold text-emerald-400">LOW (0–20)</span>
                <p className="text-slate-300 mt-1">Role: OPERATOR</p>
              </div>
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded">
                <span className="font-bold text-blue-400">GUARDED (21–40)</span>
                <p className="text-slate-300 mt-1">Role: SENIOR_OPERATOR</p>
              </div>
              <div className="p-3 bg-yellow-950/40 border border-yellow-500/30 rounded">
                <span className="font-bold text-yellow-400">ELEVATED (41–60)</span>
                <p className="text-slate-300 mt-1">Role: DOMAIN_MANAGER</p>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded">
                <span className="font-bold text-amber-400">HIGH (61–80)</span>
                <p className="text-slate-300 mt-1">Role: CITY_COMMANDER</p>
              </div>
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded">
                <span className="font-bold text-rose-400">CRITICAL (81–100)</span>
                <p className="text-slate-300 mt-1">Role: EMERGENCY_COMMANDER</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'AUTHORIZATION' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-lg font-bold text-white mb-2">Human Authorization Requirement Policy</h2>
            <p className="text-xs text-slate-300">
              The Governance Engine determines required authorization levels based on impact severity and domain cascades. Autonomous consequential execution remains strictly prohibited.
            </p>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Minimum Approval Requirement:</span>
                <span className="text-emerald-400 font-mono">requiresHumanApproval: true (Mandatory)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dual Sign-Off Trigger:</span>
                <span className="text-amber-400 font-mono">HIGH/CRITICAL Risk or Multi-Domain Cascades</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROVENANCE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-lg font-bold text-white mb-2">Data Provenance Chain</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="p-2 bg-slate-800 rounded border border-slate-700">PREDICTION</span>
              <span>→</span>
              <span className="p-2 bg-slate-800 rounded border border-slate-700">SIMULATION</span>
              <span>→</span>
              <span className="p-2 bg-slate-800 rounded border border-slate-700">DECISION_INTELLIGENCE</span>
              <span>→</span>
              <span className="p-2 bg-slate-800 rounded border border-slate-700">INTERVENTION_PLANNING</span>
              <span>→</span>
              <span className="p-2 bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded font-bold">GOVERNANCE</span>
            </div>
          </div>
        )}

        {(activeTab === 'CONFIDENCE' ||
          activeTab === 'VIOLATIONS' ||
          activeTab === 'ESCALATIONS' ||
          activeTab === 'EVALUATIONS' ||
          activeTab === 'AUDIT' ||
          activeTab === 'OVERRIDES') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-slate-300 text-xs">
            <h2 className="text-base font-bold text-white mb-2">{activeTab.replace('_', ' ')} Detail View</h2>
            <p className="text-slate-400">Displaying active {activeTab.toLowerCase()} entries and governance logs. All records preserve explicit provenance and mandatory human approval controls.</p>
          </div>
        )}
      </div>

      {/* Controlled Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              Controlled Policy Override Gateway
            </div>
            <p className="text-xs text-slate-300">
              Overrides allow authorized senior operators to override non-safety policy constraints. Mandatory human approval (`requiresHumanApproval: true`) CANNOT be overridden.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Justification & Reason:</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter mandatory operational justification for override..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={!overrideReason.trim() || isSubmittingOverride}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                {isSubmittingOverride && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmittingOverride ? 'Recording...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
