'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import {
  Button,
  SearchInput,
  Table,
  SeverityBadge,
  StatusBadge,
  CategoryBadge,
  KPICard,
  Card,
  Input,
  TextArea,
  DigitalTwinPreview,
  AISituationRoom,
  LiveOperationalTimeline,
  EnterpriseWorkspaceHeader,
  OperationalKPIBar,
  EnterpriseFilterSystem,
  IncidentManagementPanel,
  OperationalLifecycleTimeline,
  WorkspaceAnalyticsSummary,
  EvidencePreviewPanel,
  QuickActionHub,
} from '../ui';
import { applyEnterpriseFilters } from '../ui/EnterpriseFilterSystem';
import { formatDate } from '../../lib/utils';
import type { Category, Severity, IncidentStatus, Incident } from '../../types';
import {
  ArrowLeft,
  Camera,
  Send,
  Sparkles,
  Filter,
  Layers,
  MapPin,
  FileText,
  Activity,
  Zap,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MODULE_META: Record<Category, { title: string; icon: string; desc: string; defaultTag: string; subCategories: { name: string; health: number }[] }> = {
  infrastructure: {
    title: 'Infrastructure Intelligence Command Center',
    icon: '🏗️',
    desc: 'Operational command for public works, road quality, and electrical utilities.',
    defaultTag: 'POTHOLE',
    subCategories: [
      { name: 'Road Surface Integrity', health: 88 },
      { name: 'Bridge & Overpass Load', health: 94 },
      { name: 'Sub-surface Asphalt', health: 82 },
      { name: 'Utility Corridor Grid', health: 91 },
    ],
  },
  agriculture: {
    title: 'Agriculture Intelligence Command Center',
    icon: '🌿',
    desc: 'Crop health evaluation, pest detection, and soil adjustment telemetry.',
    defaultTag: 'CROP DISEASE',
    subCategories: [
      { name: 'Soil Moisture Index', health: 91 },
      { name: 'Crop Leaf Blight Risk', health: 84 },
      { name: 'Irrigation Gate Flow', health: 95 },
      { name: 'Pest Vector Density', health: 89 },
    ],
  },
  environment: {
    title: 'Environmental Intelligence Command Center',
    icon: '🌍',
    desc: 'Illegal dumping tracking, green coverage monitoring, and emissions detection.',
    defaultTag: 'ILLEGAL DUMPING',
    subCategories: [
      { name: 'Canopy Density Index', health: 86 },
      { name: 'Waste Disposal Sites', health: 79 },
      { name: 'Air Particulate AQI', health: 88 },
      { name: 'Eco-Reserve Buffer', health: 93 },
    ],
  },
  disaster: {
    title: 'Disaster Intelligence Command Center',
    icon: '🌊',
    desc: 'Simulation and prediction of flood paths, landslide hazards, and cyclone damage.',
    defaultTag: 'FLOOD INUNDATION RISK',
    subCategories: [
      { name: 'Spillway Capacity', health: 76 },
      { name: 'River Basin Runoff', health: 82 },
      { name: 'Evacuation Route SLA', health: 94 },
      { name: 'Shelter Readiness', health: 98 },
    ],
  },
  water: {
    title: 'Water Intelligence Command Center',
    icon: '💧',
    desc: 'Pipeline leakage detection, groundwater trends, and water quality telemetry.',
    defaultTag: 'WATER LEAKAGE',
    subCategories: [
      { name: 'Pipeline Pressure', health: 92 },
      { name: 'Potable Quality PH', health: 96 },
      { name: 'Aquifer Depth Rate', health: 87 },
      { name: 'Drainage Flow Rate', health: 84 },
    ],
  },
  energy: {
    title: 'Energy Intelligence Command Center',
    icon: '⚡',
    desc: 'Transformer health, grid fault tracking, and solar panel damage analysis.',
    defaultTag: 'SOLAR PANEL DAMAGE',
    subCategories: [
      { name: 'Substation Voltage', health: 95 },
      { name: 'Transformer Temp', health: 89 },
      { name: 'Solar Grid Yield', health: 93 },
      { name: 'Line Fault Alarm', health: 91 },
    ],
  },
  urban: {
    title: 'Urban Intelligence Command Center',
    icon: '🏢',
    desc: 'Traffic bottleneck monitoring, parking density, and waste management.',
    defaultTag: 'TRAFFIC CONGESTION',
    subCategories: [
      { name: 'Corridor Transit Speed', health: 87 },
      { name: 'Traffic Signal Sync', health: 93 },
      { name: 'Municipal Sanitation', health: 85 },
      { name: 'Parking Capacity', health: 90 },
    ],
  },
  climate: {
    title: 'Climate Intelligence Command Center',
    icon: '🌎',
    desc: 'Urban heat island mapping and carbon footprint projection statistics.',
    defaultTag: 'URBAN HEAT ISLAND',
    subCategories: [
      { name: 'Thermal Radiance', health: 83 },
      { name: 'Carbon Absorption', health: 88 },
      { name: 'Surface Albedo Rate', health: 90 },
      { name: 'Microclimate Delta', health: 86 },
    ],
  },
  wildlife: {
    title: 'Wildlife Intelligence Command Center',
    icon: '🦜',
    desc: 'Illegal corridor encroachment detection and animal species identification.',
    defaultTag: 'FOREST ENCROACHMENT',
    subCategories: [
      { name: 'Corridor Boundary', health: 92 },
      { name: 'Fauna Acoustic Track', health: 95 },
      { name: 'Fence Sensor Grid', health: 89 },
      { name: 'Habitat Integrity', health: 91 },
    ],
  },
};

export interface DomainWorkspacePageProps {
  domain?: string;
}

export default function DomainWorkspacePage({ domain: propsDomain }: DomainWorkspacePageProps = {}) {
  const {
    activeDomainWorkspace,
    setActiveDomainWorkspace,
    incidents,
    addIncident,
    setSelectedIncident,
    openReportModal,
    addToast,
    reportInitialTitle,
  } = useAppStore();

  const domain = (propsDomain as Category) || activeDomainWorkspace || 'infrastructure';
  const meta = MODULE_META[domain] || MODULE_META.infrastructure;

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | Severity>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | IncidentStatus>('all');

  // Form State for Evidence Intake
  const [formTitle, setFormTitle] = useState(reportInitialTitle || '');
  const [formDesc, setFormDesc] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [preScanActive, setPreScanActive] = useState(false);
  const [detectedIssue, setDetectedIssue] = useState('');
  const [detectedSeverity, setDetectedSeverity] = useState<Severity>('high');

  // Filter incidents strictly for this domain using shared enterprise filter engine
  const domainIncidents = useMemo(() => {
    return applyEnterpriseFilters(incidents, {
      search,
      severity: selectedSeverityFilter,
      status: selectedStatusFilter,
      category: domain,
      department: 'all',
      officer: 'all',
      dateRange: 'all',
      location: 'all',
      sortBy: 'newest',
    });
  }, [incidents, domain, search, selectedSeverityFilter, selectedStatusFilter]);

  const triggerMockUpload = () => {
    setPreScanActive(true);
    setDetectedIssue(`${meta.defaultTag} Detected`);
    setDetectedSeverity('high');
    setFormTitle(`${meta.defaultTag} — Priority Field Inspection`);
    setFormDesc(`Field telemetry identified anomaly matching ${meta.defaultTag}. Immediate department dispatch recommended.`);
    setFormPhoto('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop');
    addToast({ title: 'AI Pre-Scan Complete', message: `Computer vision identified ${meta.defaultTag} (94% confidence).`, type: 'success' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newId = `EM-${incidents.length + 301}`;
    const newIncident: Incident = {
      id: newId,
      title: formTitle,
      description: formDesc || `Logged within ${meta.title}`,
      category: domain,
      severity: detectedSeverity,
      status: 'reported' as IncidentStatus,
      location: {
        lat: 16.5085 + (Math.random() - 0.5) * 0.02,
        lng: 80.6410 + (Math.random() - 0.5) * 0.02,
        name: 'Benz Circle Command Ward 12',
        ward: 'Ward 12',
        zone: 'Zone A',
      },
      reportedBy: 'Field Commander',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: 't-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Case recorded in ${meta.title}`,
          icon: meta.icon,
          actor: 'Field Commander',
        },
      ],
      aiAnalysis: {
        confidence: 94,
        classification: detectedIssue || meta.defaultTag,
        severity: detectedSeverity,
        summary: `AI pre-scan confirmed high priority ${domain} anomaly. Dispatched for team verification.`,
        recommendations: ['Dispatch domain unit', 'Log GIS coordinates', 'Notify department lead'],
      },
    };

    addIncident(newIncident);
    setSelectedIncident(newIncident);
    addToast({ title: 'Case Recorded', message: `Incident ${newId} logged into ${meta.title}.`, type: 'success' });

    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setFormPhoto(null);
    setPreScanActive(false);
  };

  const columns = [
    {
      header: 'ID',
      cell: (row: Incident) => <span className="font-mono font-bold text-cyan-400">{row.id}</span>,
    },
    {
      header: 'Case Title',
      cell: (row: Incident) => (
        <div>
          <p className="font-bold text-slate-200 truncate max-w-[220px]">{row.title}</p>
          <p className="text-[9px] text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Severity',
      cell: (row: Incident) => <SeverityBadge severity={row.severity} />,
    },
    {
      header: 'Status',
      cell: (row: Incident) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Location',
      cell: (row: Incident) => (
        <span className="text-[10px] text-slate-400 font-medium">📍 {row.location?.name || 'Vijayawada'}</span>
      ),
    },
    {
      header: 'Reported',
      cell: (row: Incident) => <span className="font-mono text-[9px] text-slate-500">{formatDate(row.reportedAt)}</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 lg:pb-8"
    >
      {/* ──────────────────────────────────────────────────────────
          1. REUSABLE ENTERPRISE WORKSPACE HEADER
      ────────────────────────────────────────────────────────── */}
      <EnterpriseWorkspaceHeader
        domain={domain}
        title={meta.title}
        icon={meta.icon}
        description={meta.desc}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* ──────────────────────────────────────────────────────────
          2. OPERATIONAL KPI BAR (8 DYNAMIC WIDGETS)
      ────────────────────────────────────────────────────────── */}
      <OperationalKPIBar domain={domain} />

      {/* ──────────────────────────────────────────────────────────
          3. ADVANCED FILTERS & SEARCH SYSTEM
      ────────────────────────────────────────────────────────── */}
      <EnterpriseFilterSystem />

      {/* ──────────────────────────────────────────────────────────
          4. INCIDENT MANAGEMENT PANEL & 10. EVIDENCE PREVIEW (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 10. Digital Evidence Preview Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <EvidencePreviewPanel />
        </div>

        {/* 4. Incident Management Operations Directory (7 Cols) */}
        <div className="lg:col-span-7">
          <IncidentManagementPanel domain={domain} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          5. DIGITAL TWIN MAP & 6. AI CONTEXT PANEL (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DigitalTwinPreview />
        <AISituationRoom />
      </div>

      {/* ──────────────────────────────────────────────────────────
          7. OPERATIONAL TIMELINE & 8. ANALYTICS SUMMARY (2-Column)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 7. Operational Activity Lifecycle Timeline (7 Cols) */}
        <div className="lg:col-span-7">
          <OperationalLifecycleTimeline />
        </div>

        {/* 8. Workspace Analytics Summary (5 Cols) */}
        <div className="lg:col-span-5">
          <WorkspaceAnalyticsSummary domain={domain} />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          9. REUSABLE QUICK OPERATIONS SHORTCUTS HUB
      ────────────────────────────────────────────────────────── */}
      <QuickActionHub />

      {/* ──────────────────────────────────────────────────────────
          11. RECENT OPERATOR AUDIT FEED
      ────────────────────────────────────────────────────────── */}
      <Card className="flex flex-col justify-between border-white/10 p-5 bg-[#0A1220]/95">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  {domain.toUpperCase()} Recent Operator Audit Feed
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">AUDIT LOG</span>
            </div>

            <div className="flex flex-col divide-y divide-white/5 text-xs">
              {domainIncidents.slice(0, 4).map((inc) => (
                <div key={inc.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-xs font-mono">
                      {inc.id.split('-')[1]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 text-xs">{inc.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">📍 {inc.location?.name || 'Vijayawada'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <StatusBadge status={inc.status} />
                    <span className="text-slate-500">{formatDate(inc.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Audit trail compliant with ISO-27001 telemetry standards.</span>
            <span className="text-emerald-400 font-bold">SECURE LOG</span>
          </div>
        </Card>

    </motion.div>
  );
}
