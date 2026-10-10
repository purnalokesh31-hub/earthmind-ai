'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multi-Agency Coordination Panel
// Renders Primary & Supporting Agency Responsibilities & Situation Room
// ──────────────────────────────────────────────────────────────

import React from 'react';

interface AgencyRosterItem {
  name: string;
  category: string;
  isPrimary: boolean;
  responsibility: string;
  status: string;
}

interface MultiAgencyPanelProps {
  primaryDepartmentName: string;
  participatingAgenciesCount: number;
  isCoordinated: boolean;
  agencies?: AgencyRosterItem[];
}

export const MultiAgencyPanel: React.FC<MultiAgencyPanelProps> = ({
  primaryDepartmentName,
  participatingAgenciesCount,
  isCoordinated,
  agencies = [
    { name: primaryDepartmentName, category: 'PUBLIC_WORKS', isPrimary: true, responsibility: 'Primary Hazard Containment & Surface Repair', status: 'ACKNOWLEDGED' },
    { name: 'Disaster Management Authority', category: 'DISASTER_MANAGEMENT', isPrimary: false, responsibility: 'Perimeter Evacuation & Citizen Warning', status: 'IN_PROGRESS' },
    { name: 'Municipal Power Utilities', category: 'POWER_UTILITIES', isPrimary: false, responsibility: 'Substation De-energization Inspection', status: 'JOINED' },
  ],
}) => {
  return (
    <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🏛️</span>
          <h3 className="font-bold text-slate-100 text-sm">Multi-Agency Operational Command</h3>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
          {participatingAgenciesCount} AGENCIES COORDINATED
        </span>
      </div>

      <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-lg text-indigo-300 flex items-center justify-between">
        <div>
          <span className="font-bold block text-slate-100">Primary Lead: {primaryDepartmentName}</span>
          <span className="text-[11px] text-indigo-300">Unified Incident Situation Room Synchronized</span>
        </div>
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono">
          SYNC OK
        </span>
      </div>

      <div className="space-y-2">
        <span className="font-semibold text-slate-300 block">Agency Roster & Responsibilities</span>
        {agencies.map((agency, idx) => (
          <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{agency.name}</span>
                {agency.isPrimary && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    LEAD
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{agency.responsibility}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded">
              {agency.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
