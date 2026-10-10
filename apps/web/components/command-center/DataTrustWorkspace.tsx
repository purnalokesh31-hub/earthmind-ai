'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Data Trust & Observability Workspace
// Real-time Data Trust Score, Telemetry Anomaly Log, Data Lineage & Explainability
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export interface DataTrustUIModel {
  providerId: string;
  providerName: string;
  domain: string;
  overallScore: number;
  trustLevel: 'TRUSTED' | 'MODERATE' | 'LOW' | 'UNTRUSTED';
  uptimePercent: number;
  latencyMs: number;
  staleRatePercent: number;
  anomalyCount: number;
  explainability: string;
  lineageTrace: string;
}

const MOCK_TRUST_PROVIDERS: DataTrustUIModel[] = [
  {
    providerId: 'connector-doppler-weather-01',
    providerName: 'Doppler Radar Weather Connector',
    domain: 'WEATHER',
    overallScore: 98.5,
    trustLevel: 'TRUSTED',
    uptimePercent: 99.9,
    latencyMs: 14,
    staleRatePercent: 0.2,
    anomalyCount: 0,
    explainability: 'Signal payload valid, timestamp fresh (4s old), provider healthy.',
    lineageTrace: 'connector-doppler-weather-01 ➔ evt-sig-ext-wth-01 ➔ sig-ext-wth-01 ➔ pred-flood-88 ➔ dec-pump-12',
  },
  {
    providerId: 'connector-env-sensors-01',
    providerName: 'City Environmental Sensor Mesh',
    domain: 'ENVIRONMENTAL',
    overallScore: 94.0,
    trustLevel: 'TRUSTED',
    uptimePercent: 99.5,
    latencyMs: 10,
    staleRatePercent: 1.1,
    anomalyCount: 0,
    explainability: 'Signal valid, freshness within threshold (10s), moving average consistent.',
    lineageTrace: 'connector-env-sensors-01 ➔ evt-sig-ext-env-99 ➔ sig-ext-env-99 ➔ pred-aqi-04',
  },
  {
    providerId: 'connector-traffic-mobility-01',
    providerName: 'Intelligent Traffic & Mobility Connector',
    domain: 'MOBILITY',
    overallScore: 95.0,
    trustLevel: 'TRUSTED',
    uptimePercent: 99.8,
    latencyMs: 18,
    staleRatePercent: 0.5,
    anomalyCount: 0,
    explainability: 'Traffic corridor speed & density signals verified against physical bounds.',
    lineageTrace: 'connector-traffic-mobility-01 ➔ evt-sig-ext-mob-NH9 ➔ sig-ext-mob-NH9 ➔ sim-cascade-01',
  },
  {
    providerId: 'connector-scada-utility-01',
    providerName: 'Utility SCADA Grid Connector',
    domain: 'UTILITY',
    overallScore: 68.0,
    trustLevel: 'MODERATE',
    uptimePercent: 92.4,
    latencyMs: 120,
    staleRatePercent: 14.5,
    anomalyCount: 1,
    explainability: 'WARNING: Substation 4B thermal reading spiked 42% above 10-min moving avg. Latency elevated (120ms).',
    lineageTrace: 'connector-scada-utility-01 ➔ evt-sig-ext-utl-SUB4B ➔ sig-ext-utl-SUB4B ➔ dec-islanding-09',
  },
];

export const DataTrustWorkspace: React.FC = () => {
  const [providers] = useState<DataTrustUIModel[]>(MOCK_TRUST_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('connector-scada-utility-01');

  const selectedProvider = providers.find((p) => p.providerId === selectedProviderId) || providers[0];

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* ── SAFETY BANNER ── */}
      <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-200 text-sm">EARTHMIND DATA TRUST & OBSERVABILITY ENGINE — PHASE 8.4</h4>
            <p className="text-xs text-amber-300/80">
              Transparent Trust Scoring & Lineage Active. Unreliable Data Blocked from Pretending to be LIVE.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono px-2 py-1 bg-amber-900/60 text-amber-200 rounded border border-amber-600/40">
            ADVISORY ONLY • HUMAN AUTHORIZATION MANDATED
          </span>
        </div>
      </div>

      {/* ── HEADER & SYSTEMWIDE TRUST ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400">Data Quality, Observability & Trust Workspace</h2>
          <p className="text-sm text-slate-400">Can we trust this data? Transparent scoring, anomaly detection & end-to-end lineage</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Overall Trust Score</div>
            <div className="text-lg font-bold text-emerald-400">93.8%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Trust Classification</div>
            <div className="text-lg font-bold text-emerald-300">TRUSTED</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Active Anomalies</div>
            <div className="text-lg font-bold text-amber-400">1</div>
          </div>
        </div>
      </div>

      {/* ── PROVIDER TRUST METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {providers.map((p) => (
          <div
            key={p.providerId}
            onClick={() => setSelectedProviderId(p.providerId)}
            className={`cursor-pointer p-4 rounded-lg border transition-all ${
              selectedProviderId === p.providerId
                ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                {p.domain}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  p.trustLevel === 'TRUSTED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}
              >
                ● {p.overallScore}%
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-xs mt-2 truncate">{p.providerName}</h3>
            <div className="mt-3 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-slate-200">{p.uptimePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-slate-200">{p.latencyMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── EXPLAINABILITY & LINEAGE CARD ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Data Trust Analysis & Lineage Trace</h3>
            <p className="text-xs text-slate-400 font-mono">{selectedProvider.providerId} ({selectedProvider.providerName})</p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/60">
            Trust Level: {selectedProvider.trustLevel} ({selectedProvider.overallScore}%)
          </span>
        </div>

        {/* ── EXPLAINABILITY SECTION ── */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unreliability Explainability Diagnosis:</h4>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
            {selectedProvider.explainability}
          </div>
        </div>

        {/* ── LINEAGE SECTION ── */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">End-to-End Data Lineage Chain:</h4>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
            {selectedProvider.lineageTrace}
          </div>
        </div>
      </div>
    </div>
  );
};
