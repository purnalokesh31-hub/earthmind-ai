// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.3 Real-Time Telemetry Ingestion Test Suite
// Ingestion Pipeline, Deduplication, Ordering, Backpressure & DLQ Verification
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { CityTelemetryIngestionService } from '../../lib/server/services/city-telemetry-ingestion.service';
import { InMemoryTelemetryStreamTransport } from '../../lib/server/services/telemetry-stream-transport.interface';
import { CrossDomainSignalDto } from '../../lib/server/domain/digital-twin/cross-domain.domain';
import { WEATHER_RAW_FIXTURE } from '../../lib/server/fixtures/connector-fixtures';

describe('Phase 8.3 Real-Time City Telemetry Ingestion Test Suite', () => {
  let ingestionService: CityTelemetryIngestionService;

  beforeEach(() => {
    ingestionService = new CityTelemetryIngestionService();
    ingestionService.clearBuffer();
  });

  // ── 1. Basic Ingestion & Event Normalization ──
  it('should accept raw signals, validate schema, and normalize into CityTelemetryEvent', async () => {
    const rawSignal: CrossDomainSignalDto = {
      signalId: 'sig-test-wth-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Weather Station 01',
      eventType: 'HEAVY_RAINFALL',
      severity: 'CRITICAL',
      location: { lat: 16.506, lng: 80.648, zoneId: 'zone-benz-circle' },
      value: 125.0,
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
      confidenceScore: 98,
    };

    const event = await ingestionService.ingestRawSignal('connector-weather-01', rawSignal, 'LIVE');

    expect(event.eventId).toBe('evt-sig-test-wth-01');
    expect(event.providerId).toBe('connector-weather-01');
    expect(event.quality).toBe('FRESH');
    expect(event.provenance).toBe('LIVE');
    expect(event.signal.value).toBe(125.0);
  });

  // ── 2. Event Deduplication Test ──
  it('should detect duplicate event IDs and reject repeat ingestions without creating duplicate signals', async () => {
    const rawSignal: CrossDomainSignalDto = {
      signalId: 'sig-dedup-01',
      domain: 'CLIMATE',
      entityId: 'WTH-01',
      entityName: 'Telemetry Sensor',
      eventType: 'RAINFALL',
      severity: 'HIGH',
      location: { lat: 16.5, lng: 80.6 },
      value: 80,
      unit: 'mm/hr',
      timestamp: new Date().toISOString(),
    };

    await ingestionService.ingestRawSignal('connector-weather-01', rawSignal);

    await expect(ingestionService.ingestRawSignal('connector-weather-01', rawSignal)).rejects.toThrow(
      /DUPLICATE_EVENT/
    );

    const metrics = ingestionService.getMetrics();
    expect(metrics.duplicateCount).toBe(1);
  });

  // ── 3. Stale Event Detection ──
  it('should flag events older than 60s as STALE data quality', async () => {
    const staleTime = new Date(Date.now() - 120000).toISOString();
    const staleSignal: CrossDomainSignalDto = {
      signalId: 'sig-stale-01',
      domain: 'MOBILITY',
      entityId: 'MOB-01',
      entityName: 'Telemetry Sensor',
      eventType: 'CONGESTION',
      severity: 'MEDIUM',
      location: { lat: 16.5, lng: 80.6 },
      value: 65,
      unit: '%',
      timestamp: staleTime,
    };

    const event = await ingestionService.ingestRawSignal('connector-traffic-01', staleSignal);

    expect(event.quality).toBe('STALE');
    const quality = ingestionService.getQualityStats();
    expect(quality.staleCount).toBe(1);
  });

  // ── 4. Out-of-Order Timestamp Sorting ──
  it('should detect out-of-order timestamps and maintain buffer in chronological sequence', async () => {
    const now = Date.now();
    const t1 = new Date(now).toISOString();
    const t2 = new Date(now - 30000).toISOString(); // Older out-of-order event

    await ingestionService.ingestRawSignal('provider-1', {
      signalId: 'sig-seq-1',
      domain: 'CLIMATE',
      entityId: 'E1',
      entityName: 'Telemetry Sensor',
      eventType: 'EVT1',
      severity: 'LOW',
      location: { lat: 16.5, lng: 80.6 },
      value: 10,
      unit: 'x',
      timestamp: t1,
    });

    await ingestionService.ingestRawSignal('provider-1', {
      signalId: 'sig-seq-2',
      domain: 'CLIMATE',
      entityId: 'E1',
      entityName: 'Telemetry Sensor',
      eventType: 'EVT2',
      severity: 'LOW',
      location: { lat: 16.5, lng: 80.6 },
      value: 20,
      unit: 'x',
      timestamp: t2,
    });

    const metrics = ingestionService.getMetrics();
    expect(metrics.outOfOrderCount).toBe(1);

    const recent = ingestionService.getRecentEvents('ALL');
    expect(new Date(recent[0].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(recent[1].timestamp).getTime());
  });

  // ── 5. Dead-Letter Queue (DLQ) for Invalid Payloads ──
  it('should route malformed or invalid raw signals to Dead-Letter Queue (DLQ)', async () => {
    const invalidSignal: any = {
      signalId: 'sig-invalid-01',
      domain: 'UTILITY',
      value: 'NOT_A_NUMBER', // Invalid value type
      timestamp: 'INVALID_DATE',
    };

    await expect(ingestionService.ingestRawSignal('connector-scada-01', invalidSignal)).rejects.toThrow(
      /INVALID_EVENT_SCHEMA/
    );

    const dlq = ingestionService.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].eventId).toBe('evt-sig-invalid-01');
    expect(dlq[0].failureReason).toContain('Invalid numerical signal value');
  });

  // ── 6. Streaming Transport Publishing ──
  it('should publish ingested telemetry events to streaming transport subscribers', async () => {
    const transport = ingestionService.getTransport();
    let receivedEvent: any = null;

    await transport.subscribe('telemetry.topic', async (event) => {
      receivedEvent = event;
    });

    const signal: CrossDomainSignalDto = {
      signalId: 'sig-stream-pub-01',
      domain: 'EMERGENCY_RESPONSE',
      entityId: 'EMG-01',
      entityName: 'Telemetry Sensor',
      eventType: 'AMBULANCE_DELAY',
      severity: 'HIGH',
      location: { lat: 16.5, lng: 80.6 },
      value: 25,
      unit: 'mins',
      timestamp: new Date().toISOString(),
    };

    await ingestionService.ingestRawSignal('connector-cad-01', signal);

    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent.eventId).toBe('evt-sig-stream-pub-01');
  });
});
