// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.5 Urban Mobility Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryMobilityRepository } from '../../lib/server/repositories/mobility.repository';
import { mobilityTelemetryService } from '../../lib/server/services/mobility-telemetry.service';
import { congestionDetectionService } from '../../lib/server/services/congestion-detection.service';
import { trafficBottleneckService } from '../../lib/server/services/traffic-bottleneck.service';
import { incidentMobilityCorrelationService } from '../../lib/server/services/incident-mobility-correlation.service';
import { trafficPredictionService } from '../../lib/server/services/traffic-prediction.service';
import { trafficOptimizationService } from '../../lib/server/services/traffic-optimization.service';
import { emergencyRouteService } from '../../lib/server/services/emergency-route.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.5 — Urban Mobility & Traffic Intelligence Suite', () => {
  // ── 1. Telemetry & Repository ──
  it('should retrieve simulated telemetry and list road segments', async () => {
    const telemetry = await mobilityTelemetryService.getSegmentTelemetry('seg-rd-101');
    expect(telemetry.dataSource).toBe('SIMULATION');

    const segments = await memoryMobilityRepository.listSegmentsByCityId('city-vja');
    expect(segments.length).toBeGreaterThan(0);
  });

  // ── 2. Congestion & Bottleneck Detection ──
  it('should detect congestion events and identify bottlenecks', async () => {
    const events = await congestionDetectionService.detectCongestionEvents('city-vja');
    expect(events.length).toBeGreaterThan(0);

    const bottlenecks = await trafficBottleneckService.identifyBottlenecks('city-vja');
    expect(bottlenecks.length).toBeGreaterThan(0);
  });

  // ── 3. Incident Correlation & Prediction ──
  it('should correlate incidents with traffic and generate predictions', async () => {
    const correlation = await incidentMobilityCorrelationService.correlateIncidentWithTraffic('inc-101', 'city-vja');
    expect(correlation.trafficDelayDeltaMinutes).toBeGreaterThan(0);

    const predictions = await trafficPredictionService.predictCongestion('city-vja');
    expect(predictions.length).toBeGreaterThan(0);
  });

  // ── 4. Optimization Approval & Emergency Routing ──
  it('should approve mobility recommendations and calculate emergency routes', async () => {
    const approved = await trafficOptimizationService.approveRecommendation('mob-rec-101');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.requiresHumanApproval).toBe(true);

    const route = await emergencyRouteService.calculateEmergencyRoute('Benz Circle', 'Hospital', 'city-vja');
    expect(route.timeSavedMinutes).toBeGreaterThan(0);
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered mobility intelligence tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const mobilityTools = tools.filter((t) => t.toolId.includes('traffic') || t.toolId.includes('mobility') || t.toolId.includes('emergency_route'));
    expect(mobilityTools.length).toBeGreaterThanOrEqual(9);
  });
});
