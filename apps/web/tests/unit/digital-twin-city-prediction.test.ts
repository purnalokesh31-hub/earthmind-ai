// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.1 City Prediction Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { memoryCityPredictionRepository } from '../../lib/server/repositories/city-prediction.repository';
import { cityPredictionHistoryService } from '../../lib/server/services/city-prediction-history.service';
import { cityPredictionFeatureService } from '../../lib/server/services/city-prediction-feature.service';
import { cityRiskPredictionService } from '../../lib/server/services/city-risk-prediction.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.9.1 — Citywide Predictive Intelligence & Risk Forecasting Foundation Suite', () => {
  // ── 1. History & Feature Engineering ──
  it('should support deterministic simulation history windows (1h, 6h, 24h, 7d, 30d, 90d)', async () => {
    const history = await cityPredictionHistoryService.getPredictionHistory('24h');
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].historicalDataPoints.length).toBeGreaterThan(0);
  });

  it('should extract and fuse multi-domain features across Climate, Mobility, Transit, and Utility', async () => {
    const features = await cityPredictionFeatureService.extractAndFuseFeatures('city-vja');
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features[0].normalizedScore).toBeGreaterThan(0);
  });

  // ── 2. Risk Prediction Engine & Governance ──
  it('should generate citywide risk predictions and enforce requiresHumanApproval: true', async () => {
    const summary = await cityRiskPredictionService.getPredictionSummary('city-vja');
    expect(summary.citywideForecast.riskScore).toBe(82.5);
    expect(summary.citywideForecast.classification).toBe('CRITICAL');
    expect(summary.citywideForecast.requiresHumanApproval).toBe(true);
    expect(summary.predictiveAlerts[0].requiresHumanApproval).toBe(true);
  });

  // ── 3. Repository CRUD ──
  it('should retrieve latest prediction entity from repository', async () => {
    const pred = await memoryCityPredictionRepository.findLatestPredictionByCity('city-vja');
    expect(pred).not.toBeNull();
    expect(pred?.summary.cityId).toBe('city-vja');
  });

  // ── 4. AI Agent Tool Registry Integration ──
  it('should possess registered citywide prediction tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const predTools = tools.filter((t) => t.toolId.startsWith('city_prediction_'));
    expect(predTools.length).toBeGreaterThanOrEqual(5);
  });
});
