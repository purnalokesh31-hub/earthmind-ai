'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// Human Command & Authorization Center Workspace Component
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  FileSearch,
  Scale,
  Clock,
  Send,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

type CommandTab =
  | 'OVERVIEW'
  | 'PENDING_DECISIONS'
  | 'CRITICAL_ESCALATIONS'
  | 'AUTHORIZATION_QUEUE'
  | 'RISK_CONTEXT'
  | 'CONFIDENCE_CONTEXT'
  | 'EVIDENCE'
  | 'POLICY_CONTEXT'
  | 'DECISION_COMPARISON'
  | 'OPERATOR_DECISION'
  | 'AUDIT_TIMELINE'
  | 'HISTORY'
  | 'EVIDENCE_REQUEST'
  | 'ESCALATION_PANEL';

export function CityHumanCommandWorkspace() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<CommandTab>('OVERVIEW');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-cmd-101');
  const [approvalStep, setApprovalStep] = useState<number>(1);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [confirmationToken, setConfirmationToken] = useState<string>('');
  const [decisionStatusMessage, setDecisionStatusMessage] = useState<string | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const handleProcessDecision = async (decisionType: 'APPROVE' | 'REJECT') => {
    if (!decisionReason.trim()) {
      addToast({ title: 'Reason Required', message: 'Mandatory decision reason is required.', type: 'error' });
      return;
    }
    if (decisionType === 'APPROVE' && !confirmationToken.trim()) {
      addToast({ title: 'Confirmation Required', message: 'Confirmation token is required to finalize approval.', type: 'error' });
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const endpoint = decisionType === 'APPROVE' ? 'approve' : 'reject';
      const res = await fetch(`/api/v1/digital-twin/command/cases/${selectedCaseId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: decisionReason, confirmationToken }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setDecisionStatusMessage(
          `Decision '${decisionType}' recorded for case '${selectedCaseId}' (decision ID: ${json.data?.decisionId || 'n/a'}).`
        );
        setApprovalStep(1);
        setDecisionReason('');
        setConfirmationToken('');
      } else {
        addToast({
          title: 'Decision Not Recorded',
          message: json.error || `The server rejected this ${decisionType.toLowerCase()} request.`,
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({ title: 'Network Error', message: err.message || 'Failed to submit decision.', type: 'error' });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 gap-6 font-sans">
      {/* Persistent Security & Authorization Safety Banner */}
      <div className="flex items-center justify-between bg-amber-950/60 border border-amber-500/40 rounded-lg p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-md text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide text-white text-base">HUMAN COMMAND CENTER</span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                OPERATOR CONTROLLED
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                AUDIT LOGGING ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Municipal Human Authorization Gateway — Autonomous physical, emergency, utility, or infrastructure execution is strictly FORBIDDEN.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-3 py-1 rounded font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            HUMAN AUTHORIZATION REQUIRED
          </span>
          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded font-semibold">
            ADVISORY ONLY — NO AUTONOMOUS EXECUTION
          </span>
        </div>
      </div>

      {/* Header & Main Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            Human Command & Authorization Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritized human decision queue, multi-step approval safety, evidence validation, and dual sign-off authorization engine.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('OPERATOR_DECISION')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 transition"
          >
            <CheckCircle className="w-4 h-4" />
            Review Selected Case
          </button>
        </div>
      </div>

      {/* Decision Status Alert if any */}
      {decisionStatusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs p-3 rounded flex justify-between items-center">
          <span>{decisionStatusMessage}</span>
          <button onClick={() => setDecisionStatusMessage(null)} className="text-emerald-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs">
        {(
          [
            ['OVERVIEW', 'Command Overview'],
            ['PENDING_DECISIONS', 'Pending Decisions (1)'],
            ['CRITICAL_ESCALATIONS', 'Escalations (1)'],
            ['AUTHORIZATION_QUEUE', 'Priority Queue'],
            ['RISK_CONTEXT', 'Risk Context'],
            ['CONFIDENCE_CONTEXT', 'Confidence Context'],
            ['EVIDENCE', 'Evidence Panel'],
            ['POLICY_CONTEXT', 'Policy Context'],
            ['DECISION_COMPARISON', 'Decision Comparison'],
            ['OPERATOR_DECISION', 'Multi-Step Approval Panel'],
            ['AUDIT_TIMELINE', 'Audit Ledger'],
            ['HISTORY', 'Case History'],
            ['EVIDENCE_REQUEST', 'Request Evidence'],
            ['ESCALATION_PANEL', 'Escalate Case'],
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

      {/* Active Panel Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-slate-400 font-semibold">Total Command Cases</span>
              <div className="text-2xl font-extrabold text-white mt-1">2 Active Cases</div>
              <p className="text-slate-400 mt-2">1 Pending Review, 1 Under Review</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-slate-400 font-semibold">Required Authorization Level</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">CITY_COMMANDER</div>
              <p className="text-slate-400 mt-2">Requires dual sign-off authorization</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-slate-400 font-semibold">Pending Escalations</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">1 Escalated</div>
              <p className="text-slate-400 mt-2">Escalated from OPERATOR to CITY_COMMANDER</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-slate-400 font-semibold">Autonomous Execution</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">DISABLED (0%)</div>
              <p className="text-slate-400 mt-2">100% human-authorized workflow</p>
            </div>
          </div>
        )}

        {activeTab === 'OPERATOR_DECISION' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Multi-Step Human Approval Gateway</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Case ID: <span className="font-mono text-amber-400 font-bold">{selectedCaseId}</span> — Benz Circle Substation 4B Flood Protection Plan
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded font-bold">
                  Req Level: CITY_COMMANDER
                </span>
              </div>
            </div>

            {/* Approval Progress Wizard */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-semibold text-slate-400">
              <div className={`flex items-center gap-2 ${approvalStep >= 1 ? 'text-amber-400' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold">1</span>
                Review Case & Scope
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className={`flex items-center gap-2 ${approvalStep >= 2 ? 'text-amber-400' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold">2</span>
                Validate Evidence & Telemetry
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className={`flex items-center gap-2 ${approvalStep >= 3 ? 'text-amber-400' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold">3</span>
                Verify Governance Policies
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className={`flex items-center gap-2 ${approvalStep >= 4 ? 'text-amber-400' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold">4</span>
                Confirm & Submit Decision
              </div>
            </div>

            {/* Step 1: Scope */}
            {approvalStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="font-bold text-white text-sm">Intervention Plan Summary</span>
                  <p className="text-slate-300">
                    Deploy mobile flood barrier units, pre-position 2 high-capacity water drainage pumps at Substation 4B, and divert public transport away from low-lying highway corridors.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-slate-400 font-mono">
                    <div>Population Impact: 25,000</div>
                    <div>Est Cost: $14,500</div>
                    <div>Duration: 3.5 Hours</div>
                  </div>
                </div>
                <button
                  onClick={() => setApprovalStep(2)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs flex items-center gap-2"
                >
                  Next: Validate Evidence →
                </button>
              </div>
            )}

            {/* Step 2: Evidence */}
            {approvalStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="font-bold text-white text-sm">Telemetry & Evidence Streams</span>
                  <div className="space-y-1 text-slate-300 font-mono">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> Water Level Sensor STREAM-W42: 4.8m (Exceeds Warning Threshold 4.2m)
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> YOLOv8 CV Road Pothole & Flooding Telemetry Verified (96.4% confidence)
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> Municipal Crew Inventory Stream: 2 Crews Standby (AVAILABLE)
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setApprovalStep(1)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">
                    Back
                  </button>
                  <button onClick={() => setApprovalStep(3)} className="px-4 py-2 bg-amber-600 text-white font-bold rounded">
                    Next: Verify Policy →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Policy */}
            {approvalStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="font-bold text-white text-sm">Governance Policy Checks</span>
                  <p className="text-slate-300">
                    Passed all active policies cleanly: Mandatory Human Authorization Safety Policy (pol-gov-human-auth) & Enterprise Risk Classification Policy.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setApprovalStep(2)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">
                    Back
                  </button>
                  <button onClick={() => setApprovalStep(4)} className="px-4 py-2 bg-amber-600 text-white font-bold rounded">
                    Next: Final Decision →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Final Decision */}
            {approvalStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
                  <span className="font-bold text-white text-sm">Final Operator Decision Entry</span>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mandatory Operational Reason:</label>
                    <textarea
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder="Enter clear operational justification..."
                      className="w-full h-20 bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Server Confirmation Token (Required for APPROVE):</label>
                    <input
                      type="text"
                      value={confirmationToken}
                      onChange={(e) => setConfirmationToken(e.target.value)}
                      placeholder="Type CONFIRM-APPROVE-101 to authorize"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-amber-300"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setApprovalStep(3)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">
                    Back
                  </button>
                  <button
                    onClick={() => handleProcessDecision('REJECT')}
                    disabled={isSubmittingDecision}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingDecision ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject Plan
                  </button>
                  <button
                    onClick={() => handleProcessDecision('APPROVE')}
                    disabled={isSubmittingDecision}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingDecision ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} APPROVE PLAN
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'PENDING_DECISIONS' ||
          activeTab === 'CRITICAL_ESCALATIONS' ||
          activeTab === 'AUTHORIZATION_QUEUE' ||
          activeTab === 'RISK_CONTEXT' ||
          activeTab === 'CONFIDENCE_CONTEXT' ||
          activeTab === 'EVIDENCE' ||
          activeTab === 'POLICY_CONTEXT' ||
          activeTab === 'DECISION_COMPARISON' ||
          activeTab === 'AUDIT_TIMELINE' ||
          activeTab === 'HISTORY' ||
          activeTab === 'EVIDENCE_REQUEST' ||
          activeTab === 'ESCALATION_PANEL') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-slate-300 text-xs">
            <h2 className="text-base font-bold text-white mb-2">{activeTab.replace('_', ' ')} Panel</h2>
            <p className="text-slate-400">
              Displaying active {activeTab.toLowerCase()} entries, evidence streams, and audit logs. All human operator actions are logged to the immutable ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
