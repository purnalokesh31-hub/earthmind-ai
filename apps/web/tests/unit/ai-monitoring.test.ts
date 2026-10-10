import { describe, it, expect } from 'vitest';
import { aiMonitoringService } from '../../lib/server/ai/ai-monitoring.service';

describe('Phase 6.6.9 — Enterprise AI Monitoring & Observability Engine', () => {
  // ── Telemetry & Metric Recording ──
  describe('Inference Telemetry & System Probes', () => {
    it('should record inference execution telemetry and update latency moving averages', () => {
      const initialMetrics = aiMonitoringService.getSystemMetrics();
      const initialTotal = initialMetrics.totalPredictionsCount;

      aiMonitoringService.recordInference(15.2, true, 0.95);
      const updatedMetrics = aiMonitoringService.getSystemMetrics();

      expect(updatedMetrics.totalPredictionsCount).toBe(initialTotal + 1);
      expect(updatedMetrics.inferenceTimeMs).toBeGreaterThan(0);
    });

    it('should record low-confidence predictions and update low confidence counter', () => {
      const initialLowConf = aiMonitoringService.getSystemMetrics().lowConfidenceCount;
      aiMonitoringService.recordInference(22.0, true, 0.55); // < 0.70

      expect(aiMonitoringService.getSystemMetrics().lowConfidenceCount).toBe(initialLowConf + 1);
    });
  });

  // ── Data Drift & Observability Export ──
  describe('Concept Drift Detection & Telemetry Export', () => {
    it('should detect data drift when feature distribution shifts significantly', () => {
      const shiftedDistribution = [0.95, 0.98, 0.92, 0.99, 0.91]; // High shift
      const driftResult = aiMonitoringService.detectDataDrift(shiftedDistribution);

      expect(driftResult.driftDetected).toBe(true);
      expect(driftResult.score).toBeGreaterThan(0.35);
      expect(aiMonitoringService.getSystemMetrics().driftDetected).toBe(true);
    });

    it('should export Prometheus format metric text', () => {
      const metricsText = aiMonitoringService.generatePrometheusMetrics();

      expect(metricsText).toContain('earthmind_ai_inference_time_ms');
      expect(metricsText).toContain('earthmind_ai_gpu_memory_mb');
      expect(metricsText).toContain('earthmind_ai_predictions_total');
    });

    it('should generate Grafana dashboard JSON specification with 4 monitoring panels', () => {
      const grafanaSpec = aiMonitoringService.generateGrafanaSpec();

      expect(grafanaSpec.title).toContain('EarthMind PIOS');
      expect(grafanaSpec.panels.length).toBe(4);
      expect(grafanaSpec.panels[0].promql).toContain('earthmind_ai_predictions_total');
    });
  });
});
