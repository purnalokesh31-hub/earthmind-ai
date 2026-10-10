'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Provider Health Workspace
// Displays real-time Data Gateway provider metrics, circuit state & isolation health
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export interface ProviderHealthUIModel {
  providerId: string;
  providerName: string;
  providerType: 'MOCK' | 'DEMO' | 'EXTERNAL_CONTRACT';
  domain: string;
  enabled: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  latencyMs: number;
  freshnessSeconds: number;
  lastSuccessfulFetch: string | null;
  failureCount: number;
  provenance: string;
  fallbackActive: boolean;
  endpointUrl: string;
}

const DEFAULT_PROVIDERS: ProviderHealthUIModel[] = [
  {
    providerId: 'provider-mock-gateway',
    providerName: 'Mock Local Sensor Telemetry Gateway',
    providerType: 'MOCK',
    domain: 'ENVIRONMENTAL',
    enabled: true,
    status: 'HEALTHY',
    circuitState: 'CLOSED',
    latencyMs: 5,
    freshnessSeconds: 2,
    lastSuccessfulFetch: new Date().toISOString(),
    failureCount: 0,
    provenance: 'LIVE (SIMULATED LOCAL)',
    fallbackActive: false,
    endpointUrl: 'mock://local/telemetry',
  },
  {
    providerId: 'provider-demo-gateway',
    providerName: 'City Flood Cascade Expo Demo Gateway',
    providerType: 'DEMO',
    domain: 'WEATHER',
    enabled: true,
    status: 'HEALTHY',
    circuitState: 'CLOSED',
    latencyMs: 12,
    freshnessSeconds: 4,
    lastSuccessfulFetch: new Date().toISOString(),
    failureCount: 0,
    provenance: 'DEMO (SIMULATION)',
    fallbackActive: false,
    endpointUrl: 'demo://expo/crisis-cascade',
  },
  {
    providerId: 'provider-external-contract-gateway',
    providerName: 'External Municipal API Provider Contract',
    providerType: 'EXTERNAL_CONTRACT',
    domain: 'UTILITY',
    enabled: true,
    status: 'DEGRADED',
    circuitState: 'HALF_OPEN',
    latencyMs: 0,
    freshnessSeconds: 120,
    lastSuccessfulFetch: null,
    failureCount: 1,
    provenance: 'EXTERNAL_CONTRACT',
    fallbackActive: true,
    endpointUrl: 'https://api.municipal.gov/v1/telemetry',
  },
];

export const ProviderHealthWorkspace: React.FC = () => {
  const [providers, setProviders] = useState<ProviderHealthUIModel[]>(DEFAULT_PROVIDERS);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.providerId === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const filteredProviders = selectedDomain === 'ALL'
    ? providers
    : providers.filter((p) => p.domain === selectedDomain);

  const totalHealthy = providers.filter((p) => p.status === 'HEALTHY').length;
  const totalDegraded = providers.filter((p) => p.status === 'DEGRADED').length;
  const totalOpenCircuits = providers.filter((p) => p.circuitState === 'OPEN' || p.circuitState === 'HALF_OPEN').length;

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* ── SAFETY BANNER ── */}
      <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-200 text-sm">EARTHMIND DATA CONNECTORS — PHASE 8.2 REAL-WORLD CONNECTOR FRAMEWORK</h4>
            <p className="text-xs text-amber-300/80">
              Isolated Domain Adapters Active across 7 Urban Feeds. Server-side secrets secured. Data Ingestion Only — No Physical Actuator Connections.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono px-2 py-1 bg-amber-900/60 text-amber-200 rounded border border-amber-600/40">
            ADVISORY ONLY • HUMAN AUTHORIZATION MANDATED
          </span>
        </div>
      </div>

      {/* ── HEADER & TOP STATS ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400">Production Data Gateway Workspace</h2>
          <p className="text-sm text-slate-400">Real-time provider telemetry health, circuit breaker state & adapter isolation</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Total Registered</div>
            <div className="text-lg font-bold text-slate-100">{providers.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Healthy</div>
            <div className="text-lg font-bold text-emerald-400">{totalHealthy}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Degraded</div>
            <div className="text-lg font-bold text-amber-400">{totalDegraded}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Active Circuits</div>
            <div className="text-lg font-bold text-sky-400">{totalOpenCircuits}</div>
          </div>
        </div>
      </div>

      {/* ── DOMAIN FILTER TABS ── */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {['ALL', 'WEATHER', 'ENVIRONMENTAL', 'MOBILITY', 'TRANSIT', 'UTILITY', 'EMERGENCY', 'CITIZEN'].map((dom) => (
          <button
            key={dom}
            onClick={() => setSelectedDomain(dom)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedDomain === dom
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* ── PROVIDER CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProviders.map((p) => (
          <div key={p.providerId} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                  {p.domain} • {p.providerType}
                </span>
                <h3 className="font-semibold text-slate-100 text-sm mt-1">{p.providerName}</h3>
              </div>
              <button
                onClick={() => toggleProvider(p.providerId)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  p.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {p.enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Health Status</span>
                <span
                  className={`font-bold ${
                    p.status === 'HEALTHY'
                      ? 'text-emerald-400'
                      : p.status === 'DEGRADED'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  ● {p.status}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Circuit Breaker</span>
                <span
                  className={`font-bold ${
                    p.circuitState === 'CLOSED'
                      ? 'text-emerald-400'
                      : p.circuitState === 'HALF_OPEN'
                      ? 'text-sky-400'
                      : 'text-rose-400'
                  }`}
                >
                  ⚡ {p.circuitState}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Latency / Freshness</span>
                <span className="font-mono text-slate-200">
                  {p.latencyMs}ms / {p.freshnessSeconds}s
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Fallback Mode</span>
                <span className={`font-semibold ${p.fallbackActive ? 'text-amber-300' : 'text-slate-400'}`}>
                  {p.fallbackActive ? '🔄 FALLBACK MOCK' : 'PRIMARY DIRECT'}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
              <span>Provenance: <strong className="text-slate-200">{p.provenance}</strong></span>
              <span>Failures: <strong className="text-rose-400">{p.failureCount}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
