// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 5: AI & Resilience Scoring Sensitivity Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { cityResilienceScoreService } from '@/lib/server/services/city-resilience-score.service';
import { predictiveRiskEngine } from '@/lib/server/services/predictive-risk.engine';

describe('TASK 5 — AI & Resilience Scoring Sensitivity Suite', () => {
  describe('1. City Resilience Score Dynamic Calculation', () => {
    it('calculates score dynamically bounded between 0 and 100', async () => {
      const scoreData = cityResilienceScoreService.calculateCityResilienceScore('city-vja');

      expect(scoreData.resilienceScore).toBeGreaterThanOrEqual(0);
      expect(scoreData.resilienceScore).toBeLessThanOrEqual(100);
      expect(scoreData.contributingFactors).toBeDefined();
      expect(scoreData.dataSource).toBeDefined();
    });

    it('produces score changes in response to varying city incident profiles', async () => {
      const baseScore = cityResilienceScoreService.calculateCityResilienceScore('city-vja');
      const simulatedCrisisScore = cityResilienceScoreService.calculateCityResilienceScore('city-vja', {
        activeIncidentsCount: 15,
        criticalIncidentsCount: 5,
        preparedness: 40,
      });

      expect(simulatedCrisisScore.resilienceScore).toBeLessThan(baseScore.resilienceScore);
    });
  });

  describe('2. Predictive Risk Engine Sensitivity & Explainability', () => {
    it('produces higher risk score for high density and high recurrence inputs', async () => {
      const lowRisk = await predictiveRiskEngine.generatePrediction({
        type: 'FLOOD_RISK',
        geographicScopeLevel: 'CITY',
        geographicScopeId: 'vja-01',
        geographicScopeName: 'Vijayawada Low',
        recentIncidentDensity: 2,
        historicalIncidentCount: 1,
        aiVisionConfidence: 80,
        infrastructureAgeYears: 5,
      });

      const highRisk = await predictiveRiskEngine.generatePrediction({
        type: 'FLOOD_RISK',
        geographicScopeLevel: 'CITY',
        geographicScopeId: 'vja-02',
        geographicScopeName: 'Vijayawada High',
        recentIncidentDensity: 95,
        historicalIncidentCount: 20,
        aiVisionConfidence: 95,
        infrastructureAgeYears: 45,
      });

      expect(highRisk.riskScore).toBeGreaterThan(lowRisk.riskScore);
      expect(highRisk.riskScore).toBeLessThanOrEqual(100);
      expect(lowRisk.riskScore).toBeGreaterThanOrEqual(0);
      expect(highRisk.contributingFactors).toBeDefined();
      expect(highRisk.contributingFactors.length).toBeGreaterThan(0);
    });
  });
});
