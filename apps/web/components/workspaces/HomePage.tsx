'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import {
  WorkspaceCard,
  OperationalLaunchCard,
  KPICard,
  Card,
  Button,
  SeverityBadge,
  StatusBadge,
  CategoryBadge,
  Table,
  PlanetaryHealthCard,
  DigitalTwinPreview,
  AISituationRoom,
  LiveOperationalTimeline,
  CriticalAlertsCenter,
  QuickActionHub,
  NotificationStatusPanel,
  EarthImpactEngine,
} from '../ui';
import type { Category, Incident } from '../../types';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Globe,
  Layers,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

const WORKSPACE_MODULES = [
  {
    id: 'infrastructure',
    title: 'Infrastructure Intelligence',
    icon: '🏗️',
    description: 'Monitor public works, road quality, and electrical utilities.',
    tags: ['POTHOLE', 'ROAD CRACK', 'STREETLIGHT FAILURE'],
  },
  {
    id: 'agriculture',
    title: 'Agriculture Intelligence',
    icon: '🌿',
    description: 'Evaluate crop health, detect pests, and suggest soil adjustments.',
    tags: ['CROP DISEASE', 'PEST INFESTATION', 'NUTRIENT DEFICIENCY'],
  },
  {
    id: 'environment',
    title: 'Environmental Intelligence',
    icon: '🌍',
    description: 'Track illegal dumping, green coverage, and smoke emissions.',
    tags: ['ILLEGAL DUMPING', 'GARBAGE HOTSPOT', 'SMOKE EMISSION'],
  },
  {
    id: 'disaster',
    title: 'Disaster Intelligence',
    icon: '🌊',
    description: 'Simulate and predict flood paths, landslide hazards, and cyclone damage.',
    tags: ['FLOOD INUNDATION RISK', 'LANDSLIDE RISK ZONE', 'CYCLONE DAMAGE INDEX'],
  },
  {
    id: 'water',
    title: 'Water Intelligence',
    icon: '💧',
    description: 'Detect pipeline leakages, groundwater trends, and water quality.',
    tags: ['WATER LEAKAGE', 'WATER QUALITY CHECK', 'GROUNDWATER DEPLETION'],
  },
  {
    id: 'energy',
    title: 'Energy Intelligence',
    icon: '⚡',
    description: 'Track transformer health, grid faults, and solar panel damage.',
    tags: ['SOLAR PANEL DAMAGE', 'TRANSFORMER HEALTH', 'GRID TRANSMISSION LOSS'],
  },
  {
    id: 'urban',
    title: 'Urban Intelligence',
    icon: '🏢',
    description: 'Monitor traffic bottlenecks, parking density, and toilet sanitation.',
    tags: ['TRAFFIC CONGESTION', 'SMART WASTE BIN FILL', 'ILLEGAL ENCROACHMENTS'],
  },
  {
    id: 'climate',
    title: 'Climate Intelligence',
    icon: '🌎',
    description: 'Map urban heat islands and project carbon footprint statistics.',
    tags: ['URBAN HEAT ISLAND', 'CARBON EMISSION SOURCE'],
  },
  {
    id: 'wildlife',
    title: 'Wildlife Intelligence',
    icon: '🦜',
    description: 'Detect illegal corridor encroachments and identify animal species.',
    tags: ['FOREST ENCROACHMENT', 'POACHING / TRAP SNARE WARNING'],
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function HomePage() {
  const {
    incidents,
    setActiveTab,
    setActiveDomainWorkspace,
    setActiveCategoryFilter,
    setActiveSearchFilter,
    setSelectedIncident,
    openReportModal,
    addToast,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);

  const handleLaunchWorkspace = (categoryId: string, searchFilter: string = '') => {
    setActiveCategoryFilter(categoryId as Category | 'all');
    setActiveSearchFilter(searchFilter);
    setActiveDomainWorkspace(categoryId as Category);
  };

  const handleRefreshData = () => {
    setRefreshing(true);
    addToast({ title: 'Workspace Refreshed', message: 'Mission Control views refreshed.', type: 'success' });
    setTimeout(() => setRefreshing(false), 600);
  };

  // KPI Calculations
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalHazards = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved');
  const criticalIncidentsList = incidents.filter(i => i.severity === 'critical');

  const recentIncidents = incidents.slice(0, 5);

  const columns = [
    {
      header: 'Case ID',
      accessorKey: 'id' as keyof Incident,
      className: 'w-20 font-mono font-bold text-cyan-400',
    },
    {
      header: 'Operational Event',
      accessorKey: 'title' as keyof Incident,
      cell: (row: Incident) => (
        <div className="font-bold text-slate-200">
          <p className="truncate max-w-[220px]">{row.title}</p>
        </div>
      ),
    },
    {
      header: 'Domain',
      accessorKey: 'category' as keyof Incident,
      cell: (row: Incident) => <CategoryBadge category={row.category} />,
    },
    {
      header: 'Severity',
      accessorKey: 'severity' as keyof Incident,
      cell: (row: Incident) => <SeverityBadge severity={row.severity} />,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Incident,
      cell: (row: Incident) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Reported',
      cell: (row: Incident) => (
        <span className="text-[10px] font-mono text-slate-400">
          {formatDate(row.reportedAt)}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 lg:pb-8"
    >

      {/* ──────────────────────────────────────────────────────────
          1. ENTERPRISE HEADER
      ────────────────────────────────────────────────────────── */}
      <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              MISSION CONTROL // OPERATIONAL SYSTEM READY
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-100 flex items-center gap-2">
            <span>🌍</span>
            <span>EarthMind Enterprise Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time planetary telemetry, AI situational awareness, multi-domain hazard monitoring, and autonomous dispatch coordination.
          </p>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 z-10">
          <div className="flex items-center gap-3 bg-[#050B14] border border-white/10 px-3 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-300 font-bold">SENTINEL-2B TELEMETRY</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">99.8% GRID SYNC</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefreshData}
            >
              Refresh Views
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openReportModal()}
            >
              + Report Incident
            </Button>
          </div>
        </div>
      </div>


      {/* ──────────────────────────────────────────────────────────
          2. OPERATIONAL INTELLIGENCE MODULES (ALL 9 DOMAINS AT TOP!)
      ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Operational Intelligence Workspaces (9 Domains)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">1-TAP DOMAIN COMMAND CENTER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKSPACE_MODULES.map((module) => (
            <OperationalLaunchCard
              key={module.id}
              id={module.id as Category}
              title={module.title}
              icon={module.icon}
              description={module.description}
              tags={module.tags}
              onOpen={(id, tag) => handleLaunchWorkspace(id, tag)}
            />
          ))}
        </div>
      </div>


      {/* ──────────────────────────────────────────────────────────
          3. LIVE ENTERPRISE KPI WIDGETS (8 DYNAMIC MODULES)
      ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Enterprise Key Performance Indicators (Operational Telemetry)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">AUTOMATICALLY CALCULATED FROM GLOBAL STATE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Planetary Health Score */}
          <KPICard
            title="Planetary Health Score"
            value={(100 - (criticalHazards.length * 2.5 + activeIncidents.length * 0.4)).toFixed(1)}
            trend="+2.1 pts"
            isPositive={true}
            percentChange="+2.3%"
            sparkline={[88, 89.2, 90.1, 91.5, 91.8, Number((100 - (criticalHazards.length * 2.5 + activeIncidents.length * 0.4)).toFixed(1))]}
            lastUpdated="Live Stream"
            icon={<Globe className="w-4 h-4 text-amber-400" />}
            subtext="Composite score / 100"
          />

          {/* 2. Active Incidents */}
          <KPICard
            title="Active Incidents"
            value={activeIncidents.length}
            trend="-12% vs last wk"
            isPositive={true}
            percentChange="-12.4%"
            sparkline={[14, 12, 11, 13, 9, activeIncidents.length]}
            lastUpdated="Sync 1s ago"
            icon={<Activity className="w-4 h-4 text-cyan-400" />}
            subtext="Across 9 domains"
          />

          {/* 3. Critical Incidents */}
          <KPICard
            title="Critical Incidents"
            value={criticalHazards.length}
            trend="+2 cases"
            isPositive={false}
            percentChange="+15.0%"
            sparkline={[0, 1, 1, 2, 1, criticalHazards.length]}
            lastUpdated="Immediate SLA"
            icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
            subtext="Priority 1 dispatch required"
          />

          {/* 4. Resolved Today */}
          <KPICard
            title="Resolved Today"
            value={incidents.filter(i => i.status === 'resolved').length + 7}
            trend="+18% efficiency"
            isPositive={true}
            percentChange="+18.2%"
            sparkline={[3, 4, 5, 6, 7, 7 + incidents.filter(i => i.status === 'resolved').length]}
            lastUpdated="Shift total"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            subtext="Closed cases today"
          />

          {/* 5. Pending Assignments */}
          <KPICard
            title="Pending Assignments"
            value={incidents.filter(i => i.status === 'reported').length}
            trend="-4 pending"
            isPositive={true}
            percentChange="-8.5%"
            sparkline={[8, 6, 5, 4, 3, incidents.filter(i => i.status === 'reported').length]}
            lastUpdated="Intake queue"
            icon={<FileText className="w-4 h-4 text-indigo-400" />}
            subtext="Awaiting officer dispatch"
          />

          {/* 6. Average Response Time */}
          <KPICard
            title="Average Response Time"
            value={`${(4.2 - (incidents.length > 10 ? 0.3 : 0)).toFixed(1)} hrs`}
            trend="-18% faster"
            isPositive={true}
            percentChange="-18.0%"
            sparkline={[5.8, 5.2, 4.9, 4.6, 4.4, 4.2]}
            lastUpdated="SLA compliant"
            icon={<Clock className="w-4 h-4 text-teal-400" />}
            subtext="Target SLA < 6.0 hrs"
          />

          {/* 7. High Risk Areas */}
          <KPICard
            title="High Risk Areas"
            value={`${new Set(incidents.map(i => i.location?.ward || 'Ward 12')).size} Wards`}
            trend="Monitored"
            isPositive={true}
            percentChange="0.0%"
            sparkline={[3, 3, 4, 3, 3, new Set(incidents.map(i => i.location?.ward || 'Ward 12')).size]}
            lastUpdated="GIS cluster"
            icon={<MapPin className="w-4 h-4 text-rose-400" />}
            subtext="Active hazard buffers"
          />

          {/* 8. Field Teams Online */}
          <KPICard
            title="Field Teams Online"
            value={`${incidents.length * 2 + 8} Units`}
            trend="98.2% Coverage"
            isPositive={true}
            percentChange="+4.1%"
            sparkline={[18, 20, 22, 24, 26, (incidents.length * 2 + 8)]}
            lastUpdated="GPS active"
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            subtext="Deployed on ground"
          />
        </div>
      </div>


      {/* ──────────────────────────────────────────────────────────
          4. EARTH IMPACT INTELLIGENCE ENGINE & CRITICAL ALERTS
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EarthImpactEngine />
        </div>
        <div className="lg:col-span-1">
          <PlanetaryHealthCard />
        </div>
      </div>


      {/* ──────────────────────────────────────────────────────────
          5. DIGITAL TWIN & 6. AI SITUATION ROOM (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Interactive Digital Twin Satellite Preview Panel */}
        <DigitalTwinPreview />

        {/* Dynamic AI Situation Room Component */}
        <AISituationRoom />
      </div>


      {/* ──────────────────────────────────────────────────────────
          6. RECENT OPERATIONS & QUICK ACTIONS (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Operational Activity Timeline (2 Cols) */}
        <div className="lg:col-span-2">
          <LiveOperationalTimeline limit={6} />
        </div>

        {/* Operational Quick Action Hub (1 Col) */}
        <div className="lg:col-span-1">
          <QuickActionHub />
        </div>
      </div>


      {/* ──────────────────────────────────────────────────────────
          7. NOTIFICATION & SYSTEM TELEMETRY PANEL (Full-Width)
      ────────────────────────────────────────────────────────── */}
      <div>
        <NotificationStatusPanel />
      </div>

    </motion.div>
  );
}
