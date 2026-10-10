import { describe, it, expect } from 'vitest';
import { detectionEngineService } from '../../lib/server/ai/detection-engine.service';

describe('Phase 6.6.3 — Multi-Model AI Detection Platform Engine', () => {
  // ── Multi-Task Inference Execution ──
  describe('Detection Task Types & Model Architectures', () => {
    it('should execute Object Detection via YOLOv8 engine', async () => {
      const mockTensor = Buffer.alloc(640 * 640 * 3);
      const result = await detectionEngineService.executeDetection(mockTensor, 'OBJECT_DETECTION', 'YOLOv8');

      expect(result.architecture).toBe('YOLOv8');
      expect(result.taskType).toBe('OBJECT_DETECTION');
      expect(result.targetsFound.length).toBeGreaterThan(0);
      expect(result.targetsFound[0].target).toBe('POTHOLE');
      expect(result.targetsFound[0].boundingBox).toBeDefined();
    });

    it('should execute Instance Segmentation via FastSAM / SAM model', async () => {
      const mockTensor = Buffer.alloc(640 * 640 * 3);
      const result = await detectionEngineService.executeDetection(mockTensor, 'INSTANCE_SEGMENTATION', 'FastSAM');

      expect(result.architecture).toBe('FastSAM');
      expect(result.taskType).toBe('INSTANCE_SEGMENTATION');
      expect(result.targetsFound[0].segmentationPolygon).toBeDefined();
      expect(result.targetsFound[0].segmentationPolygon!.length).toBeGreaterThan(0);
    });

    it('should execute Detection via RT-DETR Transformer model', async () => {
      const mockTensor = Buffer.alloc(640 * 640 * 3);
      const result = await detectionEngineService.executeDetection(mockTensor, 'OBJECT_DETECTION', 'RT_DETR');

      expect(result.architecture).toBe('RT_DETR');
      expect(result.targetsFound.length).toBeGreaterThan(0);
    });

    it('should execute Multi-Label Classification and return domain tags', async () => {
      const mockTensor = Buffer.alloc(640 * 640 * 3);
      const result = await detectionEngineService.executeDetection(mockTensor, 'MULTI_LABEL_CLASSIFICATION', 'YOLOv11');

      expect(result.architecture).toBe('YOLOv11');
      expect(result.multiLabelTags).toContain('infrastructure_hazard');
    });

    it('should measure execution time for real-time vision inference', async () => {
      const mockTensor = Buffer.alloc(640 * 640 * 3);
      const result = await detectionEngineService.executeDetection(mockTensor);

      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.executionTimeMs).toBeLessThan(100);
    });
  });
});
