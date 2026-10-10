'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Real-Time Situation Awareness & Decision Support Workspace
// Integrated Geographic Scope Selector, Predictive Forecast & Human Controls
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CommandCenterKpis } from '../command-center/CommandCenterKpis';
import { CommandCenterIncidentTable } from '../command-center/CommandCenterIncidentTable';
import { CommandCenterDetailWorkspace } from '../command-center/CommandCenterDetailWorkspace';
import { LiveCommandMap } from '../command-center/LiveCommandMap';
import { LiveActivityFeed } from '../command-center/LiveActivityFeed';
import { SlaCountdownMonitor } from '../command-center/SlaCountdownMonitor';
import { OperationalAnalyticsPanel } from '../command-center/OperationalAnalyticsPanel';
import { CommandCenterErrorBoundary } from '../command-center/CommandCenterErrorBoundary';
import { GeographicScopeSelector } from '../command-center/GeographicScopeSelector';
import { CityComparisonModal } from '../command-center/CityComparisonModal';
import { PredictiveWorkspace } from '../command-center/PredictiveWorkspace';
import { CityPredictiveIntelligenceWorkspace } from '../command-center/CityPredictiveIntelligenceWorkspace';
import { CityPredictiveSimulationWorkspace } from '../command-center/CityPredictiveSimulationWorkspace';
import { CityPredictiveScenarioWorkspace } from '../command-center/CityPredictiveScenarioWorkspace';
import { CityDecisionOptimizationWorkspace } from '../command-center/CityDecisionOptimizationWorkspace';
import { DecisionSupportPanel } from '../command-center/DecisionSupportPanel';
import { GeographicScopeLevel } from '../../lib/server/domain/geography.domain';
import {
  CommandCenterKpiDto,
  CommandCenterIncidentItemDto,
  CommandCenterWorkspaceDetailDto,
} from '../../lib/server/dto/command-center.dto';

