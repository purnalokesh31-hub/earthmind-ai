'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Geographic Scope Selector Component
// Switch between National, Region, District, & City Viewscopes
// ──────────────────────────────────────────────────────────────

import React from 'react';
import { GeographicScopeLevel } from '../../lib/server/domain/geography.domain';

interface GeographicScopeSelectorProps {
  currentScope: GeographicScopeLevel;
  onScopeChange: (scope: GeographicScopeLevel) => void;
  selectedCityName: string;
  onCityChange: (cityName: string) => void;
  onOpenCompare: () => void;
}

export const GeographicScopeSelector: React.FC<GeographicScopeSelectorProps> = ({
  currentScope,
  onScopeChange,
  selectedCityName,
  onCityChange,
  onOpenCompare,
}) => {
  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Scope Level Buttons */}
      <div className="flex items-center gap-1 bg-[#050B14] p-1 border border-slate-800 rounded-lg w-full sm:w-auto overflow-x-auto">
        {[
          { level: 'NATIONAL', label: '🇮🇳 National' },
          { level: 'REGION', label: '🏛️ Region' },
          { level: 'DISTRICT', label: '📍 District' },
          { level: 'CITY', label: '🏙️ City' },
        ].map((s) => (
          <button
            key={s.level}
            onClick={() => onScopeChange(s.level as any)}
            className={`px-3 py-1 font-mono text-[11px] rounded transition whitespace-nowrap ${
              currentScope === s.level
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Jurisdiction Active Dropdown & City Compare Trigger */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <select
          value={selectedCityName}
          onChange={(e) => onCityChange(e.target.value)}
          className="px-3 py-1.5 bg-[#050B14] border border-slate-700/80 rounded-lg text-slate-200 font-medium focus:outline-none focus:border-cyan-500 text-xs"
        >
          <option value="Vijayawada">Vijayawada Sector</option>
          <option value="Guntur">Guntur Metro</option>
          <option value="Visakhapatnam">Visakhapatnam Smart City</option>
          <option value="All Cities (Central Region)">All Cities (Central Region)</option>
        </select>

        <button
          onClick={onOpenCompare}
          className="px-3 py-1.5 font-mono text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-lg transition flex items-center gap-1 whitespace-nowrap"
        >
          <span>📊 Compare Cities</span>
        </button>
      </div>
    </div>
  );
};
