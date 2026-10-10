// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 6.10 Predictive Intelligence Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryPredictionRepository, memoryWarningRepository } from '../../lib/server/repositories/prediction.repository';
import { predictiveRiskEngine } from '../../lib/server/services/predictive-risk.engine';
import { earlyWarningService } from '../../lib/server/services/early-warning.service';
import { predictionFeedbackService } from '../../lib/server/services/prediction-feedback.service';

describe('Phase 6.10 — Predictive Intelligence & Early Warning Suite', () => {
  // ── 1. Prediction Generation & Weighted Risk Scoring ──
  it('should generate predictive risk forecast with weighted contributing factors', async () => {
    const pred = await predictiveRiskEngine.generatePrediction({
      type: 'FLOOD_RISK',
      geographicScopeLevel: 'ZONE',
      geographicScopeId: 'zone-w12',
      geographicScopeName: 'Vijayawada Ward 12',
      predictionWindow: 'NEXT_24_HOURS',
    });

    expect(pred.id).toBeDefined();
    expect(pred.type).toBe('FLOOD_RISK');
    expect(pred.riskScore).toBeGreaterThanOrEqual(0);
    expect(pred.riskScore).toBeLessThanOrEqual(100);
    expect(pred.contributingFactors.length).toBeGreaterThan(0);
    expect(pred.dataFreshness).toBeDefined();
  });

  // ── 2. Early Warning Threshold Evaluation ──
  it('should generate CRITICAL early warning when risk score exceeds threshold', async () => {
    const pred = await memoryPredictionRepository.findById('pred-101');
    expect(pred).not.toBeNull();

    if (pred) {
      const warning = await earlyWarningService.evaluateAndCreateWarning(pred);
      expect(warning).not.toBeNull();
      expect(warning?.warningLevel).toBe('CRITICAL');
      expect(warning?.message).toContain('78%');
    }
  });

  // ── 3. Prediction Feedback & Accuracy Calculation ──
  it('should record prediction feedback and compute prediction accuracy percentage', async () => {
    const fb = await predictionFeedbackService.recordFeedback({
      predictionId: 'pred-101',
      actualIncidentsCount: 3,
      reviewedBy: 'commander@earthmind.gov',
      notes: '3 water leakage incidents verified in Ward 12 during 24h window.',
    });

    expect(fb.id).toBeDefined();
    expect(fb.predictedRisk).toBe(82);
    expect(fb.actualRisk).toBe(75);
    expect(fb.predictionAccuracy).toBe(93); // 100 - |82 - 75| = 93%
    expect(fb.falsePositive).toBe(false);
    expect(fb.falseNegative).toBe(false);
  });

  // ── 4. Active Warnings Repository ──
  it('should list active early warnings', async () => {
    const warnings = await memoryWarningRepository.listActive();
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].warningLevel).toBe('CRITICAL');
  });
});
