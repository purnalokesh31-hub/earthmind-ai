'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { INSIGHT_TABS, generateInsights, type InsightTab } from '../../lib/demo-data';
import { KPICard, AnalyticsCard, Tabs, Select } from '../ui';
import { cn } from '../../lib/utils';

// SVG mini chart data for each tab
const CHART_BARS: Record<InsightTab, number[]> = {
  Overview:       [35, 58, 42, 70, 55, 82, 65, 90, 75, 60, 85, 78],
  Infrastructure: [70, 55, 65, 40, 72, 50, 68, 45, 60, 52, 75, 58],
  Water:          [85, 88, 82, 90, 87, 91, 85, 89, 92, 88, 90, 93],
  Climate:        [40, 55, 60, 72, 45, 68, 50, 75, 58, 80, 62, 70],
  Energy:         [78, 82, 75, 88, 80, 72, 85, 78, 90, 82, 86, 88],
  Environment:    [90, 88, 92, 85, 91, 87, 93, 90, 88, 92, 90, 95],
};

const CHART_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightTab>('Overview');
  const [timeframe, setTimeframe] = useState('30d');
  const { incidents } = useAppStore();

  const filteredIncidents = React.useMemo(() => {
    const now = Date.now();
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'yr': 365,
    };
    const days = daysMap[timeframe] || 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    const filtered = incidents.filter((inc) => {
      const incDate = inc.createdAt
        ? new Date(inc.createdAt).getTime()
        : (inc.reportedAt ? new Date(inc.reportedAt).getTime() : now);
      return incDate >= cutoff;
    });
    return filtered.length > 0 ? filtered : incidents;
  }, [incidents, timeframe]);

  const kpis = generateInsights(filteredIncidents)[activeTab as keyof ReturnType<typeof generateInsights>] || [];

  const { bars, labels } = React.useMemo(() => {
    const raw = CHART_BARS[activeTab] || [50, 60, 70, 80];
    if (timeframe === '7d') {
      return {
        bars: raw.slice(-7),
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(-raw.slice(-7).length),
      };
    }
    if (timeframe === '30d') {
      return {
        bars: raw.slice(-4),
        labels: ['W1', 'W2', 'W3', 'W4'],
      };
    }
    if (timeframe === '90d') {
      return {
        bars: raw.slice(-6),
        labels: ['Month -2', 'Month -1', 'Current Month', 'Week 1', 'Week 2', 'Week 3'].slice(0, 6),
      };
    }
    return {
      bars: raw,
      labels: CHART_LABELS,
    };
  }, [activeTab, timeframe]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-20 lg:pb-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">Insights</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Actionable intelligence across all operational domains</p>
        </div>
        <div>
          <Select
            options={[
              { value: '30d', label: 'Last 30 Days' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: 'yr', label: 'This Year' },
            ]}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Tab Pills */}
      <Tabs
        tabs={INSIGHT_TABS.map((t) => ({ id: t, label: t }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as InsightTab)}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={`${activeTab}-${kpi.label}`}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            isPositive={kpi.up}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Main Chart Area */}
      <AnalyticsCard title={`${activeTab} — Monthly Trend`}>
        <div className="relative h-48">
          <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={200 - y * 2} x2="600" y2={200 - y * 2} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
            ))}

            {/* Bars */}
            {bars.map((val, i) => {
              const barWidth = Math.min(36, 480 / (bars.length || 1));
              const gap = (600 - bars.length * barWidth) / (bars.length + 1);
              const x = gap + i * (barWidth + gap);
              const height = val * 1.8;
              return (
                <g key={i}>
                  <rect x={x} y={200 - 90 * 1.8} width={barWidth / 2 - 1} height={90 * 1.8} rx="3" fill="rgba(255, 255, 255, 0.05)" />
                  <motion.rect
                    x={x + barWidth / 2 + 1}
                    y={200}
                    width={barWidth / 2 - 1}
                    rx="3"
                    fill="url(#barGradient)"
                    initial={{ height: 0, y: 200 }}
                    animate={{ height: height, y: 200 - height }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  />
                </g>
              );
            })}

            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex justify-between px-2 mt-2">
            {labels.map(label => (
              <span key={label} className="text-[8px] text-slate-500 font-mono">{label}</span>
            ))}
          </div>
        </div>
      </AnalyticsCard>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsCard title="Performance Metrics">
          <div className="flex flex-col gap-3">
            {[
              { label: 'Average Response Time', value: '2.3 hrs', trend: '-15%', good: true },
              { label: 'Resolution Rate', value: '87%', trend: '+5%', good: true },
              { label: 'AI Accuracy', value: '91%', trend: '+2%', good: true },
              { label: 'Citizen Satisfaction', value: '4.2/5', trend: '+0.3', good: true },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-[11px] text-slate-400">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-200">{m.value}</span>
                  <span className={cn('text-[9px] font-bold', m.good ? 'text-cyan-400' : 'text-rose-400')}>{m.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Category Breakdown">
          <div className="flex flex-col gap-3">
            {[
              { cat: 'Infrastructure', pct: 35, color: 'bg-amber-500' },
              { cat: 'Water', pct: 25, color: 'bg-blue-500' },
              { cat: 'Climate', pct: 20, color: 'bg-rose-500' },
              { cat: 'Energy', pct: 12, color: 'bg-violet-500' },
              { cat: 'Environment', pct: 8, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={item.cat}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-medium text-slate-400">{item.cat}</span>
                  <span className="text-[10px] font-bold text-slate-200">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={cn('h-1.5 rounded-full', item.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>
    </motion.div>
  );
}