export default function IncidentsPage() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'LIVE' | 'PREDICTIVE' | 'SIMULATION' | 'SCENARIOS' | 'OPTIMIZATION'>('LIVE');
  const [currentScope, setCurrentScope] = useState<GeographicScopeLevel>('CITY');
  const [selectedCityName, setSelectedCityName] = useState('Vijayawada');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [kpis, setKpis] = useState<CommandCenterKpiDto>({
    activeIncidents: 12,
    criticalIncidents: 2,
    pendingDispatches: 3,
    activeOfficers: 14,
    slaBreaches: 1,
    escalatedIncidents: 2,
    resolvedToday: 28,
    activeMultiAgencyOps: 3,
    timestamp: new Date().toISOString(),
  });

  const [incidents, setIncidents] = useState<CommandCenterIncidentItemDto[]>([
    {
      id: 'inc-101',
      incidentCode: 'EM-INC-2026-001',
      title: 'Severe Road Subsidence — NH-9 Junction',
      category: 'infrastructure',
      severity: 'CRITICAL',
      riskScore: 94,
      status: 'DISPATCHED',
      assignedOfficerName: 'Capt. Rajesh Varma',
      assignedOfficerId: 'usr-off-101',
      departmentName: 'Public Works Department',
      departmentId: 'dept-pwd-1',
      slaStatus: 'WARNING',
      acknowledgementDeadline: new Date(Date.now() + 10 * 60000).toISOString(),
      responseDeadline: new Date(Date.now() + 90 * 60000).toISOString(),
      locationName: 'Ward 12, Benz Circle Junction',
      latitude: 16.5060,
      longitude: 80.6350,
      dispatchId: 'disp-101',
      escalationLevel: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc-102',
      incidentCode: 'EM-INC-2026-002',
      title: 'Municipal Water Main Breach & Urban Flood',
      category: 'water',
      severity: 'HIGH',
      riskScore: 78,
      status: 'ACKNOWLEDGED',
      assignedOfficerName: 'Insp. Ananya Rao',
      assignedOfficerId: 'usr-off-102',
      departmentName: 'Water Supply Board',
      departmentId: 'dept-wsb-1',
      slaStatus: 'NORMAL',
      acknowledgementDeadline: new Date(Date.now() + 25 * 60000).toISOString(),
      responseDeadline: new Date(Date.now() + 180 * 60000).toISOString(),
      locationName: 'Ward 14, Bandar Road Sector 4',
      latitude: 16.5085,
      longitude: 80.6412,
      dispatchId: 'disp-102',
      escalationLevel: 0,
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('inc-101');
  const [workspaceDetail, setWorkspaceDetail] = useState<CommandCenterWorkspaceDetailDto | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/command-center/kpis', { signal: controller.signal })
      .then((res) => res.json())
      .then((res) => {
        if (!controller.signal.aborted && res.data) setKpis(res.data);
      })
      .catch(() => {});

    fetch('/api/v1/command-center/incidents', { signal: controller.signal })
      .then((res) => res.json())
      .then((res) => {
        if (!controller.signal.aborted && res.data) setIncidents(res.data);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedIncidentId) return;
    const controller = new AbortController();

    fetch(`/api/v1/command-center/incidents/${selectedIncidentId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((res) => {
        if (!controller.signal.aborted && res.data) setWorkspaceDetail(res.data);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [selectedIncidentId]);

  const filteredIncidents = incidents.filter((i) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || i.title.toLowerCase().includes(q) || i.incidentCode.toLowerCase().includes(q) || i.locationName.toLowerCase().includes(q);
    const matchSev = severityFilter === 'all' || i.severity === severityFilter;
    const matchCat = categoryFilter === 'all' || i.category === categoryFilter;
    return matchSearch && matchSev && matchCat;
  });

  return (
    <CommandCenterErrorBoundary>
      <div className="flex flex-col h-full bg-[#050B14] p-4 lg:p-6 overflow-y-auto space-y-6">
        {/* Top Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>🌍 Situation Awareness & Decision Support Workspace</span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                ● LIVE SYNC
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Integrated real-time operational situation awareness, predictive forecasting, and advisory decision controls.
            </p>
          </div>

          {/* Workspace Tab Toggle */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0B1528] p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveWorkspaceTab('LIVE')}
              className={`px-3 py-1.5 font-mono text-xs rounded-lg transition ${
                activeWorkspaceTab === 'LIVE'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📡 Live Operations
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('PREDICTIVE')}
              className={`px-3 py-1.5 font-mono text-xs rounded-lg transition ${
                activeWorkspaceTab === 'PREDICTIVE'
                  ? 'bg-purple-600/30 text-purple-200 font-bold border border-purple-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔮 Predictive Risk
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('SIMULATION')}
              className={`px-3 py-1.5 font-mono text-xs rounded-lg transition ${
                activeWorkspaceTab === 'SIMULATION'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧪 Simulations
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('SCENARIOS')}
              className={`px-3 py-1.5 font-mono text-xs rounded-lg transition ${
                activeWorkspaceTab === 'SCENARIOS'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📐 Counterfactuals
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('OPTIMIZATION')}
              className={`px-3 py-1.5 font-mono text-xs rounded-lg transition ${
                activeWorkspaceTab === 'OPTIMIZATION'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Decision Optimization
            </button>
          </div>
        </div>

        {/* Geographic Scope Selector Bar */}
        <GeographicScopeSelector
          currentScope={currentScope}
          onScopeChange={(s) => setCurrentScope(s)}
          selectedCityName={selectedCityName}
          onCityChange={(c) => setSelectedCityName(c)}
          onOpenCompare={() => setIsCompareOpen(true)}
        />

        {/* Operational KPI Cards */}
        <CommandCenterKpis kpis={kpis} />

        {/* Workspace Tab Content */}
        {activeWorkspaceTab === 'LIVE' ? (
          <>
            {/* Decision Support Human Authorization Panel */}
            <DecisionSupportPanel />

            {/* Grid Section 1: Live GIS Command Map & SLA Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
              <div className="lg:col-span-8">
                <LiveCommandMap
                  incidents={incidents}
                  selectedId={selectedIncidentId}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <SlaCountdownMonitor
                  incidents={incidents}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                />
              </div>
            </div>

            {/* Grid Section 2: Operations Queue Table & Workspace / Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
              <div className="lg:col-span-7">
                <CommandCenterIncidentTable
                  incidents={filteredIncidents}
                  selectedId={selectedIncidentId}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                  searchTerm={searchTerm}
                  onSearchChange={(val) => setSearchTerm(val)}
                  severityFilter={severityFilter}
                  onSeverityChange={(val) => setSeverityFilter(val)}
                  categoryFilter={categoryFilter}
                  onCategoryChange={(val) => setCategoryFilter(val)}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6">
                {workspaceDetail ? (
                  <CommandCenterDetailWorkspace
                    detail={workspaceDetail}
                    onClose={() => setSelectedIncidentId(null)}
                    onAcknowledge={(dispId) => {
                      fetch(`/api/v1/dispatch/${dispId}/acknowledge`, { method: 'POST' });
                    }}
                    onEscalate={(dispId) => {
                      fetch(`/api/v1/dispatch/${dispId}/escalate`, { method: 'POST' });
                    }}
                  />
                ) : (
                  <LiveActivityFeed onSelectIncident={(id) => setSelectedIncidentId(id)} />
                )}
              </div>
            </div>

            {/* Grid Section 3: Operational Analytics & Health Panel */}
            <OperationalAnalyticsPanel />
          </>
        ) : activeWorkspaceTab === 'PREDICTIVE' ? (
          <div className="space-y-6">
            <CityPredictiveIntelligenceWorkspace />
            <PredictiveWorkspace />
          </div>
        ) : activeWorkspaceTab === 'SIMULATION' ? (
          <CityPredictiveSimulationWorkspace />
        ) : activeWorkspaceTab === 'SCENARIOS' ? (
          <CityPredictiveScenarioWorkspace />
        ) : (
          <CityDecisionOptimizationWorkspace />
        )}
      </div>

      {/* City Comparison Matrix Modal */}
      <CityComparisonModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
    </CommandCenterErrorBoundary>
  );
}
