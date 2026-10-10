// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.3 Real-Time City Telemetry Ingestion & Streaming
// Domain Models, Telemetry Event Structures, DLQ and Streaming Metrics
// ──────────────────────────────────────────────────────────────

import { ProviderDomain } from './provider-gateway.domain';
import { Phase8ProvenanceSource, DataQualityState } from './city-data-provider.domain';
import { CrossDomainSignalDto } from './cross-domain.domain';

export interface CityTelemetryEvent {
  eventId: string;
  providerId: string;
  domain: ProviderDomain;
  cityId: string;
  zoneId: string;
  timestamp: string; // ISO 8601 UTC
  receivedAt: string; // ISO 8601 UTC
  signal: CrossDomainSignalDto;
  quality: DataQualityState;
  provenance: Phase8ProvenanceSource;
  correlationId: string;
  schemaVersion: string;
}

export interface DeadLetterEventDto {
  eventId: string;
  providerId: string;
  failureReason: string;
  timestamp: string;
  schemaVersion: string;
  rawEvent: any;
}

export interface TelemetryIngestionMetricsDto {
  totalEventsReceived: number;
  totalEventsNormalized: number;
  duplicateCount: number;
  outOfOrderCount: number;
  staleCount: number;
  rejectedCount: number;
  dlqCount: number;
  backpressureActive: boolean;
  eventRatePerSecond: number;
  activeBufferCapacityPct: number;
  generatedAt: string;
}

export interface TelemetryQualityStatsDto {
  freshCount: number;
  staleCount: number;
  unknownCount: number;
  invalidCount: number;
  dlqCount: number;
  freshnessRatioPct: number;
  generatedAt: string;
}
