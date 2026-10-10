// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.6 Public Transport Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryTransitRepository } from '../../lib/server/repositories/transit.repository';
import { transitTelemetryService } from '../../lib/server/services/transit-telemetry.service';
import { transitDisruptionService } from '../../lib/server/services/transit-disruption.service';
import { passengerDemandService } from '../../lib/server/services/passenger-demand.service';
import { transitPerformanceService } from '../../lib/server/services/transit-performance.service';
import { trafficTransitCorrelationService } from '../../lib/server/services/traffic-transit-correlation.service';
import { transitPredictionService } from '../../lib/server/services/transit-prediction.service';
import { transitOptimizationService } from '../../lib/server/services/transit-optimization.service';
import { multimodalEmergencyRouteService } from '../../lib/server/services/multimodal-emergency-route.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.6 — Public Transport & Multimodal Mobility Suite', () => {
  // ── 1. Telemetry & Repository ──
  it('should retrieve simulated vehicle telemetry and list transit routes', async () => {
    const telemetry = await transitTelemetryService.getVehicleTelemetry('vh-bus-101');
    expect(telemetry.dataSource).toBe('SIMULATION');

    const routes = await memoryTransitRepository.listRoutesByCityId('city-vja');
    expect(routes.length).toBeGreaterThan(0);
  });

  // ── 2. Disruptions & Passenger Demand ──
  it('should detect route disruptions and calculate passenger demand', async () => {
    const disruptions = await transitDisruptionService.detectDisruptions('city-vja');
    expect(disruptions.length).toBeGreaterThan(0);

    const demand = await passengerDemandService.calculatePassengerDemand('city-vja');
    expect(demand.length).toBeGreaterThan(0);
    expect(demand[0].demandLevel).toBe('OVERCAPACITY');
  });

  // ── 3. Performance & Correlation ──
  it('should calculate route performance and correlate traffic delays with transit', async () => {
    const perf = await transitPerformanceService.calculatePerformance('city-vja');
    expect(perf.length).toBeGreaterThan(0);

    const correlation = await trafficTransitCorrelationService.correlateTrafficAndTransit('city-vja');
    expect(correlation.passengerImpactEst).toBeGreaterThan(0);
  });

  // ── 4. Predictions, Optimization Approval & Emergency Routing ──
  it('should predict transit delays, approve recommendations, and calculate emergency routes', async () => {
    const predictions = await transitPredictionService.predictTransit('city-vja');
    expect(predictions.length).toBeGreaterThan(0);

    const approved = await transitOptimizationService.approveRecommendation('tr-rec-101');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.requiresHumanApproval).toBe(true);

    const route = await multimodalEmergencyRouteService.calculateEmergencyRoute('Benz Circle', 'Hospital', 'city-vja');
    expect(route.timeSavedMinutes).toBeGreaterThan(0);
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered transit intelligence tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const transitTools = tools.filter((t) => t.toolId.includes('transit') || t.toolId.includes('multimodal') || t.toolId.includes('passenger'));
    expect(transitTools.length).toBeGreaterThanOrEqual(13);
  });
});
