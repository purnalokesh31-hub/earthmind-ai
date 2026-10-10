// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Report Service
// ──────────────────────────────────────────────────────────────
// Generates, exports, and manages incident reports.
// Current: Mock report generation. Future: PDF/Excel export
// via backend, email distribution, scheduled reports.
// ──────────────────────────────────────────────────────────────

import { useAppStore } from '../../stores/app-store';
import type {
  Incident,
  ReportTemplate,
  Category,
  Severity,
} from '../../types';

const store = () => useAppStore.getState();
const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const now = () => new Date().toISOString();
const mockDelay = (ms = 150): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────────────────────
// Data Types
// ──────────────────────────────────────────────────────────────

export interface GeneratedReport {
  id: string;
  templateId: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'json' | 'html';
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  summary: ReportSummary;
}

export interface ReportSummary {
  totalIncidents: number;
  resolvedIncidents: number;
  criticalActive: number;
  avgResolutionHours: number;
  topCategories: Array<{ category: string; count: number }>;
  periodStart: string;
  periodEnd: string;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRunAt: string;
  lastRunAt?: string;
  enabled: boolean;
}

// ──────────────────────────────────────────────────────────────
// Report Templates
// ──────────────────────────────────────────────────────────────

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'rpt-daily', label: 'Daily Operations Summary', icon: '📋', description: 'End‑of‑day summary of all incidents, resolutions, and pending actions.', frequency: 'daily' },
  { id: 'rpt-weekly', label: 'Weekly Analytics Report', icon: '📊', description: 'Weekly trend analysis, department performance, and SLA compliance.', frequency: 'weekly' },
  { id: 'rpt-monthly', label: 'Monthly Executive Report', icon: '📈', description: 'Comprehensive monthly report for executive stakeholders.', frequency: 'monthly' },
  { id: 'rpt-emergency', label: 'Emergency Situation Report', icon: '🚨', description: 'Real‑time critical incident report with AI analysis and resource deployment.', frequency: 'emergency' },
  { id: 'rpt-earth', label: 'Planetary Health Report', icon: '🌍', description: 'Earth Impact analysis showing environmental metrics and recovery projections.', frequency: 'monthly' },
  { id: 'rpt-dept', label: 'Department Performance Report', icon: '🏛️', description: 'Per‑department breakdown of incidents handled, SLA compliance, and response times.', frequency: 'weekly' },
];

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  await mockDelay();
  return REPORT_TEMPLATES;
}

// ──────────────────────────────────────────────────────────────
// Report Generation
// ──────────────────────────────────────────────────────────────

export async function generateReport(
  templateId: string,
  options?: {
    format?: GeneratedReport['format'];
    dateRange?: { start: string; end: string };
    category?: Category;
    severity?: Severity;
  },
): Promise<GeneratedReport> {
  await mockDelay(600); // simulate generation

  const template = REPORT_TEMPLATES.find((t) => t.id === templateId);
  const incidents = store().incidents;
  const user = store().currentUser;

  // Build summary
  const filtered = applyFilters(incidents, options);
  const resolved = filtered.filter((i) => i.status === 'resolved');

  const categoryCount = new Map<string, number>();
  filtered.forEach((i) => {
    categoryCount.set(i.category, (categoryCount.get(i.category) || 0) + 1);
  });
  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const summary: ReportSummary = {
    totalIncidents: filtered.length,
    resolvedIncidents: resolved.length,
    criticalActive: filtered.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
    avgResolutionHours: 4.5 + Math.random() * 3,
    topCategories,
    periodStart: options?.dateRange?.start || new Date(Date.now() - 7 * 86400000).toISOString(),
    periodEnd: options?.dateRange?.end || now(),
  };

  const report: GeneratedReport = {
    id: uid('rpt'),
    templateId,
    title: template?.label || 'Custom Report',
    generatedAt: now(),
    generatedBy: user?.name || 'system',
    format: options?.format || 'pdf',
    status: 'ready',
    downloadUrl: `#/reports/${uid('dl')}`, // mock URL
    summary,
  };

  // Audit
  import('./incident.service').then((svc) => {
    svc.logAuditEvent({
      incidentId: 'system',
      action: 'report_generated',
      actor: user?.name || 'system',
      details: `Report "${report.title}" generated (${report.format})`,
    });
  });

  return report;
}

// ──────────────────────────────────────────────────────────────
// Report History
// ──────────────────────────────────────────────────────────────

const reportHistory: GeneratedReport[] = [];

export async function getReportHistory(): Promise<GeneratedReport[]> {
  await mockDelay();
  return reportHistory;
}

// ──────────────────────────────────────────────────────────────
// Scheduled Reports (placeholder)
// ──────────────────────────────────────────────────────────────

const scheduledReports: ScheduledReport[] = [];

export async function listScheduledReports(): Promise<ScheduledReport[]> {
  await mockDelay();
  return scheduledReports;
}

export async function scheduleReport(data: {
  templateId: string;
  frequency: ScheduledReport['frequency'];
  recipients: string[];
}): Promise<ScheduledReport> {
  await mockDelay();
  const scheduled: ScheduledReport = {
    id: uid('sched'),
    templateId: data.templateId,
    frequency: data.frequency,
    recipients: data.recipients,
    nextRunAt: computeNextRun(data.frequency),
    enabled: true,
  };
  scheduledReports.push(scheduled);
  return scheduled;
}

export async function cancelScheduledReport(id: string): Promise<void> {
  await mockDelay();
  const idx = scheduledReports.findIndex((s) => s.id === id);
  if (idx >= 0) scheduledReports[idx].enabled = false;
}

// ──────────────────────────────────────────────────────────────
// Export Helpers
// ──────────────────────────────────────────────────────────────

export async function exportIncidentsAsJSON(): Promise<string> {
  await mockDelay();
  return JSON.stringify(store().incidents, null, 2);
}

export async function exportIncidentsAsCSV(): Promise<string> {
  await mockDelay();
  const incidents = store().incidents;
  const headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'Location', 'Reported At'];
  const rows = incidents.map((i) =>
    [i.id, `"${i.title}"`, i.category, i.severity, i.status, `"${i.location.name}"`, i.reportedAt].join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

// ──────────────────────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────────────────────

function applyFilters(
  incidents: Incident[],
  options?: {
    dateRange?: { start: string; end: string };
    category?: Category;
    severity?: Severity;
  },
): Incident[] {
  let list = incidents;
  if (options?.category) list = list.filter((i) => i.category === options.category);
  if (options?.severity) list = list.filter((i) => i.severity === options.severity);
  if (options?.dateRange) {
    const start = new Date(options.dateRange.start).getTime();
    const end = new Date(options.dateRange.end).getTime();
    list = list.filter((i) => {
      const t = new Date(i.reportedAt).getTime();
      return t >= start && t <= end;
    });
  }
  return list;
}

function computeNextRun(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'daily': now.setDate(now.getDate() + 1); break;
    case 'weekly': now.setDate(now.getDate() + 7); break;
    case 'monthly': now.setMonth(now.getMonth() + 1); break;
  }
  return now.toISOString();
}
