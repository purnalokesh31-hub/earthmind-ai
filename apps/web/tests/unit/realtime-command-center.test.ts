// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.8 Real-Time Operational Intelligence Unit Specs
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { realTimeEventBusService } from '../../lib/server/events/realtime-event-bus.service';
import { commandCenterService } from '../../lib/server/services/command-center.service';

describe('Phase 6.8 — Real-Time Operational Intelligence & GIS Command Center Master Suite', () => {
  // ── 1. Real-Time Event Bus & Deduplication ──
  it('should publish operational events and prevent duplicate execution via idempotency key', () => {
    let receivedCount = 0;
    const unsubscribe = realTimeEventBusService.subscribe(() => {
      receivedCount++;
    });

    const evt1 = realTimeEventBusService.publish(
      {
        eventType: 'INCIDENT_CREATED',
        incidentId: 'inc-rt-1',
        incidentCode: 'EM-INC-RT-1',
        severity: 'CRITICAL',
        actor: 'Drone AI',
        message: 'Real-time hazard detected',
      },
      'idemp-key-999'
    );

    expect(evt1.eventId).toBeDefined();

    // Duplicate call with same key
    const evt2 = realTimeEventBusService.publish(
      {
        eventType: 'INCIDENT_CREATED',
        incidentId: 'inc-rt-1',
        incidentCode: 'EM-INC-RT-1',
        severity: 'CRITICAL',
        actor: 'Drone AI',
        message: 'Real-time hazard detected',
      },
      'idemp-key-999'
    );

    expect(evt2.eventId).toBe(evt1.eventId);
    unsubscribe();
  });

  // ── 2. Recent Events Feed Retrieval ──
  it('should retrieve recent event history from event bus service', () => {
    const events = realTimeEventBusService.getRecentEvents(10);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventId).toBeDefined();
  });

  // ── 3. Connection State Machine ──
  it('should return valid connection status indicator', () => {
    const state = realTimeEventBusService.getConnectionState();
    expect(['CONNECTED', 'RECONNECTING', 'OFFLINE']).toContain(state);
  });

  // ── 4. Command Center Live GIS Service Integration ──
  it('should retrieve live incidents with GIS coordinates and severity tags', async () => {
    const list = await commandCenterService.getLiveIncidents();
    expect(list.data.length).toBeGreaterThan(0);

    const first = list.data[0];
    expect(first.latitude).toBeDefined();
    expect(first.longitude).toBeDefined();
    expect(first.severity).toBeDefined();
  });
});
