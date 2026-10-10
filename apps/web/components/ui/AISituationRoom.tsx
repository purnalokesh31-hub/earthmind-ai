'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { Card } from './Card';
import { Button } from './Button';
import { SeverityBadge, CategoryBadge, StatusBadge } from './Badge';
import {
  Sparkles,
  ShieldAlert,
  MapPin,
  FileText,
  UserCheck,
  ExternalLink,
  ArrowRight,
  Brain,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident } from '../../types';

export const AISituationRoom: React.FC = () => {
  const {
    incidents,
    setSelectedIncident,
    setActiveTab,
    openReportModal,
    addToast,
    openConfirmDialog,
  } = useAppStore();

  // Dynamic AI contextual analysis of currently available incidents
  const aiAnalysis = useMemo(() => {
    // 1. Find most critical unresolved incident
    const criticalList = incidents.filter(i => i.status !== 'resolved');
    const mostCritical = criticalList.find(i => i.severity === 'critical') ||
      criticalList.find(i => i.severity === 'high') ||
      criticalList[0] ||
      incidents[0];

    if (!mostCritical) {
      return {
        assessment: 'SYSTEM OPTIMAL // ALL DOMAINS NORMAL',
        mostCritical: null,
        riskSummary: 'No active critical hazards detected. All telemetry feeds operating within baseline SLA parameters.',
        priorityRecommendation: 'Maintain routine satellite stream monitoring and standard drone surveillance patrols.',
        suggestedDepartment: 'Planetary Intelligence Command',
        predictedImpact: 'Zero SLA disruption expected',
        recommendedNextAction: 'Proceed with routine maintenance schedules',
        confidence: 99,
      };
    }

    // Contextual department mapping
    const deptNames: Record<string, string> = {
      infrastructure: 'Infrastructure Intelligence Command',
      agriculture: 'Agriculture Intelligence Command',
      environment: 'Environmental Intelligence Command',
      disaster: 'Disaster Intelligence Command',
      water: 'Water Intelligence Command',
      energy: 'Energy Intelligence Command',
      urban: 'Urban Intelligence Command',
      climate: 'Climate Intelligence Command',
      wildlife: 'Wildlife Intelligence Command',
    };

    const suggestedDepartment = deptNames[mostCritical.category] || 'Multi-Domain Command Center';

    // Dynamic contextual recommendations based on category and title
    let assessment = 'CRITICAL MULTI-DOMAIN HAZARD CLUSTER';
    let riskSummary = `Active structural hazard "${mostCritical.title}" detected at ${mostCritical.location?.name || 'Vijayawada Region'}. Risk of escalation is high without immediate ground intervention.`;
    let priorityRecommendation = 'Deploy heavy response unit for immediate site containment and structural stabilization.';
    let predictedImpact = 'Potential 4.5 hr transit delay and ₹850,000 repair cost if unmitigated.';
    let recommendedNextAction = 'Authorize immediate emergency unit dispatch & issue public safety advisory.';

    if (mostCritical.category === 'infrastructure') {
      assessment = 'CRITICAL INFRASTRUCTURE DEGRADATION DETECTED';
      riskSummary = `Asphalt deterioration and vertical cracking on asphalt surface at ${mostCritical.location?.name || 'Benz Circle'}. Heavy vehicle load poses imminent collapse hazard.`;
      priorityRecommendation = 'Erect structural shoring barriers, re-route heavy commercial transit to Ward 14 bypass, and dispatch asphalt repair team.';
      predictedImpact = 'Est. 4.5 hr corridor bottleneck // ₹350,000 structural repair cost';
      recommendedNextAction = 'Deploy immediate road repair crew & update public traffic routing map.';
    } else if (mostCritical.category === 'disaster' || mostCritical.category === 'water') {
      assessment = 'ELEVATED HYDROLOGICAL & FLOOD INUNDATION THREAT';
      riskSummary = `Precipitation runoff (+34mm/hr) combined with drainage blockages near ${mostCritical.location?.name || 'Krishna River Basin'} poses an 88% flood inundation risk over the next 4 hours.`;
      priorityRecommendation = 'Activate auxiliary pumping stations at 100% capacity, clear main spillway gates, and prepare Zone C evacuation route.';
      predictedImpact = 'Potential 200+ household inundation // 6.2 hr drainage clearing delay';
      recommendedNextAction = 'Dispatch emergency pumping units & issue flood watch alert for low-lying wards.';
    } else if (mostCritical.category === 'agriculture') {
      assessment = 'CROP HEALTH DEGRADATION & PEST THREAT';
      riskSummary = `Spotted leaf blight and pest infestation detected across 42 hectares of agricultural land. High potential for rapid crop yield reduction.`;
      priorityRecommendation = 'Deploy targeted bio-pesticide drone spraying, adjust soil nitrate levels, and isolate affected harvest zones.';
      predictedImpact = '12% harvest yield loss if unmitigated within 24 hours';
      recommendedNextAction = 'Authorize drone spraying operation & dispatch agricultural extension officer.';
    }

    return {
      assessment,
      mostCritical,
      riskSummary,
      priorityRecommendation,
      suggestedDepartment,
      predictedImpact,
      recommendedNextAction,
      confidence: 96,
    };
  }, [incidents]);

  const { mostCritical } = aiAnalysis;

  // Action Button Handlers
  const handleOpenIncident = () => {
    if (mostCritical) {
      setSelectedIncident(mostCritical);
      setActiveTab('incidents');
      addToast({ title: 'Case Selected', message: `Opened incident ${mostCritical.id} details in Operations view.`, type: 'info' });
    }
  };

  const handleOpenMap = () => {
    if (mostCritical) {
      setSelectedIncident(mostCritical);
      setActiveTab('map');
      addToast({ title: 'GIS Centered', message: `Map camera focused on ${mostCritical.id} coordinates.`, type: 'info' });
    }
  };

  const handleAssignOfficer = () => {
    if (!mostCritical) return;
    openConfirmDialog({
      title: `Assign Officer to ${mostCritical.id}`,
      message: `Assign Officer Lokesh (Senior Field Supervisor) as primary response officer for "${mostCritical.title}"?`,
      confirmLabel: 'Assign Officer Lokesh',
      onConfirm: () => {
        addToast({
          title: 'Officer Assigned',
          message: `Officer Lokesh dispatched to ${mostCritical.id} (${mostCritical.location?.name || 'Vijayawada'}).`,
          type: 'success',
        });
      },
    });
  };

  const handleGenerateReport = () => {
    if (!mostCritical) return;
    openReportModal(mostCritical.category, `AI Executive Situation Briefing — ${mostCritical.id}`);
  };

  return (
    <Card className="flex flex-col justify-between border-cyan-500/40 bg-cyan-950/10 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-inner">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">AI Situation Room</h3>
                <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                  {aiAnalysis.confidence}% CONFIDENCE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Real-time contextual hazard assessment & predictive dispatch</p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI COPILOT ACTIVE
          </span>
        </div>

        {/* ── 1. CURRENT AI EXECUTIVE SUMMARY BANNER ── */}
        <div className="mt-4 p-3 rounded-xl bg-[#050B14] border border-cyan-500/30 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Executive Summary:</span>
            <span className="text-xs font-black font-mono text-cyan-300 tracking-tight">{aiAnalysis.assessment}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Updated 1s ago</span>
        </div>

        {/* ── 2. MOST CRITICAL INCIDENT HIGHLIGHT & DETECTED OBJECT CHIPS ── */}
        {mostCritical && (
          <div className="my-3 p-3.5 rounded-xl bg-[#08101E] border border-rose-500/30 flex flex-col gap-2 z-10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400">VISION AI TARGET CASE</span>
                <span className="font-mono text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded">
                  {mostCritical.id}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  Risk Score: {Math.round((78 * 0.7) + (aiAnalysis.confidence * 0.3))}/100
                </span>
              </div>
              <SeverityBadge severity={mostCritical.severity} />
            </div>

            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{mostCritical.title}</span>
            </h4>

            {/* Detected Objects Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[9px] text-slate-400 font-mono">Detected Objects:</span>
              {['Structural Crack', 'Asphalt Subsidence', 'Sub-grade Cavity'].map((obj, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  {obj}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {mostCritical.location?.name || 'Vijayawada Sector'}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-400" />
                <CategoryBadge category={mostCritical.category} />
              </span>
              <span className="flex items-center gap-1">
                <StatusBadge status={mostCritical.status} />
              </span>
            </div>
          </div>
        )}

        {/* ── 3. ROOT CAUSE & 4. PREDICTED ESCALATION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 z-10 relative">
          
          {/* Root Cause Analysis */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Root Cause Analysis
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              Heavy Commercial Axle Load combined with Sub-base Water Infiltration Shear across Ward 12 corridor.
            </p>
          </div>

          {/* Predicted Escalation */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-rose-500/20 flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Predicted Escalation Timeline
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              High risk of sub-grade collapse within 4.5 hours if unmitigated. Estimated damage cost increase: +₹4,50,000.
            </p>
          </div>
        </div>

        {/* ── 5. MITIGATION STRATEGY & SUGGESTED RESOURCES ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 z-10 relative text-[10px]">
          
          {/* Mitigation Strategy */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-cyan-500/20 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Mitigation Strategy
            </span>
            <ul className="space-y-1 text-slate-300 font-mono text-[9.5px]">
              <li>1. Isolate localized hazard boundary within 50m radius</li>
              <li>2. Reroute commercial freight traffic to Ward 14 bypass</li>
              <li>3. Deploy PWD rapid repair team for asphalt trenching</li>
            </ul>
          </div>

          {/* Suggested Resources */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-emerald-500/20 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Suggested Resources
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[9px]">
                PWD Repair Truck #4
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[9px]">
                300mm Isolation Valve
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[9px]">
                Shoring Barriers (x6)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-cyan-500/20 mt-2 z-10 relative">
        <Button
          variant="primary"
          size="sm"
          className="text-[10px] py-1.5 px-3"
          leftIcon={<ExternalLink className="w-3 h-3" />}
          onClick={handleOpenIncident}
        >
          Open Incident
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-[10px] py-1.5 px-3 border-white/10 text-slate-200 hover:border-cyan-500/40"
          leftIcon={<MapPin className="w-3 h-3 text-cyan-400" />}
          onClick={handleOpenMap}
        >
          Open Map
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-[10px] py-1.5 px-3 border-white/10 text-slate-200 hover:border-emerald-500/40"
          leftIcon={<UserCheck className="w-3 h-3 text-emerald-400" />}
          onClick={handleAssignOfficer}
        >
          Assign Officer
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-[10px] py-1.5 px-3 border-white/10 text-slate-200 hover:border-indigo-500/40 ml-auto"
          leftIcon={<FileText className="w-3 h-3 text-indigo-400" />}
          onClick={handleGenerateReport}
        >
          Generate Report
        </Button>
      </div>
    </Card>
  );
};
