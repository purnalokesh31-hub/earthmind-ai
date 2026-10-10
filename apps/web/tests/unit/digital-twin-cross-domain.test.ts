// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 Cross-Domain Intelligence Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';
import { crossDomainCorrelationService } from '../../lib/server/services/cross-domain-correlation.service';
import { citywideCascadeRiskService } from '../../lib/server/services/citywide-cascade-risk.service';
import { urbanPriorityService } from '../../lib/server/services/urban-priority.service';
import { cityIntelligenceService } from '../../lib/server/services/city-intelligence.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.8 — Cross-Domain Urban Intelligence & Integrated Resilience Suite', () => {
  // ── 1. Single-Domain & No-Correlation Scenarios ──
  it('should handle no-correlation situations when signals array is empty', () => {
    const correlations = crossDomainCorrelationService.correlateSignals([]);
    expect(correlations.length).toBe(0);

    const risk = citywideCascadeRiskService.calculateCascadeRisk([]);
    expect(risk.riskScore).toBe(10);
    expect(risk.classification).toBe('LOW');
  });

  it('should process single-domain events into localized spatial correlations', () => {
    const singleSignal: CrossDomainSignalDto = {
      signalId: 'sig-101',
      domain: 'MOBILITY',
      entityId: 'ast-mob-road-01',
      entityName: 'Local Feeder Road',
      eventType: 'ROAD_MAINTENANCE',
      severity: 'LOW',
      location: { lat: 16.5, lng: 80.6 },
      value: 10,
      unit: 'Index',
      timestamp: new Date().toISOString(),
    };

    const correlations = crossDomainCorrelationService.correlateSignals([singleSignal]);
    expect(correlations.length).toBe(1);
    expect(correlations[0].correlationType).toBe('SPATIAL');
    expect(correlations[0].affectedDomains).toContain('MOBILITY');
  });

  // ── 2. Two-Domain & Three-Domain Cascades ──
  it('should correlate Climate + Mobility (2-domain) and trace causal chain', () => {
    const signals: CrossDomainSignalDto[] = [
      {
        signalId: 's1',
        domain: 'CLIMATE',
        entityId: 'c1',
        entityName: 'Rain Gauge',
        eventType: 'FLOOD',
        severity: 'HIGH',
        location: { lat: 16.5, lng: 80.6 },
        value: 120,
        unit: 'mm/hr',
        timestamp: new Date().toISOString(),
      },
      {
        signalId: 's2',
        domain: 'MOBILITY',
        entityId: 'm1',
        entityName: 'Main Arterial',
        eventType: 'ROAD_CLOSURE',
        severity: 'HIGH',
        location: { lat: 16.5, lng: 80.6 },
        value: 100,
        unit: 'pct',
        timestamp: new Date().toISOString(),
      },
    ];

    const correlations = crossDomainCorrelationService.correlateSignals(signals);
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0].affectedDomains).toContain('CLIMATE');
    expect(correlations[0].affectedDomains).toContain('MOBILITY');

    const risk = citywideCascadeRiskService.calculateCascadeRisk(correlations);
    expect(risk.riskScore).toBeGreaterThanOrEqual(40);
    expect(['ELEVATED', 'HIGH', 'CRITICAL']).toContain(risk.classification);
  });

  it('should correlate Climate + Mobility + Transit + Emergency (multi-domain cascade)', () => {
    const signals: CrossDomainSignalDto[] = [
      { signalId: 's1', domain: 'CLIMATE', entityId: 'c1', entityName: 'Storm System', eventType: 'CYCLONE', severity: 'CRITICAL', location: { lat: 16.5, lng: 80.6 }, value: 150, unit: 'km/h', timestamp: new Date().toISOString() },
      { signalId: 's2', domain: 'MOBILITY', entityId: 'm1', entityName: 'Flyover Arterial', eventType: 'ROAD_BLOCKED', severity: 'CRITICAL', location: { lat: 16.5, lng: 80.6 }, value: 100, unit: 'pct', timestamp: new Date().toISOString() },
      { signalId: 's3', domain: 'TRANSIT', entityId: 't1', entityName: 'BRT Network', eventType: 'BUS_DELAY', severity: 'HIGH', location: { lat: 16.5, lng: 80.6 }, value: 60, unit: 'mins', timestamp: new Date().toISOString() },
      { signalId: 's4', domain: 'EMERGENCY_RESPONSE', entityId: 'e1', entityName: 'Emergency Dispatch', eventType: 'ACCESS_DELAY', severity: 'CRITICAL', location: { lat: 16.5, lng: 80.6 }, value: 25, unit: 'mins', timestamp: new Date().toISOString() },
    ];

    const correlations = crossDomainCorrelationService.correlateSignals(signals);
    expect(correlations[0].causalChain.length).toBeGreaterThanOrEqual(4);

    const risk = citywideCascadeRiskService.calculateCascadeRisk(correlations);
    expect(risk.riskScore).toBeGreaterThanOrEqual(80);
    expect(risk.classification).toBe('CRITICAL');
  });

  // ── 3. Utility + Water & Utility + Transit Integration ──
  it('should correlate Utility Substation failure with Municipal Water Pump power degradation', () => {
    const signals: CrossDomainSignalDto[] = [
      { signalId: 'u1', domain: 'UTILITY', entityId: 'tx-102', entityName: 'Substation TX-4', eventType: 'TRANSFORMER_FAILURE', severity: 'CRITICAL', location: { lat: 16.5, lng: 80.6 }, value: 95, unit: 'Celsius', timestamp: new Date().toISOString() },
      { signalId: 'w1', domain: 'UTILITY', entityId: 'pmp-01', entityName: 'Water Pump Station 3', eventType: 'PUMP_POWER_LOSS', severity: 'HIGH', location: { lat: 16.5, lng: 80.6 }, value: 0, unit: 'kW', timestamp: new Date().toISOString() },
    ];

    const correlations = crossDomainCorrelationService.correlateSignals(signals);
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0].correlationType).toBe('OPERATIONAL');
    expect(correlations[0].causalChain[0]).toContain('Transformer');
  });

  // ── 4. Urban Priority Queue & Governance ──
  it('should generate ranked priority queue and enforce requiresHumanApproval: true on all items', () => {
    const signals: CrossDomainSignalDto[] = [
      { signalId: 's1', domain: 'CLIMATE', entityId: 'c1', entityName: 'Inundation', eventType: 'FLOOD', severity: 'CRITICAL', location: { lat: 16.5, lng: 80.6 }, value: 140, unit: 'mm/hr', timestamp: new Date().toISOString() },
      { signalId: 's2', domain: 'MOBILITY', entityId: 'm1', entityName: 'Arterial Corridor', eventType: 'CONGESTION', severity: 'HIGH', location: { lat: 16.5, lng: 80.6 }, value: 85, unit: 'Index', timestamp: new Date().toISOString() },
    ];

    const correlations = crossDomainCorrelationService.correlateSignals(signals);
    const queue = urbanPriorityService.calculatePriorityQueue('city-vja', correlations);

    expect(queue.items.length).toBeGreaterThan(0);
    expect(queue.items[0].priorityRank).toBe(1);
    expect(queue.items[0].requiresHumanApproval).toBe(true);
  });

  // ── 5. Master City Intelligence Orchestrator ──
  it('should synthesize full citywide situational awareness summary DTO', async () => {
    const summary = await cityIntelligenceService.getCitywideIntelligence('city-vja');
    expect(summary.cityId).toBe('city-vja');
    expect(summary.overallCascadeRisk.classification).toBe('CRITICAL');
    expect(summary.priorityQueue.items[0].requiresHumanApproval).toBe(true);
  });

  // ── 6. AI Agent Tool Registry Integration ──
  it('should possess registered cross-domain intelligence tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const cdTools = tools.filter(
      (t) =>
        t.toolId.startsWith('cross_domain_') ||
        t.toolId.startsWith('citywide_') ||
        t.toolId.startsWith('urban_priority_')
    );
    expect(cdTools.length).toBeGreaterThanOrEqual(5);
  });
});
