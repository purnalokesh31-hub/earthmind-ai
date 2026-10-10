import { describe, it, expect } from 'vitest';
import { tracingService } from '../../lib/server/observability/tracing.service';
import { metricsRegistryService } from '../../lib/server/observability/metrics.service';
import { alertingEngineService } from '../../lib/server/observability/alerting.service';

describe('Phase 6.5.8 — Enterprise Observability Platform', () => {
  // ── OpenTelemetry Distributed Tracing ──
  describe('Distributed Tracing & Span Lifecycle', () => {
    it('should start and end OpenTelemetry spans with trace ID context', async () => {
      const span = tracingService.startSpan('evidence_ocr_extraction', 'trace-custom-999', { evidenceId: 'evd-101' });
      expect(span.spanId).toContain('span-');
      expect(span.traceId).toBe('trace-custom-999');

      await new Promise((r) => setTimeout(r, 10));
      const endedSpan = await tracingService.endSpan(span.spanId);
      expect(endedSpan.endTime).toBeDefined();
      expect(endedSpan.durationMs).toBeGreaterThanOrEqual(5);
    });

    it('should throw error when ending non-existent span', async () => {
      await expect(tracingService.endSpan('invalid-span-id')).rejects.toThrow('not found');
    });

    it('should assign auto-generated trace ID when omitted', () => {
      const span = tracingService.startSpan('auto_trace_span');
      expect(span.traceId).toContain('trace-');
    });
  });

  // ── Prometheus Metrics Export ──
  describe('Prometheus Metrics Registry', () => {
    it('should record histogram durations and gauges', () => {
      metricsRegistryService.recordHistogram('upload_duration', 0.022);
      metricsRegistryService.setGauge('queue_size', 5);
      metricsRegistryService.incrementCounter('upload_count', 1);

      const prometheusOutput = metricsRegistryService.generatePrometheusExport();
      expect(prometheusOutput).toContain('earthmind_upload_duration_seconds');
      expect(prometheusOutput).toContain('earthmind_ocr_duration_seconds');
      expect(prometheusOutput).toContain('earthmind_queue_size_total');
      expect(prometheusOutput).toContain('earthmind_memory_bytes');
    });

    it('should export CPU utilization ratio metric', () => {
      metricsRegistryService.setGauge('cpu_ratio', 0.25);
      const output = metricsRegistryService.generatePrometheusExport();
      expect(output).toContain('earthmind_cpu_utilization_ratio');
    });

    it('should export worker count metric', () => {
      metricsRegistryService.setGauge('worker_count', 16);
      const output = metricsRegistryService.generatePrometheusExport();
      expect(output).toContain('earthmind_worker_count_active');
    });
  });

  // ── Alerting Engine ──
  describe('Alerting Engine & Threshold Triggers', () => {
    it('should trigger alert when metric exceeds threshold', () => {
      const alert = alertingEngineService.evaluateRule('High CPU Utilization', 95, 80, 'CRITICAL');
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('CRITICAL');
      expect(alert?.metricValue).toBe(95);

      const activeAlerts = alertingEngineService.getActiveAlerts();
      expect(activeAlerts.length).toBeGreaterThan(0);
    });

    it('should not trigger alert when metric is within safe threshold', () => {
      const alert = alertingEngineService.evaluateRule('Memory Usage Normal', 40, 80, 'WARNING');
      expect(alert).toBeNull();
    });

    it('should evaluate storage full warning threshold', () => {
      const alert = alertingEngineService.evaluateRule('Storage Capacity Warning', 92, 90, 'WARNING');
      expect(alert).not.toBeNull();
      expect(alert?.ruleName).toBe('Storage Capacity Warning');
    });

    it('should evaluate AI failure rate threshold', () => {
      const alert = alertingEngineService.evaluateRule('AI Model Failure Surge', 15, 5, 'CRITICAL');
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('CRITICAL');
    });

    it('should evaluate OCR failure threshold', () => {
      const alert = alertingEngineService.evaluateRule('OCR Engine Timeout Surge', 8, 3, 'WARNING');
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('WARNING');
    });
  });
});
