'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Operational Incident Table
// Live Operational Queue with Multi-Criteria Filters & SLA Badges
// ──────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { CommandCenterIncidentItemDto } from '../../lib/server/dto/command-center.dto';

interface CommandCenterIncidentTableProps {
  incidents: CommandCenterIncidentItemDto[];
  selectedId: string | null;
  onSelectIncident: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  severityFilter: string;
  onSeverityChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
}

export const CommandCenterIncidentTable: React.FC<CommandCenterIncidentTableProps> = ({
  incidents,
  selectedId,
  onSelectIncident,
  searchTerm,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  categoryFilter,
  onCategoryChange,
}) => {
  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>🚨 Live Incident Operations Queue</span>
            <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              {incidents.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Autonomous AI dispatch, SLA deadlines & officer assignment tracking</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search code, title, area..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#050B14] border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full md:w-48"
          />

          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#050B14] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">P1 — Critical</option>
            <option value="HIGH">P2 — High</option>
            <option value="MEDIUM">P3 — Medium</option>
            <option value="LOW">P4 — Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#050B14] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Domains</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="water">Water & Flood</option>
            <option value="energy">Power & Energy</option>
            <option value="urban">Urban Services</option>
          </select>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#050B14]/80 text-slate-400 font-mono uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Code / Title</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Risk</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Department / Officer</th>
              <th className="py-2.5 px-3">SLA Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-sans">
            {incidents.map((inc) => {
              const isSelected = selectedId === inc.id;
              const sevColor =
                inc.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : inc.severity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';

              const slaColor =
                inc.slaStatus === 'BREACHED'
                  ? 'text-red-400 bg-red-500/10 border-red-500/30'
                  : inc.slaStatus === 'WARNING'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

              return (
                <motion.tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : ''}`}
                >
                  <td className="py-3 px-3">
                    <div className="font-mono text-[11px] text-cyan-400 font-bold">{inc.incidentCode}</div>
                    <div className="font-medium text-slate-100 truncate max-w-xs">{inc.title}</div>
                    <div className="text-[11px] text-slate-500">{inc.locationName}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[11px] font-mono font-semibold border rounded ${sevColor}`}>
                      {inc.severity}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-amber-300">{inc.riskScore} / 100</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-200 rounded border border-slate-700">
                      {inc.status}
                    </span>
                    {inc.escalationLevel > 0 && (
                      <span className="ml-1 text-[10px] text-orange-400 font-mono">L{inc.escalationLevel}</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium">{inc.departmentName}</div>
                    <div className="text-[11px] text-slate-400">
                      {inc.assignedOfficerName ? `👤 ${inc.assignedOfficerName}` : 'Unassigned'}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono border rounded ${slaColor}`}>
                      {inc.slaStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded transition"
                    >
                      Workspace ➔
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
