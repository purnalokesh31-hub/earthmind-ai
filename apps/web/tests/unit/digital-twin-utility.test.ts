// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.1 Smart Utility Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryUtilityRepository } from '../../lib/server/repositories/utility.repository';
import { utilityTelemetryService } from '../../lib/server/services/utility-telemetry.service';
import { utilityStateService } from '../../lib/server/services/utility-state.service';
import { utilityEventService } from '../../lib/server/services/utility-event.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.7.1 — Smart Utility Infrastructure Platform Suite', () => {
  // ── 1. Repository Queries & Assets ──
  it('should list utility assets by city and filter by utility type', async () => {
    const assets = await memoryUtilityRepository.listAssetsByCityId('city-vja');
    expect(assets.length).toBeGreaterThan(0);

    const electricityAssets = await memoryUtilityRepository.listAssetsByCityId('city-vja', 'ELECTRICITY');
    expect(electricityAssets.every((a) => a.utilityType === 'ELECTRICITY')).toBe(true);

    const waterAssets = await memoryUtilityRepository.listAssetsByCityId('city-vja', 'WATER');
    expect(waterAssets.every((a) => a.utilityType === 'WATER')).toBe(true);
  });

  // ── 2. Telemetry Provider Abstraction ──
  it('should retrieve simulated utility telemetry tagged as SIMULATION', async () => {
    const powerTelemetry = await utilityTelemetryService.getLatestTelemetry('ast-pow-tx-102');
    expect(powerTelemetry.length).toBeGreaterThan(0);
    expect(powerTelemetry[0].dataSource).toBe('SIMULATION');

    const waterTelemetry = await utilityTelemetryService.getLatestTelemetry('ast-wtr-pipe-202');
    expect(waterTelemetry.length).toBeGreaterThan(0);
    expect(waterTelemetry[0].dataSource).toBe('SIMULATION');
  });

  // ── 3. State & Event Engine ──
  it('should evaluate asset health score and log immutable utility events', async () => {
    const health = await utilityStateService.evaluateAssetHealth('ast-pow-tx-102');
    expect(health.assetName).toBeDefined();
    expect(health.state).toBe('CRITICAL');
    expect(health.recommendedAction).toBeDefined();

    const loggedEvent = await utilityEventService.logUtilityEvent(
      'ast-pow-tx-102',
      'Ward 12 Distribution Transformer TX-4',
      'ELECTRICITY',
      'TELEMETRY_ANOMALY',
      'CRITICAL',
      'Transformer core temperature over-limit alert'
    );
    expect(loggedEvent.eventId).toBeDefined();
  });

  // ── 4. AI Agent Tool Registry Integration ──
  it('should possess registered utility intelligence tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const utilityTools = tools.filter((t) => t.toolId.startsWith('utility_'));
    expect(utilityTools.length).toBeGreaterThanOrEqual(7);
  });
});
