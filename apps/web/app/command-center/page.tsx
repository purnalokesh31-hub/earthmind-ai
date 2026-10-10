'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Command Center Dedicated Route Page (/command-center)
// ──────────────────────────────────────────────────────────────

import React from 'react';
import { CityLiveIntelligenceWorkspace } from '@/components/command-center/CityLiveIntelligenceWorkspace';

export default function CommandCenterPage() {
  return (
    <div className="min-h-screen bg-[#0f1419] p-4 md:p-6 text-gray-200">
      <CityLiveIntelligenceWorkspace />
    </div>
  );
}
