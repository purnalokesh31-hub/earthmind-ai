import { describe, it, expect } from 'vitest';
import { modelRegistry, ModelRegistry } from '../../lib/server/ai/model-registry';
import { inferencePipeline } from '../../lib/server/ai/inference-pipeline';
import { aiInferenceService } from '../../lib/server/ai/ai-inference.service';
import { aiHealthService } from '../../lib/server/ai/ai-health.service';

describe('Phase 6.6.1 — Enterprise AI Vision Platform Foundation', () => {
  // ── Model Registry ──
  describe('AI Model Registry & Engine Inspector', () => {
    it('should list pre-registered YOLOv8 & TensorRT vision models', () => {
      const models = modelRegistry.listModels();
      expect(models.length).toBeGreaterThanOrEqual(5);

      const roadModel = modelRegistry.getModel('yolov8-road-damage-v2');
      expect(roadModel?.framework).toBe('YOLOv8');
      expect(roadModel?.classes).toContain('pothole');
    });

    it('should allow registering new custom ONNX / PyTorch models', () => {
      const registry = new ModelRegistry();
      registry.registerModel({
        modelId: 'custom-leak-v1',
        name: 'Municipal Water Main Leak Detector',
        version: '1.0.0',
        domain: 'WATER_LEAKAGE',
        framework: 'ONNX_Runtime',
        confidenceThreshold: 0.8,
        classes: ['burst_pipe', 'water_gush'],
        inputDimensions: { width: 640, height: 640, channels: 3 },
        executionDevice: 'GPU_CUDA',
      });

      const found = registry.getModel('custom-leak-v1');
      expect(found).not.toBeNull();
      expect(found?.domain).toBe('WATER_LEAKAGE');
    });

    it('should find models by incident category domain', () => {
      const floodModels = modelRegistry.findModelsByDomain('FLOOD_DETECTION');
      expect(floodModels.length).toBeGreaterThan(0);
      expect(floodModels[0].classes).toContain('submerged_road');
    });

    it('should return null for unregistered model IDs', () => {
      expect(modelRegistry.getModel('non-existent-model')).toBeNull();
    });
  });

  // ── Preprocessing & Risk Assessment Pipeline ──
  describe('Inference Pipeline & Risk Engine', () => {
    it('should detect bounding boxes and calculate domain risk scores', () => {
      const model = modelRegistry.getModel('yolov8-road-damage-v2')!;
      const sampleBuffer = Buffer.from('Mock Image Tensor Data');

      const boxes = inferencePipeline.detectObjects(sampleBuffer, model);
      expect(boxes.length).toBeGreaterThan(0);

      const risk = inferencePipeline.calculateRisk(boxes, model.domain);
      expect(risk.riskScore).toBeGreaterThanOrEqual(10);
      expect(risk.riskScore).toBeLessThanOrEqual(100);
      expect(risk.recommendedDepartment).toContain('Public Works');
    });

    it('should assign CRITICAL severity for high risk scores', () => {
      const mockBoxes = [
        { xMin: 0, yMin: 0, xMax: 1, yMax: 1, label: 'major_collapse', confidence: 0.95, areaPercent: 35.0 },
      ];
      const risk = inferencePipeline.calculateRisk(mockBoxes, 'BUILDING_DAMAGE');
      expect(risk.severityCategory).toBe('CRITICAL');
      expect(risk.priorityLevel).toBe('P1');
    });

    it('should assign LOW severity for low confidence bounding boxes', () => {
      const mockBoxes = [
        { xMin: 0, yMin: 0, xMax: 0.1, yMax: 0.1, label: 'minor_crack', confidence: 0.2, areaPercent: 0.5 },
      ];
      const risk = inferencePipeline.calculateRisk(mockBoxes, 'ROAD_DAMAGE');
      expect(risk.severityCategory).toBe('LOW');
      expect(risk.priorityLevel).toBe('P4');
    });
  });

  // ── AI Inference Service ──
  describe('AI Vision Inference Service Execution', () => {
    it('should execute end-to-end vision inference on evidence asset', async () => {
      const mockBuffer = Buffer.from('Sample Image Asset Data');
      const result = await aiInferenceService.runInference('evd-vision-101', mockBuffer, 'yolov8-road-damage-v2');

      expect(result.inferenceId).toContain('inf-');
      expect(result.evidenceId).toBe('evd-vision-101');
      expect(result.detectedObjectsCount).toBeGreaterThan(0);
      expect(result.boundingBoxes.length).toBeGreaterThan(0);
      expect(result.riskAssessment.riskScore).toBeDefined();
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when running inference with non-existent model ID', async () => {
      const mockBuffer = Buffer.from('Sample Data');
      await expect(aiInferenceService.runInference('evd-101', mockBuffer, 'invalid-model')).rejects.toThrow('not found');
    });
  });

  // ── AI Health Diagnostics ──
  describe('AI Engine & GPU Health Probes', () => {
    it('should report healthy CUDA & TensorRT status', async () => {
      const health = await aiHealthService.inspectHealth();
      expect(health.status).toBe('HEALTHY');
      expect(health.cudaAvailable).toBe(true);
      expect(health.tensorRtEnabled).toBe(true);
      expect(health.gpuMemoryTotalMb).toBe(16384);
    });
  });
});
