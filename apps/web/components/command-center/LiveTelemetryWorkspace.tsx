'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Live Telemetry Workspace
// Real-time Event Streaming, Quality Monitoring, Buffer Capacity & DLQ
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export interface TelemetryEventUIModel {
  eventId: string;
  providerId: string;
  domain: string;
  timestamp: string;
  value: number;
  unit: string;
  quality: 'FRESH' | 'STALE' | 'UNKNOWN' | 'INVALID';
  provenance: string;
  correlationId: string;
}

const MOCK_LIVE_EVENTS: TelemetryEventUIModel[] = [
  {
    eventId: 'evt-sig-ext-wth-WTH-RADAR-VJA-01',
    providerId: 'connector-doppler-weather-01',
    domain: 'WEATHER',
    timestamp: new Date().toISOString(),
    value: 120.5,
    unit: 'mm/hr',
    quality: 'FRESH',
    provenance: 'LIVE (SIMULATED LOCAL)',
    correlationId: 'corr-ext-wth-9041',
  },
  {
    eventId: 'evt-sig-ext-env-ENV-BENZ-STN-99',
    providerId: 'connector-env-sensors-01',
    domain: 'ENVIRONMENTAL',
    timestamp: new Date().toISOString(),
    value: 48,
    unit: 'AQI',
    quality: 'FRESH',
    provenance: 'LIVE (SIMULATED LOCAL)',
    correlationId: 'corr-ext-env-1042',
  },
  {
    eventId: 'evt-sig-ext-mob-MOB-NH9-ARTERIAL',
    providerId: 'connector-traffic-mobility-01',
    domain: 'MOBILITY',
    timestamp: new Date().toISOString(),
    value: 94.8,
    unit: '%',
    quality: 'FRESH',
    provenance: 'LIVE (SIMULATED LOCAL)',
    correlationId: 'corr-ext-mob-7712',
  },
  {
    eventId: 'evt-sig-ext-trn-TRN-BUS-SEC4',
    providerId: 'connector-gtfs-transit-01',
    domain: 'TRANSIT',
    timestamp: new Date(Date.now() - 75000).toISOString(),
    value: 38.0,
    unit: 'mins',
    quality: 'STALE',
    provenance: 'DEMO',
    correlationId: 'corr-ext-trn-3310',
  },
];

export const LiveTelemetryWorkspace: React.FC = () => {
  const [events] = useState<TelemetryEventUIModel[]>(MOCK_LIVE_EVENTS);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const filteredEvents = selectedDomain === 'ALL'
    ? events
    : events.filter((e) => e.domain === selectedDomain);

  const freshCount = events.filter((e) => e.quality === 'FRESH').length;
  const staleCount = events.filter((e) => e.quality === 'STALE').length;

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* ── SAFETY BANNER ── */}
      <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-200 text-sm">EARTHMIND REAL-TIME INGESTION — PHASE 8.3 EVENT STREAMING</h4>
            <p className="text-xs text-amber-300/80">
              Read-Only Telemetry Ingestion Pipeline Active. Strict Provenance Integrity Enforced. No Physical Infrastructure Actuator Controls.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono px-2 py-1 bg-amber-900/60 text-amber-200 rounded border border-amber-600/40">
            ADVISORY ONLY • HUMAN AUTHORIZATION MANDATED
          </span>
        </div>
      </div>

      {/* ── HEADER & STREAM METRICS ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400">Real-Time Telemetry Stream Workspace</h2>
          <p className="text-sm text-slate-400">Scalable event-driven ingestion pipeline, quality monitoring & DLQ diagnostics</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Event Rate</div>
            <div className="text-lg font-bold text-sky-400">4.2 / sec</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Buffer Capacity</div>
            <div className="text-lg font-bold text-emerald-400">12.4%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">Fresh Ratio</div>
            <div className="text-lg font-bold text-emerald-400">92.5%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center">
            <div className="text-xs text-slate-400">DLQ Count</div>
            <div className="text-lg font-bold text-rose-400">0</div>
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

      {/* ── LIVE EVENT STREAM TABLE ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Incoming City Telemetry Events</span>
          <span className="font-mono text-emerald-400">● LIVE STREAMING</span>
        </div>
        <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto font-mono text-xs">
          {filteredEvents.map((evt) => (
            <div key={evt.eventId} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold text-[10px]">
                    {evt.domain}
                  </span>
                  <span className="text-slate-100 font-bold">{evt.providerId}</span>
                  <span className="text-slate-500 text-[10px]">({evt.correlationId})</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Signal Value: <strong className="text-emerald-300">{evt.value} {evt.unit}</strong> • Provenance: <strong className="text-slate-200">{evt.provenance}</strong>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    evt.quality === 'FRESH'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  ● {evt.quality}
                </span>
                <div className="text-[10px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
