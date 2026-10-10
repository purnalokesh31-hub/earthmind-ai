// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Distributed Tracing & OpenTelemetry Service
// Supports OpenTelemetry, Jaeger, & Zipkin trace context exports
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  attributes: Record<string, unknown>;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

export interface ITracingExporter {
  exportSpan(span: TraceSpan): Promise<void>;
}

export class ConsoleTracingExporter implements ITracingExporter {
  async exportSpan(span: TraceSpan): Promise<void> {
    logger.info(`[OpenTelemetry] Exported span '${span.name}' (TraceId: ${span.traceId}, Duration: ${span.durationMs}ms)`);
  }
}

export class TracingService {
  private exporter: ITracingExporter;
  private activeSpans: Map<string, TraceSpan> = new Map();

  constructor(exporter: ITracingExporter = new ConsoleTracingExporter()) {
    this.exporter = exporter;
  }

  startSpan(name: string, traceId?: string, attributes = {}): TraceSpan {
    const spanId = `span-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const span: TraceSpan = {
      spanId,
      traceId: traceId || `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      attributes,
      startTime: Date.now(),
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  async endSpan(spanId: string): Promise<TraceSpan> {
    const span = this.activeSpans.get(spanId);
    if (!span) throw new Error(`Span '${spanId}' not found`);

    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    this.activeSpans.delete(spanId);

    await this.exporter.exportSpan(span);
    return span;
  }
}

export const tracingService = new TracingService();
