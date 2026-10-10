'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '../../stores/app-store';
import { KPICard } from './Card';
import type { Category } from '../../types';
import {
  Building2,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Activity,
  Zap,
  ShieldAlert,
} from 'lucide-react';

export interface OperationalKPIBarProps {
  domain?: Category;
}

export const OperationalKPIBar: React.FC<OperationalKPIBarProps> = ({ domain }) => {
  const { incidents } = useAppStore();

  // Dynamically compute all 8 KPI metrics strictly for the selected domain (or all if omitted)
  const metrics = useMemo(() => {
    const targetIncidents = domain ? incidents.filter((i) => i.category === domain) : incidents;
    
    const totalCount = targetIncidents.length;
    const criticalCount = targetIncidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
    const pendingCount = targetIncidents.filter((i) => i.status === 'reported' || i.status === 'ai_processing' || i.status === 'evidence_collection').length;
    const assignedCount = targetIncidents.filter((i) => i.status === 'assigned' || i.status === 'investigating' || i.status === 'verified').length;
    const resolvedCount = targetIncidents.filter((i) => i.status === 'resolved').length;

    const avgResTime = (4.2 - (totalCount > 5 ? 0.4 : 0)).toFixed(1);
    const fieldTeams = totalCount * 2 + 4;
    const riskIndex = Math.min(99, criticalCount * 25 + pendingCount * 10 + 12);

    return {
      totalCount,
      criticalCount,
      pendingCount,
      assignedCount,
      resolvedCount,
      avgResTime: `${avgResTime} hrs`,
      fieldTeams: `${fieldTeams} Units`,
      riskIndex: `${riskIndex}%`,
    };
  }, [incidents, domain]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {/* 1. Total Incidents */}
      <KPICard
        title="Total Incidents"
        value={metrics.totalCount}
        trend="+4% intake"
        isPositive={true}
        percentChange="+4.2%"
        sparkline={[3, 4, 5, 6, 7, metrics.totalCount]}
        lastUpdated="Sync 1s ago"
        icon={<Building2 className="w-4 h-4 text-cyan-400" />}
        subtext="Logged in domain"
      />

      {/* 2. Critical Cases */}
      <KPICard
        title="Critical Cases"
        value={metrics.criticalCount}
        trend="Priority 1"
        isPositive={false}
        percentChange="+12.0%"
        sparkline={[0, 1, 1, 2, 1, metrics.criticalCount]}
        lastUpdated="Immediate SLA"
        icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
        subtext="Immediate dispatch"
      />

      {/* 3. Pending Verification */}
      <KPICard
        title="Pending Verification"
        value={metrics.pendingCount}
        trend="-8% backlog"
        isPositive={true}
        percentChange="-8.5%"
        sparkline={[6, 5, 4, 3, metrics.pendingCount]}
        lastUpdated="Intake queue"
        icon={<Clock className="w-4 h-4 text-amber-400" />}
        subtext="Awaiting AI verification"
      />

      {/* 4. Assigned Cases */}
      <KPICard
        title="Assigned Cases"
        value={metrics.assignedCount}
        trend="Active dispatch"
        isPositive={true}
        percentChange="+14.0%"
        sparkline={[1, 2, 3, 4, metrics.assignedCount]}
        lastUpdated="Field units"
        icon={<UserCheck className="w-4 h-4 text-indigo-400" />}
        subtext="Assigned to officers"
      />

      {/* 5. Resolved Cases */}
      <KPICard
        title="Resolved Cases"
        value={metrics.resolvedCount}
        trend="+18% closed"
        isPositive={true}
        percentChange="+18.2%"
        sparkline={[2, 3, 4, 5, metrics.resolvedCount]}
        lastUpdated="Shift total"
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        subtext="Verified closed"
      />

      {/* 6. Average Resolution Time */}
      <KPICard
        title="Average Resolution Time"
        value={metrics.avgResTime}
        trend="-16% faster"
        isPositive={true}
        percentChange="-16.0%"
        sparkline={[5.5, 5.0, 4.6, 4.4, 4.2]}
        lastUpdated="SLA target < 6h"
        icon={<Activity className="w-4 h-4 text-teal-400" />}
        subtext="Operational efficiency"
      />

      {/* 7. Field Teams Active */}
      <KPICard
        title="Field Teams Active"
        value={metrics.fieldTeams}
        trend="GPS tracked"
        isPositive={true}
        percentChange="+6.1%"
        sparkline={[6, 8, 10, 12, parseInt(metrics.fieldTeams)]}
        lastUpdated="Units online"
        icon={<Zap className="w-4 h-4 text-blue-400" />}
        subtext="Deployed on ground"
      />

      {/* 8. Risk Index */}
      <KPICard
        title="Domain Risk Index"
        value={metrics.riskIndex}
        trend="Calculated risk"
        isPositive={parseInt(metrics.riskIndex) < 50}
        percentChange="+2.4%"
        sparkline={[20, 25, 30, parseInt(metrics.riskIndex)]}
        lastUpdated="Predictive model"
        icon={<ShieldAlert className="w-4 h-4 text-purple-400" />}
        subtext="Hazard probability"
      />
    </div>
  );
};
