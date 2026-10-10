import { describe, it, expect } from 'vitest';
import { workerPoolService } from '../../lib/server/scaling/worker-pool.service';
import { streamProcessingService } from '../../lib/server/scaling/stream-processing.service';
import { loadBenchmarkingService } from '../../lib/server/scaling/benchmark.service';

describe('Phase 6.5.9 — Performance Optimization & Scalability', () => {
  // ── Worker Pool Auto-Scaling ──
  describe('Worker Pool Auto-Scaling Engine', () => {
    it('should scale UP workers when queue depth exceeds ratio threshold', () => {
      const metrics = workerPoolService.evaluateScaling(120);
      expect(metrics.autoScalingState).toBe('SCALING_UP');
      expect(metrics.activeWorkers).toBe(12);
    });

    it('should scale DOWN workers when queue depth decreases', () => {
      const metrics = workerPoolService.evaluateScaling(30);
      expect(metrics.autoScalingState).toBe('SCALING_DOWN');
      expect(metrics.activeWorkers).toBe(3);
    });

    it('should enforce min and max worker boundaries', () => {
      const minMetrics = workerPoolService.evaluateScaling(0);
      expect(minMetrics.activeWorkers).toBe(2);

      const maxMetrics = workerPoolService.evaluateScaling(5000);
      expect(maxMetrics.activeWorkers).toBe(32);
    });

    it('should return active worker count', () => {
      expect(workerPoolService.getActiveWorkerCount()).toBeGreaterThanOrEqual(2);
    });

    it('should maintain STABLE state when queue depth matches worker capacity', () => {
      workerPoolService.evaluateScaling(50);
      const metrics = workerPoolService.evaluateScaling(50);
      expect(metrics.autoScalingState).toBe('STABLE');
    });
  });

  // ── Stream Processing & Compression ──
  describe('Stream Processing & Payload Compression Engine', () => {
    it('should compress buffer payloads using Gzip stream compression', async () => {
      const originalText = 'EarthMind High Throughput Evidence Asset Payload Stream Data '.repeat(50);
      const buffer = Buffer.from(originalText, 'utf8');

      const result = await streamProcessingService.compressPayload(buffer);
      expect(result.compressedSizeBytes).toBeLessThan(result.originalSizeBytes);
      expect(result.compressionRatio).toBeGreaterThan(0);

      const decompressed = await streamProcessingService.decompressPayload(result.compressedBuffer);
      expect(decompressed.toString('utf8')).toBe(originalText);
    });

    it('should decompress compressed stream buffers without data loss', async () => {
      const buffer = Buffer.from('Compression Test Buffer String Data');
      const result = await streamProcessingService.compressPayload(buffer);
      const decompressed = await streamProcessingService.decompressPayload(result.compressedBuffer);
      expect(decompressed.toString('utf8')).toBe('Compression Test Buffer String Data');
    });
  });

  // ── Performance Benchmarks & Load Simulation ──
  describe('Performance Benchmarks & Enterprise Workload Simulation', () => {
    it('should run workload benchmark for 100 concurrent users', async () => {
      const metrics = await loadBenchmarkingService.runLoadBenchmark(100);
      expect(metrics.uploadSpeedMbPerSec).toBeGreaterThan(10);
      expect(metrics.ocrAvgDurationMs).toBeLessThan(500);
      expect(metrics.aiAvgDurationMs).toBeLessThan(1000);
      expect(metrics.searchQueryDurationMs).toBeLessThan(50);
      expect(metrics.queueThroughputPerSec).toBeGreaterThan(500);
      expect(metrics.passStatus).toBe(true);
    });

    it('should pass enterprise scalability target requirements', async () => {
      const metrics = await loadBenchmarkingService.runLoadBenchmark(500);
      expect(metrics.simulatedUsersCount).toBe(500);
      expect(metrics.passStatus).toBe(true);
    });

    it('should verify 10K uploads per day throughput capacity', async () => {
      const metrics = await loadBenchmarkingService.runLoadBenchmark(1000);
      expect(metrics.queueThroughputPerSec).toBe(1250);
    });
  });
});
