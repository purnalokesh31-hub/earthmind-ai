import { describe, it, expect } from 'vitest';
import { modelLifecycleService, ModelLifecycleService } from '../../lib/server/ai/model-lifecycle.service';

describe('Phase 6.6.7 — Enterprise AI Model Lifecycle & Registry Platform', () => {
  // ── Registry & Versioning ──
  describe('Model Registry & Version Tracking', () => {
    it('should list pre-seeded active and canary models in registry', () => {
      const models = modelLifecycleService.listModels();
      expect(models.length).toBeGreaterThanOrEqual(2);
      expect(models.some((m) => m.deploymentStrategy === 'ACTIVE')).toBe(true);
      expect(models.some((m) => m.deploymentStrategy === 'CANARY')).toBe(true);
    });

    it('should register new candidate model with SHA-256 checksum and dataset version', () => {
      const newModel = modelLifecycleService.registerModel({
        modelId: 'yolov11-flood-v1',
        version: '11.0.1',
        architecture: 'YOLOv11',
        deploymentStrategy: 'SHADOW',
        trafficPercentage: 0,
        accuracy: 0.982,
        precision: 0.976,
        recall: 0.980,
        f1Score: 0.978,
        mAP50: 0.965,
        datasetVersion: 'earthmind-flood-v6.0',
        checksumSha256: '99e8a712bc09...',
        registeredAt: new Date().toISOString(),
      });

      expect(newModel.modelId).toBe('yolov11-flood-v1');
      expect(modelLifecycleService.getModel('yolov11-flood-v1')).toBeDefined();
    });
  });

  // ── Canary Routing & Rollback Engine ──
  describe('Canary Traffic Splitting & Rollback', () => {
    it('should update traffic split percentage for canary deployments', () => {
      const updated = modelLifecycleService.setTrafficSplit('yolov8-road-v3-canary', 25);
      expect(updated.trafficPercentage).toBe(25);
    });

    it('should execute instant zero-downtime rollback to target version', () => {
      const rolledBack = modelLifecycleService.triggerRollback(
        'yolov8-road-v3-canary',
        'yolov8-road-v2'
      );

      expect(rolledBack.deploymentStrategy).toBe('ACTIVE');
      expect(rolledBack.trafficPercentage).toBe(100);

      const archived = modelLifecycleService.getModel('yolov8-road-v3-canary');
      expect(archived?.deploymentStrategy).toBe('ARCHIVED');
      expect(archived?.trafficPercentage).toBe(0);
    });
  });

  // ── Performance Comparison Engine ──
  describe('Model Performance & Accuracy Benchmarking', () => {
    it('should compare accuracy and latency metrics between primary and candidate models', () => {
      const comparison = modelLifecycleService.compareModels('yolov8-road-v2', 'yolov11-flood-v1');

      expect(comparison.accuracyDelta).toBeGreaterThan(0);
      expect(comparison.latencyDeltaMs).toBeLessThan(0); // Faster
      expect(comparison.recommendation).toBe('PROMOTE_CANDIDATE');
    });
  });
});
