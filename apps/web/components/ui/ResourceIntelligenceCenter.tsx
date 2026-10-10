'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge } from './Badge';
import {
  Users,
  Building2,
  Truck,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Zap,
  Sparkles,
  Search,
  Radio,
  MapPin,
  XCircle,
  RefreshCw,
  Navigation,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ResourceUnit {
  id: string;
  name: string;
  department: string;
  squadType: string;
  status: 'available' | 'dispatched' | 'on_site' | 'maintenance';
  workload: string; // e.g. "1 Case (75% Cap)"
  eta: string; // e.g. "12 Mins"
  coverageArea: string;
  vehicles: string[];
  equipment: string[];
  aiMatchScore: number;
}

const MOCK_RESOURCES: ResourceUnit[] = [
  {
    id: 'res-1',
    name: 'Officer Lokesh (Squad L3)',
    department: 'PWD Infrastructure',
    squadType: 'Hydrodynamic Remediation',
    status: 'available',
    workload: '0 Active Cases (20% Cap)',
    eta: '8 Mins',
    coverageArea: 'Benz Circle / Ward 12',
    vehicles: ['Rescue Unit 04', 'Drone-01'],
    equipment: ['Sub-surface Radar', 'Hydro Vacuum Skid'],
    aiMatchScore: 98.4,
  },
  {
    id: 'res-2',
    name: 'Officer Sravan (Squad W2)',
    department: 'Municipal Water',
    squadType: 'Water Quality & Turbidity',
    status: 'dispatched',
    workload: '1 Active Case (85% Cap)',
    eta: '14 Mins',
    coverageArea: 'Treatment Plant B / Sector 4',
    vehicles: ['Water Sampling Van 02'],
    equipment: ['UV Sterilization Unit', 'Turbidity Sensor'],
    aiMatchScore: 92.1,
  },
  {
    id: 'res-3',
    name: 'Commander Vikram (Squad R4)',
    department: 'Disaster Management',
    squadType: 'Flood & Heavy Rescue',
    status: 'available',
    workload: '0 Active Cases (10% Cap)',
    eta: '5 Mins',
    coverageArea: 'Krishna Basin / Ward 8',
    vehicles: ['Amphibious Craft R4', 'Mobile Pump Trailer'],
    equipment: ['High-Capacity Pump', 'Emergency Shelter Tent'],
    aiMatchScore: 96.0,
  },
  {
    id: 'res-4',
    name: 'Officer Ananya (Squad E1)',
    department: 'Pollution Control',
    squadType: 'Air Quality & Aerosol',
    status: 'on_site',
    workload: '2 Active Cases (95% Cap)',
    eta: '22 Mins',
    coverageArea: 'Industrial Corridor Sector 9',
    vehicles: ['Air Monitoring Van 01'],
    equipment: ['Aerosol LiDAR Scanner', 'High-Volume Scrubber'],
    aiMatchScore: 84.5,
  },
];

export const ResourceIntelligenceCenter: React.FC = () => {
  const { selectedIncident, incidents, addToast, openConfirmDialog, updateIncident } = useAppStore();

  const activeIncident = selectedIncident || incidents[0] || null;

  const [resources, setResources] = useState<ResourceUnit[]>(MOCK_RESOURCES);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'available' | 'dispatched' | 'recommended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1-Tap Assign Resource
  const handleAssign = (res: ResourceUnit) => {
    if (!activeIncident) return;

    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'dispatched', workload: '1 Active Case (85% Cap)' } : r))
    );

    updateIncident(activeIncident.id, { reportedBy: res.name });
    addToast({
      title: 'Resource Dispatched',
      message: `Assigned ${res.name} to case "${activeIncident.title}". ETA: ${res.eta}.`,
      type: 'success',
    });
  };

  // 1-Tap Priority Dispatch
  const handlePriorityDispatch = (res: ResourceUnit) => {
    if (!activeIncident) return;

    openConfirmDialog({
      title: `PRIORITY EMERGENCY DISPATCH — ${res.name}`,
      message: `Execute immediate priority sirens dispatch of ${res.name} to ${activeIncident.id} (${activeIncident.title})?`,
      confirmLabel: 'EXECUTE PRIORITY DISPATCH',
      onConfirm: () => {
        handleAssign(res);
        addToast({ title: 'PRIORITY DISPATCH ACTIVE', message: `Emergency lights dispatched to ${res.coverageArea}.`, type: 'warning' });
      },
    });
  };

  // Unassign / Remove Resource
  const handleRemove = (res: ResourceUnit) => {
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'available', workload: '0 Active Cases (10% Cap)' } : r))
    );
    addToast({ title: 'Resource Unassigned', message: `Returned ${res.name} to available field pool.`, type: 'info' });
  };

  const filteredResources = resources.filter((res) => {
    const matchSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || res.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabFilter === 'available') return matchSearch && res.status === 'available';
    if (activeTabFilter === 'dispatched') return matchSearch && (res.status === 'dispatched' || res.status === 'on_site');
    if (activeTabFilter === 'recommended') return matchSearch && res.aiMatchScore >= 95;
    return matchSearch;
  });

  return (
    <Card className="flex flex-col justify-between p-5 bg-[#0A1220]/95 border-emerald-500/30 shadow-2xl relative overflow-hidden text-slate-200 font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Users className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Enterprise Resource Intelligence Center</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  42 OFFICERS ONLINE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Real-time field officer roster, squad telemetry, vehicles, equipment & AI match dispatch engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400">Target Case:</span>
            <span className="text-cyan-400 font-bold">{activeIncident?.id || 'EM-208'}</span>
          </div>
        </div>

        {/* ── 5 SUMMARY METRICS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 z-10 relative text-[10px]">
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Available Officers</span>
            <span className="text-emerald-400 font-bold text-xs">28 Roster Leads</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Active Departments</span>
            <span className="text-cyan-400 font-bold text-xs">9 Domains</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Tactical Field Teams</span>
            <span className="text-indigo-400 font-bold text-xs">14 Squads</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Vehicles & Drones</span>
            <span className="text-purple-400 font-bold text-xs">18 Units</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#050B14] border border-white/10">
            <span className="text-slate-500 text-[9px] block">Equipment Skids</span>
            <span className="text-amber-400 font-bold text-xs">36 Units</span>
          </div>
        </div>

        {/* ── FILTER TABS & SEARCH BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 relative text-[10px]">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050B14] border border-white/10">
            {(['all', 'available', 'dispatched', 'recommended'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={cn(
                  'px-3 py-1 rounded-lg font-bold capitalize transition',
                  activeTabFilter === tab ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {tab === 'recommended' ? '🤖 AI Recommended' : tab}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter officers or squads..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#050B14] border border-white/10 focus:border-emerald-500 outline-none text-slate-200 text-[10px]"
            />
          </div>
        </div>

        {/* ── RESOURCE CARDS GRID STREAM ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 z-10 relative text-[10px]">
          {filteredResources.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-[#050B14] border border-white/10 flex flex-col justify-between gap-3 group hover:border-emerald-500/40 transition shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 group-hover:text-emerald-300 transition text-xs">
                      {res.name}
                    </h4>
                    <span className="text-[9px] text-slate-400">{res.department} • {res.squadType}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded font-bold text-[9px] uppercase',
                        res.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : res.status === 'dispatched' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      )}
                    >
                      {res.status.replace('_', ' ')}
                    </span>
                    <span className="text-[8px] text-emerald-400 block font-bold mt-0.5">
                      AI Match: {res.aiMatchScore}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-slate-300 text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Workload:</span>
                    <span className="font-bold text-slate-200">{res.workload}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Arrival (ETA):</span>
                    <span className="font-bold text-cyan-400">{res.eta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coverage Sector:</span>
                    <span className="font-bold text-slate-200">📍 {res.coverageArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Equipment:</span>
                    <span className="font-bold text-amber-300 truncate max-w-[180px]">{res.equipment.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                {res.status === 'available' ? (
                  <button
                    onClick={() => handleAssign(res)}
                    className="flex-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold transition border border-emerald-500/30 flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" /> Assign Squad
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemove(res)}
                    className="flex-1 py-1.5 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-bold transition border border-white/10 flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Unassign
                  </button>
                )}

                <button
                  onClick={() => handlePriorityDispatch(res)}
                  className="py-1.5 px-2.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 font-bold transition border border-rose-500/30 flex items-center gap-1"
                  title="Priority Emergency Dispatch"
                >
                  <Zap className="w-3 h-3 text-rose-400" /> Priority
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-3 mt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex items-center justify-between z-10 relative">
        <span>Dynamic RTK GNSS resource tracking synced across all 9 domain workspaces.</span>
        <span className="text-emerald-400 font-bold">ROSTER NOMINAL</span>
      </div>
    </Card>
  );
};
