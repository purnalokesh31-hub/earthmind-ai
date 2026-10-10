import { describe, it, expect } from 'vitest';
import { explainableAiService } from '../../lib/server/ai/explainable-ai.service';

describe('Phase 6.6.6 — Explainable AI (XAI) Platform Engine', () => {
  // ── Grad-CAM & Feature Attribution ──
  describe('Grad-CAM Activation Maps & Feature Importance', () => {
    it('should generate 8x8 Grad-CAM activation heatmap matrix for evidence asset', () => {
      const report = explainableAiService.generateXaiReport(
        'pred-101',
        'evd-501',
        'POTHOLE',
        0.94
      );

      expect(report.gradCamMap.gridDimensions).toEqual({ width: 8, height: 8 });
      expect(report.gradCamMap.activationMatrix.length).toBe(8);
      expect(report.gradCamMap.activationMatrix[0].length).toBe(8);
      expect(report.gradCamMap.dominantActivationRegion).toBeDefined();
    });

    it('should extract top feature importance attribution factors', () => {
      const report = explainableAiService.generateXaiReport(
        'pred-102',
        'evd-502',
        'ROAD_CRACK',
        0.91
      );

      expect(report.featureImportance.length).toBe(3);
      expect(report.featureImportance[0].featureName).toContain('Edge Sharpness');
      expect(report.featureImportance[0].importanceWeight).toBe(0.42);
    });
  });

  // ── Confidence Decomposition & Risk Indices ──
  describe('Confidence Decomposition & Human Review Flags', () => {
    it('should decompose raw confidence into spatial, lighting, and resolution scores', () => {
      const report = explainableAiService.generateXaiReport(
        'pred-103',
        'evd-503',
        'FLOOD',
        0.88
      );

      expect(report.confidenceDecomposition.rawModelProbability).toBe(0.88);
      expect(report.confidenceDecomposition.spatialStabilityScore).toBeGreaterThan(0.90);
      expect(report.confidenceDecomposition.compositeConfidence).toBeGreaterThan(0.85);
    });

    it('should flag human review recommended for low-confidence predictions (< 0.75)', () => {
      const report = explainableAiService.generateXaiReport(
        'pred-104',
        'evd-504',
        'TREE_DAMAGE',
        0.62 // Low confidence
      );

      expect(report.humanReviewRecommended).toBe(true);
      expect(report.falsePositiveRiskIndex).toBeGreaterThan(15);
    });

    it('should generate natural language decision explanation text', () => {
      const report = explainableAiService.generateXaiReport(
        'pred-105',
        'evd-505',
        'FIRE',
        0.96
      );

      expect(report.decisionExplanationText).toContain('YOLOv8 deep vision model classified');
      expect(report.decisionExplanationText).toContain('96% confidence');
    });
  });
});
