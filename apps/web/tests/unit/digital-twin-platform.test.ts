// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.1 Urban Digital Twin Foundation Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryInfrastructureAssetRepository } from '../../lib/server/repositories/digital-twin.repository';
import { digitalTwinStateService } from '../../lib/server/services/digital-twin-state.service';
import { twinTelemetryService } from '../../lib/server/services/twin-telemetry.service';
import { digitalTwinEventService } from '../../lib/server/services/digital-twin-event.service';

describe('Phase 7.1 — Urban Digital Twin Foundation Suite', () => {
  // ── 1. Asset Registry & Repository ──
  it('should list and retrieve infrastructure assets by city ID', async () => {
    const assets = await memoryInfrastructureAssetRepository.listByCityId('city-vja');
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0].assetId).toBe('ast-rd-101');
  });

  // ── 2. State Engine ──
  it('should update asset operational status cleanly', async () => {
    const updated = await digitalTwinStateService.updateAssetStatus(
      'ast-trf-103',
      'DEGRADED',
      'Transformer load surge detected'
    );

    expect(updated.operationalStatus).toBe('DEGRADED');
  });

  // ── 3. Telemetry Ingestion ──
  it('should retrieve sensor telemetry readings from telemetry provider', async () => {
    const readings = await twinTelemetryService.getAssetTelemetry('ast-rd-101');
    expect(readings.length).toBeGreaterThan(0);
    expect(readings[0].type).toBe('WATER_LEVEL');
  });

  // ── 4. Digital Twin Event Engine ──
  it('should emit and query digital twin audit events', async () => {
    const evt = await digitalTwinEventService.emitEvent(
      'ast-rd-101',
      'ASSET_UPDATED',
      'Asset condition score updated'
    );

    expect(evt.eventId).toBeDefined();
    expect(evt.eventType).toBe('ASSET_UPDATED');

    const events = await digitalTwinEventService.listEvents('ast-rd-101');
    expect(events.length).toBeGreaterThan(0);
  });
});
