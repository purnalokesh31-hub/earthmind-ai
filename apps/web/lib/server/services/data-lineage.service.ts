// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.4 End-to-End Data Lineage Service
// Full Traceability from External Provider -> Telemetry Event -> Intelligence -> Intervention
// ──────────────────────────────────────────────────────────────

import { DataLineageTraceDto } from '../domain/digital-twin/data-trust.domain';
import { Phase8ProvenanceSource, DataQualityState } from '../domain/digital-twin/city-data-provider.domain';
import { logger } from '../logger';

export class DataLineageService {
  private lineageRegistry: Map<string, DataLineageTraceDto> = new Map();

  public recordLineageTrace(trace: DataLineageTraceDto): void {
    this.lineageRegistry.set(trace.traceId, trace);
    // Also index by eventId and signalId
    this.lineageRegistry.set(`evt:${trace.eventId}`, trace);
    if (trace.decisionId) {
      this.lineageRegistry.set(`dec:${trace.decisionId}`, trace);
    }
    logger.info(`[DataLineage] Recorded trace '${trace.traceId}': provider=${trace.providerId} -> event=${trace.eventId} -> signal=${trace.signalId}`);
  }

  public getTraceById(traceOrEntityId: string): DataLineageTraceDto | null {
    if (this.lineageRegistry.has(traceOrEntityId)) {
      return this.lineageRegistry.get(traceOrEntityId)!;
    }
    if (this.lineageRegistry.has(`evt:${traceOrEntityId}`)) {
      return this.lineageRegistry.get(`evt:${traceOrEntityId}`)!;
    }
    if (this.lineageRegistry.has(`dec:${traceOrEntityId}`)) {
      return this.lineageRegistry.get(`dec:${traceOrEntityId}`)!;
    }
    return null;
  }

  public createSampleTrace(
    providerId: string = 'connector-doppler-weather-01',
    eventId: string = 'evt-sig-ext-wth-01',
    signalId: string = 'sig-ext-wth-01',
    provenance: Phase8ProvenanceSource = 'LIVE',
    qualityState: DataQualityState = 'FRESH',
    trustScorePct: number = 98.5
  ): DataLineageTraceDto {
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const trace: DataLineageTraceDto = {
      traceId,
      providerId,
      eventId,
      signalId,
      predictionId: `pred-flood-${Date.now()}`,
      simulationId: `sim-cascade-${Date.now()}`,
      decisionId: `dec-pumping-${Date.now()}`,
      interventionId: `int-microgrid-${Date.now()}`,
      provenance,
      dataQualityState: qualityState,
      trustScorePct,
      timestamp: new Date().toISOString(),
    };
    this.recordLineageTrace(trace);
    return trace;
  }

  public listAllTraces(limit: number = 20): DataLineageTraceDto[] {
    const uniqueTraces = new Set<DataLineageTraceDto>();
    for (const trace of Array.from(this.lineageRegistry.values())) {
      uniqueTraces.add(trace);
    }
    return Array.from(uniqueTraces.values()).slice(0, limit);
  }
}

export const dataLineageService = new DataLineageService();
