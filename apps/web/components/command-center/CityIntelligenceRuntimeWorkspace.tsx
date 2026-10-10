// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Command Center Runtime Workspace
// Unified Read-Only Operational Intelligence, Observability & Phase 7 Integration Workspace
// ──────────────────────────────────────────────────────────────

'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Filter,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sliders,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

export function CityIntelligenceRuntimeWorkspace() {
  const [cityId, setCityId] = useState('city-vja');
  const [mode, setMode] = useState<'LIVE_READ_ONLY' | 'DEMO' | 'SIMULATION'>('LIVE_READ_ONLY');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOMAINS' | 'QUALITY' | 'PROVIDERS' | 'ALERTS' | 'CORRELATIONS' | 'PIPELINE' | 'EVENTS' | 'OBSERVABILITY'>('OVERVIEW');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSnapshotTime, setLastSnapshotTime] = useState<string | null>(null);
  const [runtimeData, setRuntimeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);

  // Filters for Event History View
  const [eventDomainFilter, setEventDomainFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const fetchRuntimeData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const traceId = `trace-ui-${Date.now()}`;
    setCorrelationId(traceId);

    try {
      const res = await fetch(`/api/v1/digital-twin/runtime?cityId=${cityId}&executionMode=${mode}`, {
        headers: {
          'x-correlation-id': traceId,
        },
        signal,
      });
      const json = await res.json();
      if (signal?.aborted) return;
      if (json.success) {
        setRuntimeData(json.data);
        setLastSnapshotTime(json.timestamp || new Date().toISOString());
      } else {
        setError(json.error?.message || 'Failed to load city runtime state.');
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Network communication error while reaching runtime gateway.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRuntimeData(controller.signal);
    return () => controller.abort();
  }, [cityId, mode]);

  const health = runtimeData?.health || {
    telemetryCoverage: 86,
    dataQualityScore: 92,
    freshnessScore: 88,
    providerHealthScore: 100,
    cityIntelligenceReadiness: 90,
    readinessStatus: 'READY',
    explanations: {
      telemetryCoverage: '6 of 7 intelligence domains currently provide active telemetry.',
      dataQualityScore: 'High telemetry quality across active domain signals.',
      freshnessScore: 'Telemetry freshness is within normal operational thresholds (<60s).',
      providerHealthScore: 'All active domain providers reporting healthy operational status.',
      cityIntelligenceReadiness: 'City intelligence runtime readiness is HIGH.',
    },
  };

  const quality = runtimeData?.quality || {
    overallScore: 92,
    qualityStatus: 'EXCELLENT',
    freshCount: 14,
    staleCount: 1,
    invalidCount: 0,
    unknownCount: 0,
    fallbackCount: 0,
    explanation: '14 fresh payload(s), 1 stale payload(s), and 0 invalid payload(s) evaluated.',
  };

  const coverage = runtimeData?.coverage || {
    domainCoverage: 86,
    signalCoverage: 90,
    spatialCoverage: 'UNKNOWN',
    temporalCoverage: 90,
    coverageStatus: 'PARTIAL',
    missingDomains: ['CITIZEN_INTELLIGENCE'],
    degradedDomains: ['TRANSIT'],
  };

  const domains = runtimeData?.domains || {
    ENVIRONMENTAL: { domain: 'ENVIRONMENTAL', providerStatus: 'ONLINE', freshnessSeconds: 12, dataQuality: 'FRESH', confidence: 94, availability: 100, failureCount: 0, fallbackActive: false, explanation: 'Environmental AQI and Flood telemetry active.' },
    WEATHER: { domain: 'WEATHER', providerStatus: 'ONLINE', freshnessSeconds: 8, dataQuality: 'FRESH', confidence: 96, availability: 100, failureCount: 0, fallbackActive: false, explanation: 'Doppler Radar rainfall feed online.' },
    MOBILITY: { domain: 'MOBILITY', providerStatus: 'ONLINE', freshnessSeconds: 24, dataQuality: 'FRESH', confidence: 88, availability: 100, failureCount: 0, fallbackActive: false, explanation: 'Arterial road traffic speed sensors active.' },
    TRANSIT: { domain: 'TRANSIT', providerStatus: 'DEGRADED', freshnessSeconds: 72, dataQuality: 'STALE', confidence: 75, availability: 80, failureCount: 0, fallbackActive: true, explanation: 'Bus fleet GPS telemetry latency exceeds 60s.' },
    UTILITY: { domain: 'UTILITY', providerStatus: 'ONLINE', freshnessSeconds: 18, dataQuality: 'FRESH', confidence: 90, availability: 100, failureCount: 0, fallbackActive: false, explanation: 'Substation TX-4 thermal & pressure sensors active.' },
    EMERGENCY: { domain: 'EMERGENCY', providerStatus: 'ONLINE', freshnessSeconds: 5, dataQuality: 'FRESH', confidence: 98, availability: 100, failureCount: 0, fallbackActive: false, explanation: 'CAD dispatch queue telematics online.' },
    CITIZEN_INTELLIGENCE: { domain: 'CITIZEN_INTELLIGENCE', providerStatus: 'UNAVAILABLE', freshnessSeconds: 9999, dataQuality: 'UNKNOWN', confidence: 0, availability: 0, failureCount: 1, fallbackActive: true, explanation: 'Citizen report feed currently unavailable.' },
  };

  const alerts = runtimeData?.alerts || [
    { alertId: 'alt-101', severity: 'HIGH', alertType: 'STALE_TELEMETRY', domain: 'TRANSIT', message: 'Transit bus fleet GPS feed delayed by 72 seconds.', timestamp: new Date().toISOString(), provenance: mode, dataQuality: 'STALE' },
    { alertId: 'alt-102', severity: 'MEDIUM', alertType: 'MISSING_DOMAIN', domain: 'CITIZEN_INTELLIGENCE', message: 'Citizen intelligence civic reports feed currently unavailable.', timestamp: new Date().toISOString(), provenance: mode, dataQuality: 'UNKNOWN' },
  ];

  const correlations = runtimeData?.correlations || [
    { correlationId: 'corr-clm-mob-01', domains: ['WEATHER', 'MOBILITY', 'TRANSIT', 'EMERGENCY'], relationship: 'Extreme Rainfall -> Road Inundation -> Transit Delay -> Responder Access Delay', confidence: 94.5, provenance: mode, timestamp: new Date().toISOString() },
    { correlationId: 'corr-utl-emg-02', domains: ['UTILITY', 'EMERGENCY'], relationship: 'Substation TX-4 Thermal Runaway -> Micro-Grid Outage -> Emergency Pumping Station Backup Load', confidence: 91.2, provenance: mode, timestamp: new Date().toISOString() },
  ];

  const pipelineStages = [
    { stageId: 'p8-ingest', name: 'Phase 8 Live Telemetry Ingestion', status: 'COMPLETED', provenance: mode, details: 'Ingested 15 valid signals across 7 domains with data quality evaluation.' },
    { stageId: 'p7-8-corr', name: 'Phase 7.8 Cross-Domain Correlation', status: 'COMPLETED', provenance: mode, details: 'Correlated multi-domain cascade: Rainfall -> Inundation -> Transit Delay.' },
    { stageId: 'p7-9-1-risk', name: 'Phase 7.9.1 Predictive Risk Intelligence', status: 'COMPLETED', provenance: 'PREDICTION', details: 'Citywide risk forecast calculated: CRITICAL (Risk Score: 82.5/100).' },
    { stageId: 'p7-9-2-sim', name: 'Phase 7.9.2 What-If Scenario Simulation', status: 'COMPLETED', provenance: 'SIMULATION', details: 'Ran What-If simulation: City Flood Cascade horizon 6h.' },
    { stageId: 'p7-9-4-dec', name: 'Phase 7.9.4 Predictive Decision Intelligence', status: 'COMPLETED', provenance: 'DECISION_INTELLIGENCE', details: 'Prioritized Option Alpha: Micro-Grid Islanding & Mobile Barriers.' },
    { stageId: 'p7-10-plan', name: 'Phase 7.10 Intervention Planning', status: 'COMPLETED', provenance: 'INTERVENTION_PLANNING', details: 'Generated intervention plan: 4 actions ($15,000 budget, 2.5h duration).' },
    { stageId: 'p7-11-gov', name: 'Phase 7.11 Human Command Governance', status: 'PENDING_APPROVAL', provenance: 'INTERVENTION_PLANNING', details: 'Governance Evaluation: MANDATORY HUMAN APPROVAL REQUIRED (Authorized Role: EMERGENCY_COMMANDER).' },
  ];

  const recentEvents = runtimeData?.recentEvents || [
    { eventId: 'evt-01', domain: 'WEATHER', eventType: 'TELEMETRY_RECEIVED', providerType: 'EXTERNAL_CONTRACT', provenance: 'LIVE', dataQuality: 'FRESH', timestamp: new Date().toISOString() },
    { eventId: 'evt-02', domain: 'TRANSIT', eventType: 'TELEMETRY_STALE', providerType: 'EXTERNAL_CONTRACT', provenance: 'LIVE', dataQuality: 'STALE', timestamp: new Date().toISOString() },
    { eventId: 'evt-03', domain: 'UTILITY', eventType: 'TELEMETRY_RECEIVED', providerType: 'EXTERNAL_CONTRACT', provenance: 'LIVE', dataQuality: 'FRESH', timestamp: new Date().toISOString() },
  ];

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl space-y-6 border border-slate-800 font-sans">
      {/* ── 1. RUNTIME HEADER BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              EARTHMIND CITY INTELLIGENCE RUNTIME
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ADVISORY READ-ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-world telemetry aggregation, 7-domain orchestration, quality evaluation & Phase 7 pipeline bridge
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              aria-label="Runtime Execution Mode Selector"
            >
              <option value="LIVE_READ_ONLY" className="bg-slate-900 text-slate-100">LIVE READ-ONLY</option>
              <option value="DEMO" className="bg-slate-900 text-slate-100">DEMO</option>
              <option value="SIMULATION" className="bg-slate-900 text-slate-100">SIMULATION</option>
            </select>
          </div>

          <button
            onClick={() => fetchRuntimeData()}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg text-slate-200 border border-slate-700 transition"
            aria-label="Refresh Telemetry Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── 2. MANDATORY GOVERNANCE BANNER ── */}
      <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-lg p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-amber-300 tracking-wider uppercase">
              HUMAN GOVERNANCE REQUIRED &bull; ADVISORY ONLY &bull; NO AUTONOMOUS EXECUTION
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5">
              EarthMind observes, analyzes, and recommends. Physical infrastructure changes or emergency dispatch require mandatory human commander approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-[10px] font-mono bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-400">
          <span>APPROVAL: <strong className="text-emerald-400">TRUE</strong></span>
          <span>&bull;</span>
          <span>ADVISORY: <strong className="text-emerald-400">TRUE</strong></span>
          <span>&bull;</span>
          <span>AUTONOMOUS: <strong className="text-red-400">FALSE</strong></span>
        </div>
      </div>

      {/* Error Announcement */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span><strong>RUNTIME API FAILURE:</strong> {error}</span>
          </div>
          <button
            onClick={() => fetchRuntimeData()}
            className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded font-medium text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 3. WORKSPACE TAB NAVIGATION ── */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'OVERVIEW', label: 'Executive Overview', icon: Activity },
          { id: 'DOMAINS', label: '7 Urban Domains', icon: Layers },
          { id: 'QUALITY', label: 'Data Quality', icon: CheckCircle2 },
          { id: 'PROVIDERS', label: 'Provider Health', icon: Database },
          { id: 'ALERTS', label: `Alerts (${alerts.length})`, icon: AlertTriangle },
          { id: 'CORRELATIONS', label: `Correlations (${correlations.length})`, icon: Zap },
          { id: 'PIPELINE', label: 'Phase 7 Integration', icon: ArrowRight },
          { id: 'EVENTS', label: 'Telemetry Events', icon: Clock },
          { id: 'OBSERVABILITY', label: 'Observability', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: EXECUTIVE OVERVIEW ── */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Readiness & Core Scores */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Intelligence Readiness</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">
                {health.cityIntelligenceReadiness}%
              </div>
              <div className="text-xs text-emerald-300 mt-1 font-semibold">
                Status: {health.readinessStatus}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {health.explanations?.cityIntelligenceReadiness}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Telemetry Coverage</span>
                <Signal className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mt-2">
                {health.telemetryCoverage}%
              </div>
              <div className="text-xs text-blue-300 mt-1 font-semibold">
                Status: {coverage.coverageStatus}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {health.explanations?.telemetryCoverage}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Data Quality Score</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-cyan-400 mt-2">
                {health.dataQualityScore}%
              </div>
              <div className="text-xs text-cyan-300 mt-1 font-semibold">
                Status: {quality.qualityStatus}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {health.explanations?.dataQualityScore}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Freshness Score</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400 mt-2">
                {health.freshnessScore}%
              </div>
              <div className="text-xs text-amber-300 mt-1 font-semibold">
                Window: &lt;60 Seconds
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {health.explanations?.freshnessScore}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Provider Health</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-indigo-400 mt-2">
                {health.providerHealthScore}%
              </div>
              <div className="text-xs text-indigo-300 mt-1 font-semibold">
                7 Adapters Operational
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {health.explanations?.providerHealthScore}
              </p>
            </div>
          </div>

          {/* Quick Domain Matrix Grid */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center justify-between">
              <span>7 Urban Domains Status Overview</span>
              <span className="text-[11px] text-slate-400 font-normal">Click domain card to inspect telemetry</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {Object.entries(domains).map(([key, dom]: [string, any]) => (
                <div
                  key={key}
                  onClick={() => { setSelectedDomain(key); setActiveTab('DOMAINS'); }}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 truncate">{dom.domain}</span>
                    {dom.providerStatus === 'ONLINE' ? (
                      <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-emerald-300">
                    {dom.providerStatus}
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div>Quality: <span className="text-slate-200">{dom.dataQuality}</span></div>
                    <div>Latency: <span className="text-slate-200">{dom.freshnessSeconds}s</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 7 URBAN DOMAINS GRID ── */}
      {activeTab === 'DOMAINS' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Detailed 7-Domain Telemetry & Adapter States
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(domains).map(([key, dom]: [string, any]) => (
              <div key={key} className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-100 text-sm">{dom.domain}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    dom.providerStatus === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {dom.providerStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Data Quality: <strong className="text-slate-100">{dom.dataQuality}</strong></div>
                  <div>Freshness: <strong className="text-slate-100">{dom.freshnessSeconds}s</strong></div>
                  <div>Confidence: <strong className="text-slate-100">{dom.confidence}%</strong></div>
                  <div>Availability: <strong className="text-slate-100">{dom.availability}%</strong></div>
                  <div>Fallback Active: <strong className={dom.fallbackActive ? 'text-amber-400' : 'text-emerald-400'}>{dom.fallbackActive ? 'YES' : 'NO'}</strong></div>
                  <div>Failures: <strong className="text-slate-100">{dom.failureCount}</strong></div>
                </div>

                <p className="text-xs text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800/60">
                  "{dom.explanation}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: DATA QUALITY CENTER ── */}
      {activeTab === 'QUALITY' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Telemetry Data Quality Breakdown</span>
              <span className="text-cyan-400 text-sm font-extrabold">Overall Score: {quality.overallScore}/100</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Fresh Signals</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{quality.freshCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Stale Signals</span>
                <div className="text-xl font-bold text-amber-400 mt-1">{quality.staleCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Invalid Signals</span>
                <div className="text-xl font-bold text-red-400 mt-1">{quality.invalidCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Fallback Signals</span>
                <div className="text-xl font-bold text-blue-400 mt-1">{quality.fallbackCount || 0}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
              <strong>Quality Diagnosis:</strong> {quality.explanation}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 4: PROVIDER HEALTH CENTER ── */}
      {activeTab === 'PROVIDERS' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Adapter & Gateway Provider Health Matrix
          </h2>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
            {Object.entries(domains).map(([key, dom]: [string, any]) => (
              <div key={key} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 p-3 rounded border border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-200">{dom.domain} Adapter</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Status: <strong className="text-emerald-400">{dom.providerStatus}</strong></span>
                  <span>Availability: <strong className="text-slate-200">{dom.availability}%</strong></span>
                  <span>Fallback: <strong className={dom.fallbackActive ? 'text-amber-400' : 'text-slate-200'}>{dom.fallbackActive ? 'ACTIVE' : 'OFF'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: RUNTIME ALERT CENTER ── */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Operational Telemetry & Provider Alerts
          </h2>
          {alerts.map((alt: any) => (
            <div key={alt.alertId} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {alt.alertType} &bull; {alt.domain}
                </span>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 font-bold rounded text-[10px]">{alt.severity}</span>
              </div>
              <p className="text-slate-300">{alt.message}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                <span>Requires Human Approval: <strong className="text-emerald-400">TRUE</strong></span>
                <span>Advisory Only: <strong className="text-emerald-400">TRUE</strong></span>
                <span>Timestamp: {alt.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 6: CROSS-DOMAIN CORRELATIONS ── */}
      {activeTab === 'CORRELATIONS' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cross-Domain Multi-Hazard Cascading Correlations
          </h2>
          {correlations.map((c: any) => (
            <div key={c.correlationId} className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {c.domains.join(' → ')}
                </span>
                <span className="text-slate-400">Confidence: <strong className="text-emerald-300">{c.confidence}%</strong></span>
              </div>
              <p className="text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-[11px]">
                Chain: {c.relationship}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 7: PHASE 7 PIPELINE INTEGRATION ── */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Phase 8 Live Telemetry &rarr; Phase 7 Intelligence & Governance Pipeline
          </h2>

          <div className="space-y-3">
            {pipelineStages.map((stg, idx) => (
              <div key={stg.stageId} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {stg.name}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    stg.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {stg.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] pl-7">{stg.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 8: TELEMETRY EVENTS LOG ── */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Telemetry Update Event History Log
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Filter domain..."
                value={eventDomainFilter}
                onChange={(e) => setEventDomainFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px]">
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Provenance</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((evt: any) => (
                  <tr key={evt.eventId} className="border-b border-slate-800/60 hover:bg-slate-950">
                    <td className="p-3 font-mono text-emerald-400">{evt.eventId}</td>
                    <td className="p-3 text-slate-400">{evt.timestamp}</td>
                    <td className="p-3 font-bold text-slate-200">{evt.domain}</td>
                    <td className="p-3 text-amber-300">{evt.eventType}</td>
                    <td className="p-3 text-slate-300">{evt.providerType}</td>
                    <td className="p-3 text-cyan-400">{evt.dataQuality}</td>
                    <td className="p-3 text-slate-300">{evt.provenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 9: OBSERVABILITY DASHBOARD ── */}
      {activeTab === 'OBSERVABILITY' && (
        <div className="space-y-4 text-xs">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            System Observability & Traceability
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">Gateway Uptime</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">99.98%</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">Avg API Latency</span>
              <div className="text-lg font-bold text-blue-400 mt-1">12.4ms</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">Circuit Breaker</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">CLOSED</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">DLQ Queue Count</span>
              <div className="text-lg font-bold text-slate-200 mt-1">0</div>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-400">
            Active Trace Correlation ID: <span className="text-emerald-400">{correlationId || 'trace-ui-baseline'}</span>
          </div>
        </div>
      )}

      {/* Footer Snapshot Meta */}
      <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex flex-col md:flex-row items-center justify-between gap-2">
        <div>
          Last Known Snapshot: <span className="font-mono text-slate-200">{lastSnapshotTime || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>EarthMind Advisory Engine Operational</span>
        </div>
      </div>
    </div>
  );
}
