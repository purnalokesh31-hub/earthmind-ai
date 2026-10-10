// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 9: Command Center Filtering Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { applyEnterpriseFilters, FilterState } from '@/lib/utils/filter-engine';
import type { Incident } from '@/types';

describe('TASK 9 — Command Center Filtering Suite', () => {
  const sampleIncidents: Incident[] = [
    {
      id: 'EM-101',
      title: 'NH-9 Highway Asphalt Subsidence',
      description: 'Major fissure detected on southbound express corridor.',
      category: 'infrastructure',
      severity: 'critical',
      status: 'investigating',
      location: { lat: 16.5085, lng: 80.6410, name: 'Benz Circle Ward 12' },
      reportedBy: 'Officer Lokesh',
      reportedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
    {
      id: 'EM-102',
      title: 'Krishna Canal Spillway Overflow',
      description: 'Secondary drainage gates partially jammed during high tide.',
      category: 'water',
      severity: 'high',
      status: 'reported',
      location: { lat: 16.5120, lng: 80.6200, name: 'Canal Lock Gate 4' },
      reportedBy: '',
      reportedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
    {
      id: 'EM-103',
      title: 'Industrial Chemical Leak Report',
      description: 'Minor ammonia odor detected near industrial feeder line.',
      category: 'environment',
      severity: 'medium',
      status: 'resolved',
      location: { lat: 16.4900, lng: 80.6500, name: 'AutoNagar Sector 7' },
      reportedBy: 'Officer Ramesh',
      reportedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
    {
      id: 'EM-104',
      title: 'Substation Transformer Overheating',
      description: 'Thermal camera flagged unit #2 exceeding 95C.',
      category: 'energy',
      severity: 'low',
      status: 'reported',
      location: { lat: 16.5200, lng: 80.6300, name: 'Gunadala Substation' },
      reportedBy: 'Officer Lokesh',
      reportedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
  ];

  const defaultFilters: FilterState = {
    search: '',
    severity: 'all',
    status: 'all',
    category: 'all',
    department: 'all',
    officer: 'all',
    dateRange: 'all',
    location: 'all',
    sortBy: 'newest',
  };

  it('filters incidents by keyword search matching title, id, and location', () => {
    const resTitle = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, search: 'Highway' });
    expect(resTitle).toHaveLength(1);
    expect(resTitle[0].id).toBe('EM-101');

    const resId = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, search: 'EM-102' });
    expect(resId).toHaveLength(1);
    expect(resId[0].title).toContain('Krishna Canal');

    const resLoc = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, search: 'AutoNagar' });
    expect(resLoc).toHaveLength(1);
    expect(resLoc[0].id).toBe('EM-103');
  });

  it('filters incidents by severity level', () => {
    const resCritical = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, severity: 'critical' });
    expect(resCritical).toHaveLength(1);
    expect(resCritical[0].id).toBe('EM-101');

    const resHigh = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, severity: 'high' });
    expect(resHigh).toHaveLength(1);
    expect(resHigh[0].id).toBe('EM-102');
  });

  it('filters incidents by status', () => {
    const resResolved = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, status: 'resolved' });
    expect(resResolved).toHaveLength(1);
    expect(resResolved[0].id).toBe('EM-103');

    const resReported = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, status: 'reported' });
    expect(resReported).toHaveLength(2);
  });

  it('filters incidents by domain category', () => {
    const resWater = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, category: 'water' });
    expect(resWater).toHaveLength(1);
    expect(resWater[0].id).toBe('EM-102');
  });

  it('filters incidents by date range (today, 7days, 30days)', () => {
    const resToday = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, dateRange: 'today' });
    expect(resToday).toHaveLength(1);
    expect(resToday[0].id).toBe('EM-101');

    const res7Days = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, dateRange: '7days' });
    expect(res7Days).toHaveLength(2);

    const res30Days = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, dateRange: '30days' });
    expect(res30Days).toHaveLength(3);
  });

  it('handles combined multi-criteria filters simultaneously', () => {
    const res = applyEnterpriseFilters(sampleIncidents, {
      ...defaultFilters,
      category: 'infrastructure',
      severity: 'critical',
      status: 'investigating',
      dateRange: 'today',
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('EM-101');
  });

  it('correctly ranks incidents by severity when sorted by severity', () => {
    const sorted = applyEnterpriseFilters(sampleIncidents, { ...defaultFilters, sortBy: 'severity' });
    expect(sorted.map(s => s.severity)).toEqual(['critical', 'high', 'medium', 'low']);
  });
});
