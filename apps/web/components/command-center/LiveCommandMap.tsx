'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Live GIS Command Center Map
// Interactive High-Performance Operational Map Visualization
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CommandCenterIncidentItemDto } from '../../lib/server/dto/command-center.dto';

interface LiveCommandMapProps {
  incidents: CommandCenterIncidentItemDto[];
  selectedId: string | null;
  onSelectIncident: (id: string) => void;
}

export const LiveCommandMap: React.FC<LiveCommandMapProps> = ({
  incidents,
  selectedId,
  onSelectIncident,
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showOfficers, setShowOfficers] = useState(true);

  const filtered = incidents.filter(
    (i) => severityFilter === 'all' || i.severity === severityFilter
  );

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[420px]">
      {/* Map Control Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Live Operational Command Map</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                GIS ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Vijayawada Sector Grid (16.5060° N, 80.6350° E)</p>
          </div>
        </div>

        {/* Filters & Toggles */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-[#050B14] border border-slate-700 rounded text-slate-300 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">P1 — Critical</option>
            <option value="HIGH">P2 — High</option>
            <option value="MEDIUM">P3 — Medium</option>
          </select>

          <button
            onClick={() => setShowRiskZones(!showRiskZones)}
            className={`px-2 py-1 text-xs font-mono rounded border transition ${
              showRiskZones
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Risk Zones
          </button>
        </div>
      </div>

      {/* Interactive Map Visualizer Grid */}
      <div className="relative flex-1 my-3 bg-[#050B14] border border-slate-800/80 rounded-lg overflow-hidden flex items-center justify-center">
        {/* Synthetic Vector Grid Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Operational Zone Polygons */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {showRiskZones && (
            <>
              {/* Ward 12 Risk Buffer Zone */}
              <circle cx="35%" cy="40%" r="90" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="4 4" />
              {/* Ward 14 Water Risk Zone */}
              <circle cx="65%" cy="55%" r="75" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.4)" strokeDasharray="4 4" />
            </>
          )}

          {/* Grid Interconnect Lines */}
          <line x1="35%" y1="40%" x2="65%" y2="55%" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>

        {/* Map Markers */}
        <div className="absolute inset-0 p-6 flex items-center justify-center">
          {filtered.map((inc, index) => {
            const isSelected = selectedId === inc.id;
            const pos = [
              { left: '35%', top: '40%' },
              { left: '65%', top: '55%' },
              { left: '48%', top: '30%' },
              { left: '52%', top: '70%' },
            ][index % 4];

            const markerColor =
              inc.severity === 'CRITICAL'
                ? 'bg-red-500 text-white shadow-red-500/50'
                : inc.severity === 'HIGH'
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/50'
                : 'bg-cyan-500 text-slate-950 shadow-cyan-500/50';

            return (
              <motion.div
                key={inc.id}
                style={{ position: 'absolute', left: pos.left, top: pos.top }}
                initial={{ scale: 0 }}
                animate={{ scale: isSelected ? 1.25 : 1 }}
                whileHover={{ scale: 1.3 }}
                onClick={() => onSelectIncident(inc.id)}
                className="cursor-pointer group z-20"
              >
                {/* Marker Pulse Ring */}
                {inc.severity === 'CRITICAL' && (
                  <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping" />
                )}

                {/* Marker Icon Pin */}
                <div className={`relative px-2.5 py-1 text-xs font-mono font-bold rounded-lg shadow-lg border border-white/20 flex items-center gap-1 ${markerColor}`}>
                  <span>🚨</span>
                  <span>{inc.incidentCode}</span>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-200 z-30 pointer-events-none">
                  <div className="font-bold text-cyan-300">{inc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Risk Score: {inc.riskScore}/100</div>
                  <div className="text-[10px] text-slate-400">Officer: {inc.assignedOfficerName || 'Unassigned'}</div>
                </div>
              </motion.div>
            );
          })}

          {/* Active Field Officer Markers */}
          {showOfficers && (
            <>
              <div style={{ position: 'absolute', left: '38%', top: '45%' }} className="z-10">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-mono flex items-center gap-1">
                  <span>🛡️</span> Officer Varma
                </span>
              </div>
              <div style={{ position: 'absolute', left: '62%', top: '50%' }} className="z-10">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-mono flex items-center gap-1">
                  <span>🛡️</span> Officer Rao
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical P1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> High P2</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Medium P3</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Field Officers</span>
        </div>

        <button
          onClick={() => {
            if (incidents.length > 0) onSelectIncident(incidents[0].id);
          }}
          className="text-cyan-400 hover:underline font-mono"
        >
          Reset Map Bounds 🎯
        </button>
      </div>
    </div>
  );
};
