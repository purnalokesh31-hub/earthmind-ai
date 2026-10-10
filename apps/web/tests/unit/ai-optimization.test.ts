import { describe, it, expect } from 'vitest';
import { aiOptimizationService } from '../../lib/server/ai/ai-optimization.service';

describe('Phase 6.6.8 — AI Optimization & Tensor Execution Engine', () => {
  // ── TensorRT FP16 & INT8 Benchmarking ──
  describe('TensorRT Acceleration & Precision Formats', () => {
    it('should benchmark TensorRT FP16 execution yielding 2.0x quantization gain', async () => {
      const benchmark = await aiOptimizationService.runOptimizationBenchmark({
        runtime: 'TENSOR_RT',
        precision: 'FP16',
        enableDynamicBatching: false,
        maxBatchSize: 8,
        gpuDeviceIndex: 0,
        memoryPoolLimitMb: 4096,
      });

      expect(benchmark.profile.precision).toBe('FP16');
      expect(benchmark.quantizationGainRatio).toBe(2.0);
      expect(benchmark.latencyP50Ms).toBeLessThan(10);
      expect(benchmark.fps).toBeGreaterThan(80);
    });

    it('should benchmark TensorRT INT8 quantized execution yielding 4.0x gain and reduced VRAM', async () => {
      const benchmark = await aiOptimizationService.runOptimizationBenchmark({
        runtime: 'TENSOR_RT',
        precision: 'INT8',
        enableDynamicBatching: true,
        maxBatchSize: 16,
        gpuDeviceIndex: 0,
        memoryPoolLimitMb: 2048,
      });

      expect(benchmark.profile.precision).toBe('INT8');
      expect(benchmark.quantizationGainRatio).toBe(4.0);
      expect(benchmark.latencyP50Ms).toBeLessThan(5);
      expect(benchmark.gpuMemoryUsedMb).toBeLessThan(2000);
      expect(benchmark.fps).toBeGreaterThan(150);
    });
  });

  // ── Dynamic Batching & CPU OpenVINO Fallback ──
  describe('Dynamic Tensor Batching & OpenVINO CPU Fallback', () => {
    it('should split array of image tensors into dynamic batches of maxBatchSize', () => {
      const buffers = Array.from({ length: 25 }, (_, i) => Buffer.from(`Tensor ${i}`));
      const batches = aiOptimizationService.optimizeDynamicBatch(buffers, 8);

      expect(batches.length).toBe(4); // 8 + 8 + 8 + 1
      expect(batches[0].length).toBe(8);
      expect(batches[3].length).toBe(1);
    });

    it('should benchmark OpenVINO CPU fallback execution profile', async () => {
      const benchmark = await aiOptimizationService.runOptimizationBenchmark({
        runtime: 'OPENVINO_CPU',
        precision: 'FP32',
        enableDynamicBatching: false,
        maxBatchSize: 4,
        gpuDeviceIndex: -1,
        memoryPoolLimitMb: 1024,
      });

      expect(benchmark.profile.runtime).toBe('OPENVINO_CPU');
      expect(benchmark.cpuMemoryUsedMb).toBeLessThan(500);
      expect(benchmark.throughputReqPerSec).toBeGreaterThan(50);
    });

    it('should report comprehensive latency p50/p95 and throughput metrics', async () => {
      const benchmark = await aiOptimizationService.runOptimizationBenchmark({
        runtime: 'ONNX_RUNTIME',
        precision: 'FP16',
        enableDynamicBatching: true,
        maxBatchSize: 16,
        gpuDeviceIndex: 1,
        memoryPoolLimitMb: 4096,
      });

      expect(benchmark.latencyP95Ms).toBeGreaterThan(benchmark.latencyP50Ms);
      expect(benchmark.throughputReqPerSec).toBeGreaterThan(0);
      expect(benchmark.gpuUtilizationPercent).toBeGreaterThan(0);
    });
  });
});
